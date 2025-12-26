-- Enhanced Assignments Migration
-- Add type and files fields to assignments table

ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS type text DEFAULT 'homework';
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS files jsonb DEFAULT '[]'::jsonb;

-- Add check constraint for assignment types (only if it doesn't exist)
DO $
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'assignments_type_check'
        AND table_name = 'assignments'
    ) THEN
        ALTER TABLE public.assignments ADD CONSTRAINT assignments_type_check
          CHECK (type IN ('homework', 'test', 'repetition', 'project', 'other'));
    END IF;
END $;