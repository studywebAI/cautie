-- EMERGENCY: Completely disable RLS on problematic tables
-- This will temporarily allow all access to fix the circular dependency

ALTER TABLE public.classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to ensure clean slate
DROP POLICY IF EXISTS "Allow authenticated read" ON public.classes;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.classes;
DROP POLICY IF EXISTS "Allow authenticated update for owners" ON public.classes;
DROP POLICY IF EXISTS "Allow authenticated delete for owners" ON public.classes;

DROP POLICY IF EXISTS "Allow authenticated read" ON public.class_members;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.class_members;
DROP POLICY IF EXISTS "Allow authenticated delete for owners" ON public.class_members;

DROP POLICY IF EXISTS "Allow authenticated insert" ON public.assignments;
DROP POLICY IF EXISTS "Allow authenticated read" ON public.assignments;
DROP POLICY IF EXISTS "Allow authenticated delete for owners" ON public.assignments;
DROP POLICY IF EXISTS "Allow authenticated update for owners" ON public.assignments;

DROP POLICY IF EXISTS "Users can manage their own materials" ON public.materials;
DROP POLICY IF EXISTS "Users can view public materials" ON public.materials;

DROP POLICY IF EXISTS "Allow authenticated read" ON public.blocks;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.blocks;
DROP POLICY IF EXISTS "Allow authenticated update for owners" ON public.blocks;
DROP POLICY IF EXISTS "Allow authenticated delete for owners" ON public.blocks;