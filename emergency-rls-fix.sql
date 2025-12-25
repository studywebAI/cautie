-- Emergency RLS fix - DISABLE RLS temporarily to fix infinite recursion
-- This will allow all operations, then we can re-enable with proper policies

ALTER TABLE public.classes DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on classes table
DROP POLICY IF EXISTS "Users can view classes they own or are a member of" ON public.classes;
DROP POLICY IF EXISTS "Teachers can create classes" ON public.classes;
DROP POLICY IF EXISTS "Class owners can update their classes" ON public.classes;
DROP POLICY IF EXISTS "Class owners can delete their classes" ON public.classes;
DROP POLICY IF EXISTS "Allow join_code access for uniqueness" ON public.classes;
DROP POLICY IF EXISTS "Users can view their own classes" ON public.classes;
DROP POLICY IF EXISTS "Users can create classes" ON public.classes;
DROP POLICY IF EXISTS "Users can update their own classes" ON public.classes;
DROP POLICY IF EXISTS "Users can delete their own classes" ON public.classes;
DROP POLICY IF EXISTS "Allow join_code checks" ON public.classes;

-- Re-enable RLS with simple policy
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Simple policy that allows authenticated users to do everything (temporary)
CREATE POLICY "Allow all for authenticated users" ON public.classes FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);