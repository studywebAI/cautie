
-- Drop existing tables and policies to ensure the script is re-runnable
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.class_members;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.class_members;
DROP POLICY IF EXISTS "Teachers can view assignments for their classes" ON public.assignments;
DROP POLICY IF EXISTS "Students can view assignments for their classes" ON public.assignments;
DROP POLICY IF EXISTS "Teachers can create assignments for their classes" ON public.assignments;
DROP POLICY IF EXISTS "Teachers can see their own classes." ON public.classes;
DROP POLICY IF EXISTS "Students can see classes they are members of." ON public.classes;
DROP POLICY IF EXISTS "Users can insert classes for themselves." ON public.classes;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;

DROP TABLE IF EXISTS public.class_members;
DROP TABLE IF EXISTS public.assignments;
DROP TABLE IF EXISTS public.classes;
DROP TABLE IF EXISTS public.profiles;

-- Create profiles table
CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    updated_at timestamp with time zone,
    full_name text,
    avatar_url text,
    role text DEFAULT 'student'::text
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create classes table
CREATE TABLE public.classes (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    name text NOT NULL,
    description text,
    owner_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Create class_members table (junction table)
CREATE TABLE public.class_members (
    class_id uuid NOT NULL REFERENCES public.classes ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    role text NOT NULL DEFAULT 'student'::text,
    PRIMARY KEY (class_id, user_id)
);

ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;

-- Create assignments table
CREATE TABLE public.assignments (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    title text NOT NULL,
    due_date timestamp with time zone,
    content json,
    class_id uuid NOT NULL REFERENCES public.classes ON DELETE CASCADE
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;


-- Function to create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'student');
  RETURN new;
END;
$$;

-- Trigger to call the function when a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- RLS Policies

-- Profiles
CREATE POLICY "Users can view their own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Classes
CREATE POLICY "Users can insert classes for themselves." ON public.classes FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Teachers can see their own classes." ON public.classes FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Students can see classes they are members of." ON public.classes FOR SELECT USING (
    id IN (
        SELECT class_id FROM public.class_members WHERE user_id = auth.uid()
    )
);

-- Class Members
CREATE POLICY "Enable insert for authenticated users" ON public.class_members FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON public.class_members FOR SELECT USING (auth.role() = 'authenticated');


-- Assignments
CREATE POLICY "Teachers can create assignments for their classes" ON public.assignments FOR INSERT WITH CHECK (
    class_id IN (
        SELECT id FROM public.classes WHERE owner_id = auth.uid()
    )
);
CREATE POLICY "Teachers can view assignments for their classes" ON public.assignments FOR SELECT USING (
    class_id IN (
        SELECT id FROM public.classes WHERE owner_id = auth.uid()
    )
);
CREATE POLICY "Students can view assignments for their classes" ON public.assignments FOR SELECT USING (
    class_id IN (
        SELECT class_id FROM public.class_members WHERE user_id = auth.uid()
    )
);
