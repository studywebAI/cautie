-- RLS FIX FOR HIERARCHICAL STRUCTURE (subjects/chapters/paragraphs/assignments/blocks)

-- Step 1: Disable RLS on all hierarchical tables
ALTER TABLE public.subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.paragraphs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_answers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_snapshots DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
                      pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- Step 3: Re-enable RLS with simple policies
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- BASE TABLES - Simple policies

-- PROFILES
CREATE POLICY "profiles_self" ON public.profiles FOR ALL USING (auth.uid() = id);

-- CLASSES - Owner only
CREATE POLICY "classes_owner" ON public.classes FOR ALL USING (owner_id = auth.uid());

-- CLASS_MEMBERS - Self access only
CREATE POLICY "class_members_self" ON public.class_members FOR ALL USING (user_id = auth.uid());

-- HIERARCHICAL TABLES - Through class ownership

-- SUBJECTS - Through class ownership
CREATE POLICY "subjects_owner" ON public.subjects FOR ALL USING (
  class_id IN (SELECT id FROM public.classes WHERE owner_id = auth.uid())
);

-- ASSIGNMENTS - Through hierarchical ownership (assignments -> paragraphs -> chapters -> subjects -> classes)
CREATE POLICY "assignments_owner" ON public.assignments FOR ALL USING (
  paragraph_id IN (
    SELECT p.id FROM public.paragraphs p
    JOIN public.chapters ch ON ch.id = p.chapter_id
    JOIN public.subjects s ON s.id = ch.subject_id
    JOIN public.classes c ON c.id = s.class_id
    WHERE c.owner_id = auth.uid()
  )
);

-- This creates a clean hierarchy without circular dependencies