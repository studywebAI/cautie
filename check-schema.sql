-- Check what tables and columns actually exist in the database

-- List all tables in public schema
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check assignments table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'assignments' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check classes table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'classes' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check class_members table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'class_members' AND table_schema = 'public'
ORDER BY ordinal_position;