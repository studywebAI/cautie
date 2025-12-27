-- SIMPLE RLS FIX - Only fix the problematic recursive policies
-- This addresses the infinite recursion without changing table structures

-- Disable RLS temporarily to clear policies
ALTER TABLE public.classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated read" ON public.classes;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.classes;
DROP POLICY IF EXISTS "Allow authenticated update for owners" ON public.classes;
DROP POLICY IF EXISTS "Allow authenticated delete for owners" ON public.classes;

DROP POLICY IF EXISTS "Allow authenticated read" ON public.class_members;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.class_members;
DROP POLICY IF EXISTS "Allow authenticated delete for owners" ON public.class_members;

DROP POLICY IF EXISTS "Allow authenticated read" ON public.assignments;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.assignments;
DROP POLICY IF EXISTS "Allow authenticated update for owners" ON public.assignments;
DROP POLICY IF EXISTS "Allow authenticated delete for owners" ON public.assignments;

-- Re-enable RLS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- CLASSES - Fix recursive issue by avoiding self-reference in policy
CREATE POLICY "classes_read" ON public.classes FOR SELECT USING (
  owner_id = auth.uid() OR
  id IN (
    SELECT class_id FROM public.class_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "classes_insert" ON public.classes FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "classes_update" ON public.classes FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "classes_delete" ON public.classes FOR DELETE USING (owner_id = auth.uid());

-- CLASS_MEMBERS - Access based on ownership or membership
CREATE POLICY "class_members_read" ON public.class_members FOR SELECT USING (
  user_id = auth.uid() OR
  class_id IN (
    SELECT id FROM public.classes WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "class_members_insert" ON public.class_members FOR INSERT WITH CHECK (
  user_id = auth.uid() OR
  class_id IN (
    SELECT id FROM public.classes WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "class_members_delete" ON public.class_members FOR DELETE USING (
  class_id IN (
    SELECT id FROM public.classes WHERE owner_id = auth.uid()
  )
);

-- ASSIGNMENTS - Access through class ownership/membership
CREATE POLICY "assignments_read" ON public.assignments FOR SELECT USING (
  class_id IN (
    SELECT id FROM public.classes WHERE owner_id = auth.uid()
  ) OR
  class_id IN (
    SELECT class_id FROM public.class_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "assignments_insert" ON public.assignments FOR INSERT WITH CHECK (
  class_id IN (
    SELECT id FROM public.classes WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "assignments_update" ON public.assignments FOR UPDATE USING (
  class_id IN (
    SELECT id FROM public.classes WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "assignments_delete" ON public.assignments FOR DELETE USING (
  class_id IN (
    SELECT id FROM public.classes WHERE owner_id = auth.uid()
  )
);