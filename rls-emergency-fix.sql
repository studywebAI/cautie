-- EMERGENCY RLS FIX - Disable problematic policies and recreate properly
-- This fixes the infinite recursion issue in RLS policies

-- First, disable RLS on all tables to clear the problematic policies
ALTER TABLE public.classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
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

DROP POLICY IF EXISTS "Allow individual read access" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual insert access" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual update access" ON public.profiles;

DROP POLICY IF EXISTS "Users can manage their own materials" ON public.materials;
DROP POLICY IF EXISTS "Users can view public materials" ON public.materials;

DROP POLICY IF EXISTS "Allow authenticated read" ON public.blocks;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.blocks;
DROP POLICY IF EXISTS "Allow authenticated update for owners" ON public.blocks;
DROP POLICY IF EXISTS "Allow authenticated delete for owners" ON public.blocks;

-- Re-enable RLS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

-- PROFILES - Simple policies
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- CLASSES - Fixed policies without recursion
CREATE POLICY "classes_select" ON public.classes FOR SELECT USING (
  auth.uid() = owner_id OR
  auth.uid() IN (
    SELECT user_id FROM public.class_members WHERE class_id = classes.id
  )
);

CREATE POLICY "classes_insert" ON public.classes FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "classes_update" ON public.classes FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "classes_delete" ON public.classes FOR DELETE USING (auth.uid() = owner_id);

-- CLASS_MEMBERS - Access based on class membership or ownership
CREATE POLICY "class_members_select" ON public.class_members FOR SELECT USING (
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

-- ASSIGNMENTS - Access through class membership
CREATE POLICY "assignments_select" ON public.assignments FOR SELECT USING (
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

-- MATERIALS - Basic access control
CREATE POLICY "materials_select" ON public.materials FOR SELECT USING (
  user_id = auth.uid() OR
  is_public = true OR
  class_id IN (
    SELECT id FROM public.classes WHERE owner_id = auth.uid()
  ) OR
  class_id IN (
    SELECT class_id FROM public.class_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "materials_insert" ON public.materials FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "materials_update" ON public.materials FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "materials_delete" ON public.materials FOR DELETE USING (user_id = auth.uid());

-- BLOCKS - Access through assignments
CREATE POLICY "blocks_select" ON public.blocks FOR SELECT USING (
  assignment_id IN (
    SELECT id FROM public.assignments WHERE class_id IN (
      SELECT id FROM public.classes WHERE owner_id = auth.uid() OR
      id IN (SELECT class_id FROM public.class_members WHERE user_id = auth.uid())
    )
  )
);

CREATE POLICY "blocks_insert" ON public.blocks FOR INSERT WITH CHECK (
  assignment_id IN (
    SELECT id FROM public.assignments WHERE class_id IN (
      SELECT id FROM public.classes WHERE owner_id = auth.uid()
    )
  )
);

CREATE POLICY "blocks_update" ON public.blocks FOR UPDATE USING (
  assignment_id IN (
    SELECT id FROM public.assignments WHERE class_id IN (
      SELECT id FROM public.classes WHERE owner_id = auth.uid()
    )
  )
);

CREATE POLICY "blocks_delete" ON public.blocks FOR DELETE USING (
  assignment_id IN (
    SELECT id FROM public.assignments WHERE class_id IN (
      SELECT id FROM public.classes WHERE owner_id = auth.uid()
    )
  )
);