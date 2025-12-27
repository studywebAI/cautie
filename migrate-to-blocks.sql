-- Migration script to add block-based content system to existing Cautie database
-- Run this after the main schema is in place

-- This script assumes the following tables exist from the main schema:
-- classes, class_members, subjects, chapters, paragraphs, assignments

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add missing columns to existing tables (safe to run multiple times)
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS answers_enabled BOOLEAN DEFAULT true;

-- Create blocks table
CREATE TABLE IF NOT EXISTS blocks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id uuid NOT NULL,
    type text NOT NULL CHECK (type IN (
        'text', 'image', 'video', 'multiple_choice', 'open_question',
        'fill_in_blank', 'drag_drop', 'ordering', 'media_embed', 'divider'
    )),
    position float NOT NULL DEFAULT 0,
    data jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),

    CONSTRAINT fk_blocks_assignment FOREIGN KEY (assignment_id)
    REFERENCES assignments(id) ON DELETE CASCADE
);

-- Create student_answers table
CREATE TABLE IF NOT EXISTS student_answers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL,
    block_id uuid NOT NULL,
    answer_data jsonb NOT NULL,
    is_correct boolean,
    score int,
    feedback text,
    graded_by_ai boolean DEFAULT false,
    graded_at timestamptz,
    submitted_at timestamptz DEFAULT now(),

    CONSTRAINT fk_student_answers_student FOREIGN KEY (student_id)
    REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_student_answers_block FOREIGN KEY (block_id)
    REFERENCES blocks(id) ON DELETE CASCADE,
    UNIQUE(student_id, block_id)
);

-- Create progress_snapshots table
CREATE TABLE IF NOT EXISTS progress_snapshots (
    student_id uuid NOT NULL,
    paragraph_id uuid NOT NULL,
    completion_percent int NOT NULL DEFAULT 0 CHECK (completion_percent >= 0 AND completion_percent <= 100),
    updated_at timestamptz DEFAULT now(),

    CONSTRAINT fk_progress_student FOREIGN KEY (student_id)
    REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_progress_paragraph FOREIGN KEY (paragraph_id)
    REFERENCES paragraphs(id) ON DELETE CASCADE,
    PRIMARY KEY (student_id, paragraph_id)
);

-- Create session_logs table
CREATE TABLE IF NOT EXISTS session_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL,
    paragraph_id uuid NOT NULL,
    started_at timestamptz NOT NULL,
    finished_at timestamptz,
    created_at timestamptz DEFAULT now(),

    CONSTRAINT fk_session_student FOREIGN KEY (student_id)
    REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_session_paragraph FOREIGN KEY (paragraph_id)
    REFERENCES paragraphs(id) ON DELETE CASCADE
);

-- Add user_preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id uuid PRIMARY KEY,
    theme text DEFAULT 'pastel' CHECK (theme IN ('light', 'dark', 'pastel')),
    color_palette text DEFAULT 'default' CHECK (color_palette IN ('default', 'pastel-soft')),
    language text DEFAULT 'en' CHECK (language IN ('en', 'nl', 'de', 'fr', 'es', 'ru', 'zh')),
    updated_at timestamptz DEFAULT now(),

    CONSTRAINT fk_user_preferences_user FOREIGN KEY (user_id)
    REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blocks_assignment_id ON blocks(assignment_id);
CREATE INDEX IF NOT EXISTS idx_blocks_position ON blocks(assignment_id, position);
CREATE INDEX IF NOT EXISTS idx_student_answers_student_id ON student_answers(student_id);
CREATE INDEX IF NOT EXISTS idx_student_answers_block_id ON student_answers(block_id);
CREATE INDEX IF NOT EXISTS idx_progress_snapshots_student_id ON progress_snapshots(student_id);
CREATE INDEX IF NOT EXISTS idx_session_logs_student_id ON session_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_session_logs_paragraph_id ON session_logs(paragraph_id);

-- Enable RLS on new tables
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_preferences
DROP POLICY IF EXISTS "Users can manage their preferences" ON user_preferences;
CREATE POLICY "Users can manage their preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for blocks (simplified for now - will be updated when hierarchy is complete)
DROP POLICY IF EXISTS "Blocks are publicly accessible for now" ON blocks;
CREATE POLICY "Blocks are publicly accessible for now" ON blocks
    FOR ALL USING (true);

-- RLS Policies for student_answers
DROP POLICY IF EXISTS "Students can manage their answers" ON student_answers;
CREATE POLICY "Students can manage their answers" ON student_answers
    FOR ALL USING (auth.uid() = student_id);

-- RLS Policies for progress_snapshots
DROP POLICY IF EXISTS "Users can manage their progress" ON progress_snapshots;
CREATE POLICY "Users can manage their progress" ON progress_snapshots
    FOR ALL USING (auth.uid() = student_id);

-- RLS Policies for session_logs
DROP POLICY IF EXISTS "Users can manage their sessions" ON session_logs;
CREATE POLICY "Users can manage their sessions" ON session_logs
    FOR ALL USING (auth.uid() = student_id);

-- Progress update function
CREATE OR REPLACE FUNCTION update_progress_snapshot(student_uuid uuid, paragraph_uuid uuid)
RETURNS void AS $$
DECLARE
    total_blocks int := 0;
    completed_blocks int := 0;
    completion_percent int := 0;
BEGIN
    -- Count total interactive blocks in paragraph
    SELECT COUNT(*) INTO total_blocks
    FROM assignments a
    JOIN blocks b ON b.assignment_id = a.id
    WHERE a.paragraph_id = paragraph_uuid
    AND b.type IN ('multiple_choice', 'open_question', 'fill_in_blank', 'drag_drop', 'ordering');

    IF total_blocks = 0 THEN
        completion_percent := 100;
    ELSE
        -- Count completed blocks (with answers)
        SELECT COUNT(*) INTO completed_blocks
        FROM assignments a
        JOIN blocks b ON b.assignment_id = a.id
        LEFT JOIN student_answers sa ON sa.block_id = b.id AND sa.student_id = student_uuid
        WHERE a.paragraph_id = paragraph_uuid
        AND b.type IN ('multiple_choice', 'open_question', 'fill_in_blank', 'drag_drop', 'ordering')
        AND sa.id IS NOT NULL;

        completion_percent := LEAST(100, (completed_blocks * 100) / total_blocks);
    END IF;

    -- Insert or update snapshot
    INSERT INTO progress_snapshots (student_id, paragraph_id, completion_percent, updated_at)
    VALUES (student_uuid, paragraph_uuid, completion_percent, now())
    ON CONFLICT (student_id, paragraph_id)
    DO UPDATE SET
        completion_percent = EXCLUDED.completion_percent,
        updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Auto-update progress trigger
DROP TRIGGER IF EXISTS update_progress_on_answer ON student_answers;
CREATE TRIGGER update_progress_on_answer
    AFTER INSERT OR UPDATE ON student_answers
    FOR EACH ROW EXECUTE FUNCTION update_progress_snapshot(NEW.student_id,
        (SELECT a.paragraph_id FROM assignments a JOIN blocks b ON b.assignment_id = a.id WHERE b.id = NEW.block_id));

-- Insert sample data for testing (optional - remove in production)
-- This creates a sample block for testing the system
/*
INSERT INTO blocks (assignment_id, type, position, data)
SELECT
    a.id,
    'text',
    0,
    '{"content": "Welcome to the new block-based learning system!", "style": "heading"}'::jsonb
FROM assignments a
WHERE a.id = (SELECT id FROM assignments LIMIT 1)
ON CONFLICT DO NOTHING;
*/