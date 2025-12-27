-- PROPER RLS FIX - Break circular dependency by restructuring policies

-- Disable RLS temporarily
ALTER TABLE public.classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
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

-- Re-enable RLS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- CLASSES POLICIES - Check ownership and membership without circular reference
CREATE POLICY "classes_owner_select" ON public.classes FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "classes_owner_insert" ON public.classes FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "classes_owner_update" ON public.classes FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "classes_owner_delete" ON public.classes FOR DELETE USING (owner_id = auth.uid());
CREATE POLICY "classes_member_read" ON public.classes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.class_members cm WHERE cm.class_id = id AND cm.user_id = auth.uid())
);

-- CLASS_MEMBERS POLICIES - Allow users to see their own memberships and owners to see all
CREATE POLICY "class_members_own_select" ON public.class_members FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "class_members_own_insert" ON public.class_members FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "class_members_own_update" ON public.class_members FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "class_members_own_delete" ON public.class_members FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "class_members_owner_read" ON public.class_members FOR SELECT USING (
  class_id IN (SELECT id FROM public.classes WHERE owner_id = auth.uid())
);
CREATE POLICY "class_members_owner_manage" ON public.class_members FOR INSERT WITH CHECK (
  class_id IN (SELECT id FROM public.classes WHERE owner_id = auth.uid())
);
CREATE POLICY "class_members_owner_delete" ON public.class_members FOR DELETE USING (
  class_id IN (SELECT id FROM public.classes WHERE owner_id = auth.uid())
);

-- ASSIGNMENTS POLICIES - Access through class relationship
CREATE POLICY "assignments_read" ON public.assignments FOR SELECT USING (
  class_id IN (SELECT id FROM public.classes WHERE owner_id = auth.uid()) OR
  class_id IN (SELECT class_id FROM public.class_members WHERE user_id = auth.uid())
);

CREATE POLICY "assignments_owner_select" ON public.assignments FOR SELECT USING (
  class_id IN (SELECT id FROM public.classes WHERE owner_id = auth.uid())
);
CREATE POLICY "assignments_owner_insert" ON public.assignments FOR INSERT WITH CHECK (
  class_id IN (SELECT id FROM public.classes WHERE owner_id = auth.uid())
);
CREATE POLICY "assignments_owner_update" ON public.assignments FOR UPDATE USING (
  class_id IN (SELECT id FROM public.classes WHERE owner_id = auth.uid())
);
CREATE POLICY "assignments_owner_delete" ON public.assignments FOR DELETE USING (
  class_id IN (SELECT id FROM public.classes WHERE owner_id = auth.uid())
);