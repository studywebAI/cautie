-- Learnbeat-Style Structured Learning Content Integration for Cautie
-- Adds hierarchical chapters and sections to classes

-- New table for chapters within classes
CREATE TABLE IF NOT EXISTS public.class_chapters (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    class_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    order_index integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT class_chapters_pkey PRIMARY KEY (id),
    CONSTRAINT class_chapters_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes (id) ON DELETE CASCADE
);

-- Extend blocks table to support chapter sections
ALTER TABLE public.blocks ADD COLUMN IF NOT EXISTS chapter_id uuid REFERENCES public.class_chapters (id) ON DELETE CASCADE;
ALTER TABLE public.blocks ALTER COLUMN material_id DROP NOT NULL;
ALTER TABLE public.blocks ADD CONSTRAINT blocks_parent_check CHECK (
    (material_id IS NOT NULL AND chapter_id IS NULL) OR
    (material_id IS NULL AND chapter_id IS NOT NULL)
);

-- Extend assignments table for embedding
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS chapter_id uuid REFERENCES public.class_chapters (id) ON DELETE SET NULL;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS block_id uuid REFERENCES public.blocks (id) ON DELETE SET NULL;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS class_chapters_class_id_idx ON public.class_chapters (class_id);
CREATE INDEX IF NOT EXISTS class_chapters_order_index_idx ON public.class_chapters (order_index);
CREATE INDEX IF NOT EXISTS blocks_chapter_id_idx ON public.blocks (chapter_id);
CREATE INDEX IF NOT EXISTS assignments_chapter_id_idx ON public.assignments (chapter_id);
CREATE INDEX IF NOT EXISTS assignments_block_id_idx ON public.assignments (block_id);

-- Enable RLS on new table
ALTER TABLE public.class_chapters ENABLE ROW LEVEL SECURITY;

-- RLS Policies for class_chapters

-- Teachers can manage chapters in their classes
CREATE POLICY "Teachers can manage chapters" ON public.class_chapters
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.classes c
            WHERE c.id = class_chapters.class_id
            AND (
                c.owner_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.class_members cm
                    WHERE cm.class_id = c.id
                    AND cm.user_id = auth.uid()
                    AND cm.role = 'teacher'
                )
            )
        )
    );

-- Members can view chapters in their classes
CREATE POLICY "Members can view chapters" ON public.class_chapters
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.classes c
            LEFT JOIN public.class_members cm ON cm.class_id = c.id
            WHERE c.id = class_chapters.class_id
            AND (
                c.owner_id = auth.uid() OR
                cm.user_id = auth.uid()
            )
        )
    );

-- Update blocks RLS to handle chapter blocks

-- Existing material blocks policy (unchanged)
DROP POLICY IF EXISTS "Users can manage blocks for their materials" ON public.blocks;
CREATE POLICY "Users can manage blocks for their materials" ON public.blocks
    FOR ALL USING (
        material_id IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.materials m
            WHERE m.id = blocks.material_id AND m.user_id = auth.uid()
        )
    );

-- Policy for chapter blocks
CREATE POLICY "Teachers can manage chapter blocks" ON public.blocks
    FOR ALL USING (
        chapter_id IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.class_chapters ch
            JOIN public.classes c ON c.id = ch.class_id
            WHERE ch.id = blocks.chapter_id
            AND (
                c.owner_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.class_members cm
                    WHERE cm.class_id = c.id
                    AND cm.user_id = auth.uid()
                    AND cm.role = 'teacher'
                )
            )
        )
    );

-- Members can view chapter blocks
CREATE POLICY "Members can view chapter blocks" ON public.blocks
    FOR SELECT USING (
        chapter_id IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.class_chapters ch
            JOIN public.classes c ON c.id = ch.class_id
            LEFT JOIN public.class_members cm ON cm.class_id = c.id
            WHERE ch.id = blocks.chapter_id
            AND (
                c.owner_id = auth.uid() OR
                cm.user_id = auth.uid()
            )
        )
    );

-- Assignments policies remain unchanged (based on class_id), new columns are optional references