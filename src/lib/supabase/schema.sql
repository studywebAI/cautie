-- Drop existing objects in reverse dependency order to avoid errors.
-- Using CASCADE to handle dependent objects like policies.
DROP TABLE IF EXISTS public.class_members CASCADE;
DROP TABLE IF EXISTS public.assignments CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user;


-- 1. Create `profiles` table
-- This table will store user-specific data that doesn't belong in auth.users.
CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    avatar_url text,
    role text,
    updated_at timestamp with time zone
);
COMMENT ON TABLE public.profiles IS 'Profile data for each user.';

-- 2. Create `classes` table
-- This table will store information about different classes.
CREATE TABLE public.classes (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.classes IS 'Represents a class or course.';

-- 3. Create `assignments` table
-- This table will store assignments for classes.
CREATE TABLE public.assignments (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    title text NOT NULL,
    content json,
    due_date timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.assignments IS 'Assignments for each class.';

-- 4. Create `class_members` table
-- This junction table links users (students) to classes.
CREATE TABLE public.class_members (
    class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'student'::text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (class_id, user_id)
);
COMMENT ON TABLE public.class_members IS 'Stores which users are members of which classes.';


-- Function to create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'student');
  RETURN new;
END;
$$;

-- Trigger to call the function when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- Set up Row Level Security (RLS)
-- Enable RLS for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;

-- Policies for `profiles`
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Policies for `classes`
CREATE POLICY "Users can view classes they own or are a member of" ON public.classes FOR SELECT USING (
    auth.uid() = owner_id OR
    EXISTS (
        SELECT 1
        FROM public.class_members
        WHERE class_members.class_id = classes.id AND class_members.user_id = auth.uid()
    )
);
CREATE POLICY "Authenticated users can create classes" ON public.classes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Class owners can update their own classes" ON public.classes FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Class owners can delete their own classes" ON public.classes FOR DELETE USING (auth.uid() = owner_id);

-- Policies for `assignments`
CREATE POLICY "Users can view assignments for their classes" ON public.assignments FOR SELECT USING (
    EXISTS (
        SELECT 1
        FROM public.classes c
        JOIN public.class_members cm ON c.id = cm.class_id
        WHERE c.id = assignments.class_id AND (c.owner_id = auth.uid() OR cm.user_id = auth.uid())
    )
);
CREATE POLICY "Class owners can create assignments" ON public.assignments FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.classes
        WHERE classes.id = assignments.class_id AND classes.owner_id = auth.uid()
    )
);
CREATE POLICY "Class owners can update assignments" ON public.assignments FOR UPDATE USING (
    EXISTS (
        SELECT 1
        FROM public.classes
        WHERE classes.id = assignments.class_id AND classes.owner_id = auth.uid()
    )
);
CREATE POLICY "Class owners can delete assignments" ON public.assignments FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM public.classes
        WHERE classes.id = assignments.class_id AND classes.owner_id = auth.uid()
    )
);

-- Policies for `class_members`
CREATE POLICY "Users can view their own membership" ON public.class_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Class owners can view all members of their classes" ON public.class_members FOR SELECT USING (
    EXISTS (
        SELECT 1
        FROM public.classes
        WHERE classes.id = class_members.class_id AND classes.owner_id = auth.uid()
    )
);
CREATE POLICY "Students can join a class (insert their own membership)" ON public.class_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Class owners can remove members from their class" ON public.class_members FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM public.classes
        WHERE classes.id = class_members.class_id AND classes.owner_id = auth.uid()
    )
);
CREATE POLICY "Students can leave a class (delete their own membership)" ON public.class_members FOR DELETE USING (auth.uid() = user_id);
