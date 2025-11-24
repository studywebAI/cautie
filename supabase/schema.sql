-- Create the 'classes' table
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create the 'assignments' table
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) for the tables
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

--
-- RLS Policies for 'classes' table
--

-- 1. Allow owners to do everything on their own classes
CREATE POLICY "Allow full access to owners"
ON classes
FOR ALL
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);


--
-- RLS Policies for 'assignments' table
--

-- 1. Allow class owners to do everything on their assignments
CREATE POLICY "Allow full access to class owners"
ON assignments
FOR ALL
USING (auth.uid() = (SELECT owner_id FROM classes WHERE id = class_id));
