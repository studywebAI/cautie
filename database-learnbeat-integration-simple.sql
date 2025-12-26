-- Learnbeat-Style Structured Learning Content System (Simplified)
-- Integration with Cautie platform - Idempotent Version

-- Create class_chapters table for hierarchical chapter organization
CREATE TABLE IF NOT EXISTS public.class_chapters (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    class_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    order_index integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    user_id uuid NOT NULL,
    CONSTRAINT class_chapters_pkey PRIMARY KEY (id),
    CONSTRAINT class_chapters_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE,
    CONSTRAINT class_chapters_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add chapter_id to blocks table for chapter-based content
ALTER TABLE public.blocks ADD COLUMN IF NOT EXISTS chapter_id uuid;

-- Add chapter and block references to assignments for embedded assignments
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS chapter_id uuid;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS block_id uuid;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS content_position jsonb;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_class_chapters_class_id ON public.class_chapters(class_id);
CREATE INDEX IF NOT EXISTS idx_class_chapters_order_index ON public.class_chapters(class_id, order_index);
CREATE INDEX IF NOT EXISTS idx_blocks_chapter ON public.blocks(chapter_id);
CREATE INDEX IF NOT EXISTS idx_assignments_chapter ON public.assignments(chapter_id);
CREATE INDEX IF NOT EXISTS idx_assignments_block ON public.assignments(block_id);

-- Enable RLS on new table
ALTER TABLE public.class_chapters ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Teachers can manage chapters in their classes" ON public.class_chapters;
DROP POLICY IF EXISTS "Students can view chapters in their classes" ON public.class_chapters;
DROP POLICY IF EXISTS "Guest access for chapters" ON public.class_chapters;

-- RLS Policies for class_chapters
CREATE POLICY "Teachers can manage chapters in their classes" ON public.class_chapters
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.classes
            WHERE classes.id = class_chapters.class_id
            AND classes.user_id = auth.uid()
        )
    );

CREATE POLICY "Students can view chapters in their classes" ON public.class_chapters
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.classes c
            JOIN public.class_members cm ON cm.class_id = c.id
            WHERE c.id = class_chapters.class_id
            AND cm.user_id = auth.uid()
        )
    );

-- Guest access for guest classes
CREATE POLICY "Guest access for chapters" ON public.class_chapters
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.classes
            WHERE classes.id = class_chapters.class_id
            AND classes.owner_type = 'guest'
        )
    );