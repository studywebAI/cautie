-- LearnBeat Hierarchical Learning Structure Schema
-- Complete replacement for current classes/materials structure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS progress_snapshots CASCADE;
DROP TABLE IF EXISTS session_logs CASCADE;
DROP TABLE IF EXISTS student_answers CASCADE;
DROP TABLE IF EXISTS blocks CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS paragraphs CASCADE;
DROP TABLE IF EXISTS chapters CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;

-- User preferences (themes, language, etc.)
CREATE TABLE user_preferences (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    theme text DEFAULT 'pastel' CHECK (theme IN ('light', 'dark', 'pastel')),
    color_palette text DEFAULT 'default' CHECK (color_palette IN ('default', 'pastel-soft')),
    language text DEFAULT 'en' CHECK (language IN ('en', 'nl', 'de', 'fr', 'es', 'ru', 'zh')),
    updated_at timestamptz DEFAULT now()
);

-- Subjects (replaces current class structure for learning content)
CREATE TABLE subjects (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    title text NOT NULL,
    class_label text,           -- e.g., "A2", "B1" for language levels
    cover_type text NOT NULL DEFAULT 'ai_icons' CHECK (cover_type IN ('image', 'ai_icons')),
    cover_image_url text,
    ai_icon_seed text,          -- deterministic seed for icon generation
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Chapters within subjects
CREATE TABLE chapters (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    chapter_number int NOT NULL,  -- auto-increment per subject
    title text NOT NULL,
    ai_summary text,
    summary_overridden boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),

    UNIQUE(subject_id, chapter_number)
);

-- Paragraphs within chapters
CREATE TABLE paragraphs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter_id uuid NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    paragraph_number int NOT NULL,  -- auto-increment per chapter
    title text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),

    UNIQUE(chapter_id, paragraph_number)
);

-- Assignments within paragraphs
CREATE TABLE assignments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    paragraph_id uuid NOT NULL REFERENCES paragraphs(id) ON DELETE CASCADE,
    assignment_index int NOT NULL,  -- 0=a, 1=b, 26=aa, etc.
    title text NOT NULL,
    answers_enabled boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),

    UNIQUE(paragraph_id, assignment_index)
);

-- Blocks within assignments (core content system)
CREATE TABLE blocks (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id uuid NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN (
        'text', 'image', 'video', 'multiple_choice', 'open_question',
        'fill_in_blank', 'drag_drop', 'ordering', 'media_embed', 'divider'
    )),
    position float NOT NULL,  -- for ordering between blocks
    data jsonb NOT NULL,      -- block-specific data
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Student answers for interactive blocks
CREATE TABLE student_answers (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    block_id uuid NOT NULL REFERENCES blocks(id) ON DELETE CASCADE,
    answer_data jsonb NOT NULL,
    is_correct boolean,
    score int,                    -- for AI-graded questions
    feedback text,                -- AI-generated feedback
    graded_by_ai boolean DEFAULT false,
    graded_at timestamptz,
    submitted_at timestamptz DEFAULT now(),

    UNIQUE(student_id, block_id)
);

-- Precomputed progress snapshots
CREATE TABLE progress_snapshots (
    student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    paragraph_id uuid NOT NULL REFERENCES paragraphs(id) ON DELETE CASCADE,
    completion_percent int NOT NULL DEFAULT 0 CHECK (completion_percent >= 0 AND completion_percent <= 100),
    updated_at timestamptz DEFAULT now(),

    PRIMARY KEY (student_id, paragraph_id)
);

-- Session logging for time tracking
CREATE TABLE session_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    paragraph_id uuid NOT NULL REFERENCES paragraphs(id) ON DELETE CASCADE,
    started_at timestamptz NOT NULL,
    finished_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_subjects_class_id ON subjects(class_id);
CREATE INDEX idx_chapters_subject_id ON chapters(subject_id);
CREATE INDEX idx_paragraphs_chapter_id ON paragraphs(chapter_id);
CREATE INDEX idx_assignments_paragraph_id ON assignments(paragraph_id);
CREATE INDEX idx_blocks_assignment_id ON blocks(assignment_id);
CREATE INDEX idx_blocks_position ON blocks(assignment_id, position);
CREATE INDEX idx_student_answers_student_id ON student_answers(student_id);
CREATE INDEX idx_student_answers_block_id ON student_answers(block_id);
CREATE INDEX idx_progress_snapshots_student_id ON progress_snapshots(student_id);
CREATE INDEX idx_session_logs_student_id ON session_logs(student_id);
CREATE INDEX idx_session_logs_paragraph_id ON session_logs(paragraph_id);

-- Row Level Security (RLS) Policies

-- User preferences: users can only access their own
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Subjects: accessible to class members
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Class members can view subjects" ON subjects FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM classes c
        JOIN class_members cm ON cm.class_id = c.id
        WHERE c.id = subjects.class_id
        AND (c.owner_id = auth.uid() OR cm.user_id = auth.uid())
    )
);
CREATE POLICY "Teachers can manage subjects" ON subjects FOR ALL USING (
    EXISTS (
        SELECT 1 FROM classes c
        WHERE c.id = subjects.class_id
        AND c.owner_id = auth.uid()
    )
);

-- Chapters: same as subjects
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Class members can view chapters" ON chapters FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM subjects s
        JOIN classes c ON c.id = s.class_id
        JOIN class_members cm ON cm.class_id = c.id
        WHERE s.id = chapters.subject_id
        AND (c.owner_id = auth.uid() OR cm.user_id = auth.uid())
    )
);
CREATE POLICY "Teachers can manage chapters" ON chapters FOR ALL USING (
    EXISTS (
        SELECT 1 FROM subjects s
        JOIN classes c ON c.id = s.class_id
        WHERE s.id = chapters.subject_id
        AND c.owner_id = auth.uid()
    )
);

-- Paragraphs: same pattern
ALTER TABLE paragraphs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Class members can view paragraphs" ON paragraphs FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM chapters ch
        JOIN subjects s ON s.id = ch.subject_id
        JOIN classes c ON c.id = s.class_id
        JOIN class_members cm ON cm.class_id = c.id
        WHERE ch.id = paragraphs.chapter_id
        AND (c.owner_id = auth.uid() OR cm.user_id = auth.uid())
    )
);
CREATE POLICY "Teachers can manage paragraphs" ON paragraphs FOR ALL USING (
    EXISTS (
        SELECT 1 FROM chapters ch
        JOIN subjects s ON s.id = ch.subject_id
        JOIN classes c ON c.id = s.class_id
        WHERE ch.id = paragraphs.chapter_id
        AND c.owner_id = auth.uid()
    )
);

-- Assignments: same pattern
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Class members can view assignments" ON assignments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM paragraphs p
        JOIN chapters ch ON ch.id = p.chapter_id
        JOIN subjects s ON s.id = ch.subject_id
        JOIN classes c ON c.id = s.class_id
        JOIN class_members cm ON cm.class_id = c.id
        WHERE p.id = assignments.paragraph_id
        AND (c.owner_id = auth.uid() OR cm.user_id = auth.uid())
    )
);
CREATE POLICY "Teachers can manage assignments" ON assignments FOR ALL USING (
    EXISTS (
        SELECT 1 FROM paragraphs p
        JOIN chapters ch ON ch.id = p.chapter_id
        JOIN subjects s ON s.id = ch.subject_id
        JOIN classes c ON c.id = s.class_id
        WHERE p.id = assignments.paragraph_id
        AND c.owner_id = auth.uid()
    )
);

-- Blocks: accessible to assignment viewers
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE student_answers ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE progress_snapshots ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;
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

-- Functions for auto-numbering
CREATE OR REPLACE FUNCTION get_next_chapter_number(subject_uuid uuid)
RETURNS int AS $$
    SELECT COALESCE(MAX(chapter_number), 0) + 1
    FROM chapters
    WHERE subject_id = subject_uuid;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION get_next_paragraph_number(chapter_uuid uuid)
RETURNS int AS $$
    SELECT COALESCE(MAX(paragraph_number), 0) + 1
    FROM paragraphs
    WHERE chapter_id = chapter_uuid;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION get_next_assignment_index(paragraph_uuid uuid)
RETURNS int AS $$
    SELECT COALESCE(MAX(assignment_index), -1) + 1
    FROM assignments
    WHERE paragraph_id = paragraph_uuid;
$$ LANGUAGE sql;

-- Function to convert assignment index to letter (0=a, 1=b, 26=aa, etc.)
CREATE OR REPLACE FUNCTION assignment_index_to_letter(idx int)
RETURNS text AS $$
DECLARE
    result text := '';
    remainder int;
BEGIN
    IF idx < 26 THEN
        RETURN chr(97 + idx); -- a-z
    END IF;

    -- Handle multi-letter (aa, ab, etc.)
    WHILE idx >= 0 LOOP
        remainder := idx % 26;
        result := chr(97 + remainder) || result;
        idx := (idx / 26) - 1;
        IF idx < 0 THEN EXIT; END IF;
    END LOOP;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

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

-- Triggers for auto-updating progress
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

CREATE TRIGGER update_progress_on_answer
    AFTER INSERT OR UPDATE ON student_answers
    FOR EACH ROW EXECUTE FUNCTION trigger_update_progress();