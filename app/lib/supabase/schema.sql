-- RLS / AUTH POLICIES
DROP POLICY IF EXISTS "Allow authenticated insert" ON "public"."assignments";
DROP POLICY IF EXISTS "Allow authenticated read" ON "public"."assignments";
DROP POLICY IF EXISTS "Allow authenticated delete for owners" ON "public"."assignments";
DROP POLICY IF EXISTS "Allow authenticated update for owners" ON "public"."assignments";

DROP POLICY IF EXISTS "Allow authenticated read" ON "public"."class_members";
DROP POLICY IF EXISTS "Allow authenticated insert" ON "public"."class_members";
DROP POLICY IF EXISTS "Allow authenticated delete for owners" ON "public"."class_members";

DROP POLICY IF EXISTS "Allow authenticated read" ON "public"."classes";
DROP POLICY IF EXISTS "Allow authenticated insert" ON "public"."classes";
DROP POLICY IF EXISTS "Allow authenticated update for owners" ON "public"."classes";
DROP POLICY IF EXISTS "Allow authenticated delete for owners" ON "public"."classes";

DROP POLICY IF EXISTS "Allow individual read access" ON "public"."profiles";
DROP POLICY IF EXISTS "Allow individual insert access" ON "public"."profiles";
DROP POLICY IF EXISTS "Allow individual update access" ON "public"."profiles";

DROP POLICY IF EXISTS "Allow authenticated read to personal_tasks" ON "public"."personal_tasks";
DROP POLICY IF EXISTS "Allow authenticated insert to personal_tasks" ON "public"."personal_tasks";
DROP POLICY IF EXISTS "Allow authenticated update to personal_tasks" ON "public"."personal_tasks";
DROP POLICY IF EXISTS "Allow authenticated delete to personal_tasks" ON "public"."personal_tasks";

DROP POLICY IF EXISTS "Allow authenticated read to materials" ON "public"."materials";
DROP POLICY IF EXISTS "Allow authenticated insert to materials" ON "public"."materials";
DROP POLICY IF EXISTS "Allow authenticated update to materials" ON "public"."materials";
DROP POLICY IF EXISTS "Allow authenticated delete to materials" ON "public"."materials";

-- Drop dependent functions and triggers before tables
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop tables using CASCADE to handle any remaining dependencies
DROP TABLE IF EXISTS "public"."assignments" CASCADE;
DROP TABLE IF EXISTS "public"."class_members" CASCADE;
DROP TABLE IF EXISTS "public"."classes" CASCADE;
DROP TABLE IF EXISTS "public"."materials" CASCADE;
DROP TABLE IF EXISTS "public"."personal_tasks" CASCADE;
DROP TABLE IF EXISTS "public"."notes" CASCADE;
DROP TABLE IF EXISTS "public"."profiles" CASCADE;


--
-- CREATE TABLES
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles Table: Stores public-facing user data
CREATE TABLE "public"."profiles" (
    "id" uuid NOT NULL,
    "updated_at" timestamp with time zone,
    "full_name" text,
    "avatar_url" text,
    "role" text DEFAULT 'student'::text,
    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
);
ALTER TABLE "public"."profiles" OWNER TO "postgres";

-- Enums for owner_type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'owner_type_enum') THEN
        CREATE TYPE "public"."owner_type_enum" AS ENUM ('guest', 'user');
    END IF;
END
$$;

-- Classes Table: Represents a class or course
CREATE TABLE "public"."classes" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "name" text NOT NULL,
    "description" text,
    "user_id" uuid, -- Foreign key to auth.users
    "guest_id" text, -- ID for guest users
    "owner_type" owner_type_enum NOT NULL DEFAULT 'user',
    CONSTRAINT "classes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "classes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "chk_classes_owner" CHECK ( (user_id IS NOT NULL AND guest_id IS NULL AND owner_type = 'user') OR (user_id IS NULL AND guest_id IS NOT NULL AND owner_type = 'guest') )
);
ALTER TABLE "public"."classes" OWNER TO "postgres";

-- Assignments Table: Stores assignments for classes
CREATE TABLE "public"."assignments" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "class_id" uuid NOT NULL,
    "title" text NOT NULL,
    "content" json,
    "due_date" timestamp with time zone,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "user_id" uuid,
    "guest_id" text,
    "owner_type" owner_type_enum NOT NULL DEFAULT 'user',
    CONSTRAINT "assignments_pkey" PRIMARY KEY (id),
    CONSTRAINT "assignments_class_id_fkey" FOREIGN KEY (class_id) REFERENCES classes (id) ON DELETE CASCADE,
    CONSTRAINT "chk_assignments_owner" CHECK ( (user_id IS NOT NULL AND guest_id IS NULL AND owner_type = 'user') OR (user_id IS NULL AND guest_id IS NOT NULL AND owner_type = 'guest') )
);
ALTER TABLE "public"."assignments" OWNER TO "postgres";

-- Personal Tasks Table (formerly for authenticated users)
CREATE TABLE "public"."personal_tasks" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "title" text NOT NULL,
    "description" text,
    "due_date" timestamp with time zone,
    "user_id" uuid,
    "guest_id" text,
    "owner_type" owner_type_enum NOT NULL DEFAULT 'user',
    CONSTRAINT "personal_tasks_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "personal_tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "chk_personal_tasks_owner" CHECK ( (user_id IS NOT NULL AND guest_id IS NULL AND owner_type = 'user') OR (user_id IS NULL AND guest_id IS NOT NULL AND owner_type = 'guest') )
);
ALTER TABLE "public"."personal_tasks" OWNER TO "postgres";

-- Materials Table
CREATE TABLE "public"."materials" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "title" text NOT NULL,
    "content" json,
    "type" text NOT NULL,
    "class_id" uuid, -- Optional: Can be linked to a class
    "user_id" uuid,
    "guest_id" text,
    "owner_type" owner_type_enum NOT NULL DEFAULT 'user',
    CONSTRAINT "materials_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "materials_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE CASCADE,
    CONSTRAINT "materials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "chk_materials_owner" CHECK ( (user_id IS NOT NULL AND guest_id IS NULL AND owner_type = 'user') OR (user_id IS NULL AND guest_id IS NOT NULL AND owner_type = 'guest') )
);
ALTER TABLE "public"."materials" OWNER TO "postgres";

-- Notes Table (assuming it also needs guest_id/user_id)
CREATE TABLE "public"."notes" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "title" text NOT NULL,
    "content" json,
    "user_id" uuid,
    "guest_id" text,
    "owner_type" owner_type_enum NOT NULL DEFAULT 'user',
    CONSTRAINT "notes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "chk_notes_owner" CHECK ( (user_id IS NOT NULL AND guest_id IS NULL AND owner_type = 'user') OR (user_id IS NULL AND guest_id IS NOT NULL AND owner_type = 'guest') )
);
ALTER TABLE "public"."notes" OWNER TO "postgres";

-- Class Members Table: Junction table for students and classes
CREATE TABLE "public"."class_members" (
    "class_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "role" text NOT NULL DEFAULT 'student'::text,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT "class_members_pkey" PRIMARY KEY ("class_id", "user_id"),
    CONSTRAINT "class_members_class_id_fkey" FOREIGN KEY (class_id) REFERENCES classes (id) ON DELETE CASCADE,
    CONSTRAINT "class_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);
ALTER TABLE "public"."class_members" OWNER TO "postgres";


--
-- FUNCTIONS & TRIGGERS
--

-- Function to create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'student');
  return new;
END;
$$;

-- Trigger to call handle_new_user on new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


--
-- ENABLE RLS and APPLY POLICIES
--

-- Profiles
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow individual read access" ON "public"."profiles" FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow individual insert access" ON "public"."profiles" FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Allow individual update access" ON "public"."profiles" FOR UPDATE USING (auth.uid() = id);

-- Classes
ALTER TABLE "public"."classes" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow owner/member read access" ON "public"."classes" FOR SELECT USING (
  (auth.uid() = user_id AND owner_type = 'user') OR
  (current_setting('request.jwt.claims.guest_id', true) = guest_id AND owner_type = 'guest') OR
  EXISTS (
    SELECT 1 FROM class_members WHERE class_members.class_id = classes.id AND class_members.user_id = auth.uid()
  )
);
CREATE POLICY "Allow owner/guest insert access" ON "public"."classes" FOR INSERT WITH CHECK (
  (auth.uid() = user_id AND owner_type = 'user') OR
  (current_setting('request.jwt.claims.guest_id', true) = guest_id AND owner_type = 'guest')
);
CREATE POLICY "Allow owner/guest update access" ON "public"."classes" FOR UPDATE USING (
  (auth.uid() = user_id AND owner_type = 'user') OR
  (current_setting('request.jwt.claims.guest_id', true) = guest_id AND owner_type = 'guest')
);
CREATE POLICY "Allow owner/guest delete access" ON "public"."classes" FOR DELETE USING (
  (auth.uid() = user_id AND owner_type = 'user') OR
  (current_setting('request.jwt.claims.guest_id', true) = guest_id AND owner_type = 'guest')
);

-- Assignments
ALTER TABLE "public"."assignments" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow owner/member/guest read access" ON "public"."assignments" FOR SELECT USING (
  (auth.uid() = user_id AND owner_type = 'user') OR
  (current_setting('request.jwt.claims.guest_id', true) = guest_id AND owner_type = 'guest') OR
  EXISTS (
    SELECT 1 FROM classes 
    WHERE classes.id = assignments.class_id AND (
      (classes.user_id = auth.uid() AND classes.owner_type = 'user') OR
      EXISTS (
        SELECT 1 FROM class_members 
        WHERE class_members.class_id = assignments.class_id AND class_members.user_id = auth.uid()
      )
    )
  )
);
CREATE POLICY "Allow owner/guest insert access" ON "public"."assignments" FOR INSERT WITH CHECK (
  (auth.uid() = user_id AND owner_type = 'user') OR
  (current_setting('request.jwt.claims.guest_id', true) = guest_id AND owner_type = 'guest')
);
CREATE POLICY "Allow owner/guest update access" ON "public"."assignments" FOR UPDATE USING (
  (auth.uid() = user_id AND owner_type = 'user') OR
  (current_setting('request.jwt.claims.guest_id', true) = guest_id AND owner_type = 'guest')
);
CREATE POLICY "Allow owner/guest delete access" ON "public"."assignments" FOR DELETE USING (
  (auth.uid() = user_id AND owner_type = 'user') OR
  (current_setting('request.jwt.claims.guest_id', true) = guest_id AND owner_type = 'guest')
);

-- Personal Tasks
ALTER TABLE "public"."personal_tasks" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow owner/guest read access" ON "public"."personal_tasks" FOR SELECT USING (
  (auth.uid() = user_id AND owner_type = 'user') OR
  (current_setting('request.jwt.claims.guest_id', true) = guest_id AND owner_type = 'guest')
);
CREATE POLICY "Allow owner/guest insert access" ON "public"."personal_tasks" FOR INSERT WITH CHECK (
  (auth.uid() = user_id AND owner_type = 'user') OR
  (current_setting('request.jwt.claims.guest_id', true) = guest_id AND owner_type = 'guest')
);
CREATE POLICY "Allow owner/guest update access" ON "public"."personal_tasks" FOR UPDATE USING (
  (auth.uid() = user_id AND owner_type = 'user') OR
  (current_setting('request.jwt.claims.guest_id', true) = guest_id AND owner_type = 'guest')
);
CREATE POLICY "Allow owner/guest delete access" ON "public"."personal_tasks" FOR DELETE USING (
  (auth.uid() = user_id AND owner_type = 'user') OR
  (current_setting('request.jwt.claims.guest_id', true) = guest_id AND owner_type = 'guest')
);

-- Materials
ALTER TABLE "public"."materials" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow owner/guest read access" ON "public"."materials" FOR SELECT USING (
  (auth.uid() = user_id AND owner_type = 'user') OR
  (current_setting('request.jwt.claims.guest_id', true) = guest_id AND owner_type = 'guest') OR
  EXISTS (
    SELECT 1 FROM classes 
    WHERE classes.id = materials.class_id AND (
      (classes.user_id = auth.uid() AND classes.owner_type = 'user') OR
      (classes.guest_id = current_setting('request.jwt.claims.guest_id', true) AND classes.owner_type = 'guest')
    )
  )
);
CREATE POLICY "Allow owner/guest insert access" ON "public"."materials" FOR INSERT WITH CHECK (
  (auth.uid() = user_id AND owner_type = 'user') OR
  (current_setting('request.jwt.claims.guest_id', true) = guest_id AND owner_type = 'guest')
);
CREATE POLICY "Allow owner/guest update access" ON "public"."materials" FOR UPDATE USING (
  (auth.uid() = user_id AND owner_type = 'user') OR
  (current_setting('request.jwt.claims.guest_id', true) = guest_id AND owner_type = 'guest')
);
CREATE POLICY "Allow owner/guest delete access" ON "public"."materials" FOR DELETE USING (
  (auth.uid() = user_id AND owner_type = 'user') OR
  (current_setting('request.jwt.claims.guest_id', true) = guest_id AND owner_type = 'guest')
);


-- Class Members
ALTER TABLE "public"."class_members" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read" ON "public"."class_members" FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM classes 
    WHERE classes.id = class_members.class_id AND (
      (classes.user_id = auth.uid() AND classes.owner_type = 'user') OR
      class_members.user_id = auth.uid()
    )
  )
);
CREATE POLICY "Allow authenticated insert" ON "public"."class_members" FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM classes WHERE classes.id = class_members.class_id
  ) AND (
    class_members.user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM classes WHERE classes.id = class_members.class_id AND classes.user_id = auth.uid())
  )
);
CREATE POLICY "Allow authenticated delete for owners" ON "public"."class_members" FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM classes WHERE classes.id = class_members.class_id AND classes.user_id = auth.uid()
  )
);
