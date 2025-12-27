-- Create blocks table for the new block-based content system
-- This is separate from the full hierarchy schema for incremental deployment

-- First, add the new columns to existing tables if they don't exist
-- These are safe to run multiple times

-- Add columns to assignments table
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS answers_enabled BOOLEAN DEFAULT true;

-- Create blocks table
CREATE TABLE IF NOT EXISTS blocks (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id uuid REFERENCES assignments(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN (
        'text', 'image', 'video', 'multiple_choice', 'open_question',
        'fill_in_blank', 'drag_drop', 'ordering', 'media_embed', 'divider'
    )),
    position float NOT NULL DEFAULT 0,
    data jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blocks_assignment_id ON blocks(assignment_id);
CREATE INDEX IF NOT EXISTS idx_blocks_position ON blocks(assignment_id, position);

-- Create student_answers table for interactive blocks
CREATE TABLE IF NOT EXISTS student_answers (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    block_id uuid NOT NULL REFERENCES blocks(id) ON DELETE CASCADE,
    answer_data jsonb NOT NULL,
    is_correct boolean,
    score int,
    feedback text,
    graded_by_ai boolean DEFAULT false,
    graded_at timestamptz,
    submitted_at timestamptz DEFAULT now(),
    UNIQUE(student_id, block_id)
);

-- Create progress_snapshots table for precomputed progress
CREATE TABLE IF NOT EXISTS progress_snapshots (
    student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    paragraph_id uuid NOT NULL REFERENCES paragraphs(id) ON DELETE CASCADE,
    completion_percent int NOT NULL DEFAULT 0 CHECK (completion_percent >= 0 AND completion_percent <= 100),
    updated_at timestamptz DEFAULT now(),
    PRIMARY KEY (student_id, paragraph_id)
);

-- Create session_logs table for time tracking
CREATE TABLE IF NOT EXISTS session_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    paragraph_id uuid NOT NULL REFERENCES paragraphs(id) ON DELETE CASCADE,
    started_at timestamptz NOT NULL,
    finished_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_answers_student_id ON student_answers(student_id);
CREATE INDEX IF NOT EXISTS idx_student_answers_block_id ON student_answers(block_id);
CREATE INDEX IF NOT EXISTS idx_progress_snapshots_student_id ON progress_snapshots(student_id);
CREATE INDEX IF NOT EXISTS idx_session_logs_student_id ON session_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_session_logs_paragraph_id ON session_logs(paragraph_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on new tables
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blocks
DROP POLICY IF EXISTS "Class members can view blocks" ON blocks;
DROP POLICY IF EXISTS "Teachers can manage blocks" ON blocks;
DROP POLICY IF EXISTS "Students can manage their answers" ON student_answers;
DROP POLICY IF EXISTS "Teachers can view all answers" ON student_answers;
DROP POLICY IF EXISTS "Users can manage their progress" ON progress_snapshots;
DROP POLICY IF EXISTS "Teachers can view student progress" ON progress_snapshots;
DROP POLICY IF EXISTS "Users can manage their sessions" ON session_logs;
DROP POLICY IF EXISTS "Teachers can view student sessions" ON session_logs;

-- Blocks: accessible to class members
CREATE POLICY "Class members can view blocks" ON blocks FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM assignments a
        JOIN paragraphs p ON p.id = a.paragraph_id
        JOIN chapters ch ON ch.id = p.chapter_id
        JOIN subjects s ON s.id = ch.subject_id
        JOIN classes c ON c.id = s.class_id
        JOIN class_members cm ON cm.class_id = c.id
        WHERE a.id = blocks.assignment_id
        AND (c.owner_id = auth.uid() OR cm.user_id = auth.uid())
    )
);

CREATE POLICY "Teachers can manage blocks" ON blocks FOR ALL USING (
    EXISTS (
        SELECT 1 FROM assignments a
        JOIN paragraphs p ON p.id = a.paragraph_id
        JOIN chapters ch ON ch.id = p.chapter_id
        JOIN subjects s ON s.id = ch.subject_id
        JOIN classes c ON c.id = s.class_id
        WHERE a.id = blocks.assignment_id
        AND c.owner_id = auth.uid()
    )
);

-- Student answers: students can manage their own, teachers can view all
CREATE POLICY "Students can manage their answers" ON student_answers
    FOR ALL USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view all answers" ON student_answers FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM blocks b
        JOIN assignments a ON a.id = b.assignment_id
        JOIN paragraphs p ON p.id = a.paragraph_id
        JOIN chapters ch ON ch.id = p.chapter_id
        JOIN subjects s ON s.id = ch.subject_id
        JOIN classes c ON c.id = s.class_id
        WHERE b.id = student_answers.block_id
        AND c.owner_id = auth.uid()
    )
);

-- Progress snapshots: personal data
CREATE POLICY "Users can manage their progress" ON progress_snapshots
    FOR ALL USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view student progress" ON progress_snapshots FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM paragraphs p
        JOIN chapters ch ON ch.id = p.chapter_id
        JOIN subjects s ON s.id = ch.subject_id
        JOIN classes c ON c.id = s.class_id
        WHERE p.id = progress_snapshots.paragraph_id
        AND c.owner_id = auth.uid()
    )
);

-- Session logs: personal data
CREATE POLICY "Users can manage their sessions" ON session_logs
    FOR ALL USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view student sessions" ON session_logs FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM paragraphs p
        JOIN chapters ch ON ch.id = p.chapter_id
        JOIN subjects s ON s.id = ch.subject_id
        JOIN classes c ON c.id = s.class_id
        WHERE p.id = session_logs.paragraph_id
        AND c.owner_id = auth.uid()
    )
);

-- Function to update progress snapshots
CREATE OR REPLACE FUNCTION update_progress_snapshot(student_uuid uuid, paragraph_uuid uuid)
RETURNS void AS $$
DECLARE
    total_blocks int;
    completed_blocks int;
    completion_percent int;
BEGIN
    -- Count total interactive blocks in paragraph
    SELECT COUNT(*) INTO total_blocks
    FROM assignments a
    JOIN blocks b ON b.assignment_id = a.id
    WHERE a.paragraph_id = paragraph_uuid
    AND b.type IN ('multiple_choice', 'open_question', 'fill_in_blank', 'drag_drop', 'ordering');

    IF total_blocks = 0 THEN
        completion_percent := 100; -- No interactive content = complete
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

-- Trigger for auto-updating progress
CREATE OR REPLACE FUNCTION trigger_update_progress()
RETURNS trigger AS $$
BEGIN
    -- Find paragraph_id from the block that was answered
    PERFORM update_progress_snapshot(
        NEW.student_id,
        (SELECT a.paragraph_id FROM assignments a JOIN blocks b ON b.assignment_id = a.id WHERE b.id = NEW.block_id)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only create trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_progress_on_answer') THEN
        CREATE TRIGGER update_progress_on_answer
            AFTER INSERT OR UPDATE ON student_answers
            FOR EACH ROW EXECUTE FUNCTION trigger_update_progress();
    END IF;
END;
$$;