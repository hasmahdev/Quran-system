-- Drop existing tables in reverse order of creation to handle dependencies
DROP TABLE IF EXISTS progress;
DROP TABLE IF EXISTS class_members;
DROP TABLE IF EXISTS classes;

-- Create the classes table, linked to a teacher.
-- The teacher_id now correctly references the user's profile ID.
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Create the class_members join table to link students to classes.
-- The student_id now correctly references the user's profile ID.
CREATE TABLE class_members (
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (class_id, student_id)
);

-- Create the progress table to track student progress.
-- The updated_by field now correctly references the user's profile ID.
CREATE TABLE progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_member_class_id UUID NOT NULL,
    class_member_student_id UUID NOT NULL,
    surah INTEGER,
    ayah INTEGER,
    page INTEGER,
    updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by UUID NOT NULL REFERENCES public.profiles(id), -- Teacher who updated it
    FOREIGN KEY (class_member_class_id, class_member_student_id) REFERENCES public.class_members(class_id, student_id) ON DELETE CASCADE
);

-- Note: The `public.users` table has been removed. User management is now handled
-- by Supabase Auth (`auth.users`) and the `public.profiles` table, which is
-- created and managed via the migration file.
-- Default users should be created via the application's sign-up process.
