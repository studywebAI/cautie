--
-- Universal App Schema for StudyWeb
--
-- This script is designed to be idempotent (re-runnable).
-- It will drop existing tables and policies before creating them to ensure a clean setup.
--

-- Drop existing tables in reverse order of dependency to avoid foreign key conflicts
DROP TABLE IF EXISTS public.assignments CASCADE;
DROP TABLE IF EXISTS public.class_members CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;


--
-- Profiles Table
-- Stores public user data and role information.
--
CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    full_name text,
    avatar_url text,
    role text,
    updated_at timestamp with time zone
);
COMMENT ON TABLE public.profiles IS 'Stores public-facing user data and application-specific roles.';

-- Set up Row Level Security (RLS) for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone."
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile."
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE USING (auth.uid() = id);

--
-- Classes Table
-- Stores information about classes created by teachers.
--
CREATE TABLE public.classes (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.classes IS 'Represents a class or course created by a teacher.';

-- Set up RLS for classes
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for classes
DROP POLICY IF EXISTS "Users can create classes." ON public.classes;
DROP POLICY IF EXISTS "Users can view their own classes." ON public.classes;
DROP POLICY IF EXISTS "Users can update their own classes." ON public.classes;
DROP POLICY IF EXISTS "Users can delete their own classes." ON public.classes;

CREATE POLICY "Users can create classes."
ON public.classes FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can view their own classes."
ON public.classes FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can update their own classes."
ON public.classes FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own classes."
ON public.classes FOR DELETE USING (auth.uid() = owner_id);


--
-- Class Members Table
-- Junction table to link users (students/teachers) to classes.
--
CREATE TABLE public.class_members (
    class_id uuid NOT NULL REFERENCES public.classes ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'student',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (class_id, user_id)
);
COMMENT ON TABLE public.class_members IS 'Junction table linking users to classes with specific roles.';

-- Set up RLS for class_members
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for class_members
DROP POLICY IF EXISTS "Class owners can manage members of their classes." ON public.class_members;
DROP POLICY IF EXISTS "Members can view their own membership." ON public.class_members;

CREATE POLICY "Class owners can manage members of their classes."
ON public.class_members FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.classes
    WHERE classes.id = class_members.class_id AND classes.owner_id = auth.uid()
  )
);

CREATE POLICY "Members can view their own membership."
ON public.class_members FOR SELECT
USING (auth.uid() = user_id);


--
-- Assignments Table
-- Stores assignments for a specific class.
--
CREATE TABLE public.assignments (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id uuid NOT NULL REFERENCES public.classes ON DELETE CASCADE,
    title text NOT NULL,
    due_date timestamp with time zone,
    content jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.assignments IS 'Stores assignments created by teachers for a specific class.';

-- Set up RLS for assignments
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for assignments
DROP POLICY IF EXISTS "Class members can view assignments for their classes." ON public.assignments;
DROP POLICY IF EXISTS "Class owners can manage assignments in their classes." ON public.assignments;


CREATE POLICY "Class members can view assignments for their classes."
ON public.assignments FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.class_members
    WHERE class_members.class_id = assignments.class_id AND class_members.user_id = auth.uid()
  )
);

CREATE POLICY "Class owners can manage assignments in their classes."
ON public.assignments FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.classes
    WHERE classes.id = assignments.class_id AND classes.owner_id = auth.uid()
  )
);
