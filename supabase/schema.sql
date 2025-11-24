--
-- Universal App-Wide Schema for StudyWeb
-- This script is idempotent and can be run multiple times.
--

-- 1. Drop existing objects in reverse order of dependency
-- Drop policies first
DROP POLICY IF EXISTS "Allow authenticated select access" ON "public"."assignments";
DROP POLICY IF EXISTS "Allow owner full access" ON "public"."assignments";
DROP POLICY IF EXISTS "Allow authenticated select access" ON "public"."class_members";
DROP POLICY IF EXISTS "Allow class owner to manage members" ON "public"."class_members";
DROP POLICY IF EXISTS "Allow member to leave class" ON "public"."class_members";
DROP POLICY IF EXISTS "Allow member to view class info" ON "public"."classes";
DROP POLICY IF EXISTS "Allow owner full access" ON "public"."classes";
DROP POLICY IF EXISTS "Allow individual read access" ON "public"."profiles";
DROP POLICY IF EXISTS "Allow individual update access" ON "public"."profiles";
-- Drop trigger
DROP TRIGGER IF EXISTS "on_auth_user_created" ON "auth"."users";
-- Drop tables
DROP TABLE IF EXISTS "public"."class_members";
DROP TABLE IF EXISTS "public"."assignments";
DROP TABLE IF EXISTS "public"."classes";
DROP TABLE IF EXISTS "public"."profiles";
-- Drop function
DROP FUNCTION IF EXISTS "public"."handle_new_user";


-- 2. Create Tables in the correct order
-- Create profiles table first
CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    avatar_url text,
    role text,
    updated_at timestamptz
);
-- Comment on table and columns
COMMENT ON TABLE public.profiles IS 'Profile data for each user.';
COMMENT ON COLUMN public.profiles.id IS 'References the internal user id from auth.users';

-- Create classes table
CREATE TABLE public.classes (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now()
);
-- Comment on table and columns
COMMENT ON TABLE public.classes IS 'Represents a class or course.';
COMMENT ON COLUMN public.classes.owner_id IS 'The user who owns and manages the class.';

-- Create assignments table
CREATE TABLE public.assignments (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    title text NOT NULL,
    content json,
    due_date timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);
-- Comment on table and columns
COMMENT ON TABLE public.assignments IS 'Assignments given in a class.';
COMMENT ON COLUMN public.assignments.class_id IS 'The class this assignment belongs to.';

-- Create class_members table
CREATE TABLE public.class_members (
    class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'student',
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (class_id, user_id)
);
-- Comment on table and columns
COMMENT ON TABLE public.class_members IS 'Tracks which users are members of which classes.';

-- 3. Create Functions and Triggers
-- Function to create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url',
    'student' -- Default role
  );
  RETURN NEW;
END;
$$;
-- Trigger to call the function when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 4. Set up Row Level Security (RLS)
-- Enable RLS for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Allow individual read access" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow individual update access" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Policies for classes
CREATE POLICY "Allow owner full access" ON public.classes FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Allow member to view class info" ON public.classes FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM public.class_members
    WHERE class_members.class_id = classes.id AND class_members.user_id = auth.uid()
  )
);

-- Policies for class_members
CREATE POLICY "Allow class owner to manage members" ON public.class_members FOR ALL USING (
  EXISTS (
    SELECT 1
    FROM public.classes
    WHERE classes.id = class_members.class_id AND classes.owner_id = auth.uid()
  )
);
CREATE POLICY "Allow authenticated select access" ON public.class_members FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow member to leave class" ON public.class_members FOR DELETE USING (auth.uid() = user_id);


-- Policies for assignments
CREATE POLICY "Allow owner full access" ON public.assignments FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.classes
        WHERE classes.id = assignments.class_id AND classes.owner_id = auth.uid()
    )
);
CREATE POLICY "Allow authenticated select access" ON public.assignments FOR SELECT USING (
    EXISTS (
        SELECT 1
        FROM public.class_members
        WHERE class_members.class_id = assignments.class_id AND class_members.user_id = auth.uid()
    )
);
