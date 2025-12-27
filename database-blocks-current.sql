-- Blocks table for current database structure
-- Works with existing materials table

-- Add assignment_id column to existing blocks table if it doesn't exist
ALTER TABLE blocks ADD COLUMN IF NOT EXISTS assignment_id uuid;

-- Or create a new blocks table that references materials for now
CREATE TABLE IF NOT EXISTS content_blocks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id uuid NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    assignment_id uuid, -- Will be populated when hierarchy is added
    type text NOT NULL CHECK (type IN (
        'text', 'image', 'video', 'multiple_choice', 'open_question',
        'fill_in_blank', 'drag_drop', 'ordering', 'media_embed', 'divider'
    )),
    position float NOT NULL DEFAULT 0,
    data jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create student_answers table
CREATE TABLE IF NOT EXISTS student_answers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    block_id uuid NOT NULL REFERENCES content_blocks(id) ON DELETE CASCADE,
    answer_data jsonb NOT NULL,
    is_correct boolean,
    score int,
    feedback text,
    graded_by_ai boolean DEFAULT false,
    graded_at timestamptz,
    submitted_at timestamptz DEFAULT now(),
    UNIQUE(student_id, block_id)
);

-- Create progress_snapshots table (simplified for now)
CREATE TABLE IF NOT EXISTS progress_snapshots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    material_id uuid NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    completion_percent int NOT NULL DEFAULT 0 CHECK (completion_percent >= 0 AND completion_percent <= 100),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(student_id, material_id)
);

-- Create session_logs table
CREATE TABLE IF NOT EXISTS session_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    material_id uuid NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    started_at timestamptz NOT NULL,
    finished_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    theme text DEFAULT 'pastel' CHECK (theme IN ('light', 'dark', 'pastel')),
    color_palette text DEFAULT 'default' CHECK (color_palette IN ('default', 'pastel-soft')),
    language text DEFAULT 'en' CHECK (language IN ('en', 'nl', 'de', 'fr', 'es', 'ru', 'zh')),
    updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_content_blocks_material_id ON content_blocks(material_id);
CREATE INDEX IF NOT EXISTS idx_content_blocks_position ON content_blocks(material_id, position);
CREATE INDEX IF NOT EXISTS idx_student_answers_student_id ON student_answers(student_id);
CREATE INDEX IF NOT EXISTS idx_student_answers_block_id ON student_answers(block_id);
CREATE INDEX IF NOT EXISTS idx_progress_snapshots_student_id ON progress_snapshots(student_id);
CREATE INDEX IF NOT EXISTS idx_session_logs_student_id ON session_logs(student_id);

-- Enable RLS
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Content blocks accessible to material viewers" ON content_blocks;
DROP POLICY IF EXISTS "Students can manage their answers" ON student_answers;
DROP POLICY IF EXISTS "Users can manage their progress" ON progress_snapshots;
DROP POLICY IF EXISTS "Users can manage their sessions" ON session_logs;
DROP POLICY IF EXISTS "Users can manage their preferences" ON user_preferences;

-- Create policies
CREATE POLICY "Content blocks accessible to material viewers" ON content_blocks FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM materials m
        LEFT JOIN classes c ON c.id = m.class_id
        LEFT JOIN class_members cm ON cm.class_id = c.id
        WHERE m.id = content_blocks.material_id
        AND (
            m.user_id = auth.uid() OR
            m.is_public = true OR
            (c.owner_id = auth.uid()) OR
            (cm.user_id = auth.uid())
        )
    )
);

CREATE POLICY "Teachers can manage content blocks" ON content_blocks FOR ALL USING (
    EXISTS (
        SELECT 1 FROM materials m
        LEFT JOIN classes c ON c.id = m.class_id
        WHERE m.id = content_blocks.material_id
        AND (
            m.user_id = auth.uid() OR
            c.owner_id = auth.uid()
        )
    )
);

CREATE POLICY "Students can manage their answers" ON student_answers
    FOR ALL USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view all answers" ON student_answers FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM content_blocks cb
        JOIN materials m ON m.id = cb.material_id
        LEFT JOIN classes c ON c.id = m.class_id
        WHERE cb.id = student_answers.block_id
        AND (
            m.user_id = auth.uid() OR
            c.owner_id = auth.uid()
        )
    )
);

CREATE POLICY "Users can manage their progress" ON progress_snapshots
    FOR ALL USING (auth.uid() = student_id);

CREATE POLICY "Users can manage their sessions" ON session_logs
    FOR ALL USING (auth.uid() = student_id);

CREATE POLICY "Users can manage their preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Progress update function (simplified for materials)
CREATE OR REPLACE FUNCTION update_material_progress(student_uuid uuid, material_uuid uuid)
RETURNS void AS $$
DECLARE
    total_blocks int := 0;
    completed_blocks int := 0;
    completion_percent int := 0;
BEGIN
    -- Count total interactive blocks in material
    SELECT COUNT(*) INTO total_blocks
    FROM content_blocks cb
    WHERE cb.material_id = material_uuid
    AND cb.type IN ('multiple_choice', 'open_question', 'fill_in_blank', 'drag_drop', 'ordering');

    IF total_blocks = 0 THEN
        completion_percent := 100;
    ELSE
        -- Count completed blocks
        SELECT COUNT(*) INTO completed_blocks
        FROM content_blocks cb
        LEFT JOIN student_answers sa ON sa.block_id = cb.id AND sa.student_id = student_uuid
        WHERE cb.material_id = material_uuid
        AND cb.type IN ('multiple_choice', 'open_question', 'fill_in_blank', 'drag_drop', 'ordering')
        AND sa.id IS NOT NULL;

        completion_percent := LEAST(100, (completed_blocks * 100) / total_blocks);
    END IF;

    -- Insert or update snapshot
    INSERT INTO progress_snapshots (student_id, material_id, completion_percent, updated_at)
    VALUES (student_uuid, material_uuid, completion_percent, now())
    ON CONFLICT (student_id, material_id)
    DO UPDATE SET
        completion_percent = EXCLUDED.completion_percent,
        updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Auto-update progress trigger
DROP TRIGGER IF EXISTS update_progress_on_answer ON student_answers;
CREATE TRIGGER update_progress_on_answer
    AFTER INSERT OR UPDATE ON student_answers
    FOR EACH ROW EXECUTE FUNCTION update_material_progress(
        NEW.student_id,
        (SELECT material_id FROM content_blocks WHERE id = NEW.block_id)
    );

-- Sample data (uncomment to test)
-- INSERT INTO content_blocks (material_id, type, position, data)
-- SELECT m.id, 'text', 0, '{"content": "Welcome to block-based learning!", "style": "heading"}'::jsonb
-- FROM materials m LIMIT 1;