-- Emergency RLS fix for infinite recursion
-- Drop problematic policies that cause circular references

DROP POLICY IF EXISTS "Users can view classes they own or are a member of" ON public.classes;
DROP POLICY IF EXISTS "Teachers can create classes" ON public.classes;
DROP POLICY IF EXISTS "Class owners can update their classes" ON public.classes;
DROP POLICY IF EXISTS "Class owners can delete their classes" ON public.classes;
DROP POLICY IF EXISTS "Allow join_code access for uniqueness" ON public.classes;

-- Simplified policies to avoid circular references
CREATE POLICY "Users can view their own classes" ON public.classes FOR SELECT
  USING (auth.uid() = owner_id OR auth.uid() = user_id);

CREATE POLICY "Users can create classes" ON public.classes FOR INSERT
  WITH CHECK (auth.uid() = owner_id OR auth.uid() = user_id);

CREATE POLICY "Users can update their own classes" ON public.classes FOR UPDATE
  USING (auth.uid() = owner_id OR auth.uid() = user_id)
  WITH CHECK (auth.uid() = owner_id OR auth.uid() = user_id);

CREATE POLICY "Users can delete their own classes" ON public.classes FOR DELETE
  USING (auth.uid() = owner_id OR auth.uid() = user_id);

-- Allow anyone to check join_code uniqueness (needed for class creation)
CREATE POLICY "Allow join_code checks" ON public.classes FOR SELECT
  USING (true);