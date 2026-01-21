-- Backend Schema Alignment Migration
-- Align database to match the specification

-- 1. Update class_members to have id column as PK
ALTER TABLE public.class_members ADD COLUMN id UUID DEFAULT gen_random_uuid();
UPDATE public.class_members SET id = gen_random_uuid() WHERE id IS NULL; -- In case of existing rows
ALTER TABLE public.class_members DROP CONSTRAINT class_members_pkey;
ALTER TABLE public.class_members ADD CONSTRAINT class_members_pkey PRIMARY KEY (id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_class_members_unique ON public.class_members(class_id, user_id);

-- 2. Align assignments table: remove class_id, make paragraph_id NOT NULL
ALTER TABLE public.assignments DROP COLUMN class_id;
ALTER TABLE public.assignments ALTER COLUMN paragraph_id SET NOT NULL;
DROP INDEX IF EXISTS idx_assignments_unique;
CREATE UNIQUE INDEX idx_assignments_unique ON public.assignments(paragraph_id, assignment_index);

-- 3. Ensure subjects table matches spec
-- Already has: id, class_id, title, class_label, cover_type, cover_image_url, ai_icon_seed, created_at
-- Note: user_id is extra, but keeping for now

-- Verification
SELECT 'Schema alignment completed' as status;