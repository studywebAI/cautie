-- Drop existing objects to ensure a clean slate
DROP POLICY IF EXISTS "Enable all for users based on user_id" ON public.class_members;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.class_members;
DROP POLICY IF EXISTS "Enable all for users based on user_id" ON public.assignments;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.assignments;
DROP POLICY IF EXISTS "Enable all for users based on user_id" ON public.classes;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.classes;
DROP POLICY IF EXISTS "Enable all for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop tables in reverse order of dependency
DROP TABLE IF EXISTS public.class_members;
DROP TABLE IF EXISTS public.assignments;
DROP TABLE IF EXISTS public.classes;
DROP TABLE IF EXISTS public.profiles;


-- Create the profiles table first as it's a primary dependency
CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at timestamp with time zone,
    full_name text,
    avatar_url text,
    role text DEFAULT 'student'::text
);

-- Create the classes table
CREATE TABLE public.classes (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    name text NOT NULL,
    description text,
    owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Create the assignments table
CREATE TABLE public.assignments (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    title text NOT NULL,
    due_date timestamp with time zone,
    content json
);

-- Create the class_members table
CREATE TABLE public.class_members (
    class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    role text NOT NULL DEFAULT 'student'::text,
    PRIMARY KEY (class_id, user_id)
);


-- Function to create a profile for a new user
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

-- Trigger to call the function on new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;

-- Policies for profiles table
CREATE POLICY "Enable read access for all users" ON "public"."profiles"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable all for users based on user_id" ON "public"."profiles"
AS PERMISSIVE FOR ALL
TO public
USING ((auth.uid() = id));

-- Policies for classes table
CREATE POLICY "Enable read access for all users" ON public.classes
FOR SELECT USING (true);

CREATE POLICY "Enable all for users based on user_id" ON public.classes
FOR ALL USING (auth.uid() = owner_id);

-- Policies for assignments table
CREATE POLICY "Enable read access for all users" ON public.assignments
FOR SELECT USING (true);

CREATE POLICY "Enable all for users based on user_id" ON public.assignments
FOR ALL USING (
  auth.uid() IN (
    SELECT owner_id FROM classes WHERE id = class_id
  )
);

-- Policies for class_members table
CREATE POLICY "Enable read access for all users" ON public.class_members
FOR SELECT USING (true);

CREATE POLICY "Enable all for users based on user_id" ON public.class_members
FOR ALL USING (auth.uid() = user_id);
