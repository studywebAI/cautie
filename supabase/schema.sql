--
-- PROFILES
--
-- This table is used to store user-specific data that doesn't fit in auth.users.
--
CREATE TABLE
  profiles (
    id UUID NOT NULL PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    role TEXT DEFAULT 'student'::text,
    full_name TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMPTZ
  );

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON profiles FOR
SELECT
  USING (auth.uid () = id);

CREATE POLICY "Users can update their own profile" ON profiles FOR
UPDATE USING (auth.uid () = id);

--
-- CLASSES
--
-- This table stores information about classes created by teachers.
--
CREATE TABLE
  classes (
    id UUID NOT NULL DEFAULT gen_random_uuid () PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE
  );

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can create classes" ON classes FOR INSERT
WITH
  CHECK (owner_id = auth.uid ());

CREATE POLICY "Class members can view the class" ON classes FOR
SELECT
  USING (
    EXISTS (
      SELECT
        1
      FROM
        class_members
      WHERE
        class_members.class_id = classes.id
        AND class_members.user_id = auth.uid ()
    )
  );

CREATE POLICY "Class owners can update their class" ON classes FOR
UPDATE USING (owner_id = auth.uid ());

CREATE POLICY "Class owners can delete their class" ON classes FOR DELETE USING (owner_id = auth.uid ());

--
-- CLASS MEMBERS
--
-- This table links users (students and teachers) to classes.
--
CREATE TABLE
  class_members (
    class_id UUID NOT NULL REFERENCES classes (id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'student'::text,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (class_id, user_id)
  );

ALTER TABLE class_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Class members can view other members" ON class_members FOR
SELECT
  USING (
    EXISTS (
      SELECT
        1
      FROM
        class_members AS cm
      WHERE
        cm.class_id = class_members.class_id
        AND cm.user_id = auth.uid ()
    )
  );

CREATE POLICY "Class owners can add/remove members" ON class_members FOR ALL USING (
  EXISTS (
    SELECT
      1
    FROM
      classes
    WHERE
      classes.id = class_members.class_id
      AND classes.owner_id = auth.uid ()
  )
);

--
-- ASSIGNMENTS
--
-- This table stores assignments for each class.
--
CREATE TABLE
  assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid () PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    class_id UUID NOT NULL REFERENCES classes (id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    due_date TIMESTAMPTZ,
    content JSONB
  );

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Class members can view assignments" ON assignments FOR
SELECT
  USING (
    EXISTS (
      SELECT
        1
      FROM
        class_members
      WHERE
        class_members.class_id = assignments.class_id
        AND class_members.user_id = auth.uid ()
    )
  );

CREATE POLICY "Teachers can create assignments for their classes" ON assignments FOR INSERT
WITH
  CHECK (
    EXISTS (
      SELECT
        1
      FROM
        class_members
      WHERE
        class_members.class_id = assignments.class_id
        AND class_members.user_id = auth.uid ()
        AND class_members.role = 'teacher'
    )
  );

CREATE POLICY "Teachers can update assignments in their classes" ON assignments FOR
UPDATE USING (
  EXISTS (
    SELECT
      1
    FROM
      class_members
    WHERE
      class_members.class_id = assignments.class_id
      AND class_members.user_id = auth.uid ()
      AND class_members.role = 'teacher'
  )
);

CREATE POLICY "Teachers can delete assignments in their classes" ON assignments FOR DELETE USING (
  EXISTS (
    SELECT
      1
    FROM
      class_members
    WHERE
      class_members.class_id = assignments.class_id
      AND class_members.user_id = auth.uid ()
      AND class_members.role = 'teacher'
  )
);
