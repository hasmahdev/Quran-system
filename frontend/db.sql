-- Drop existing tables in reverse order of creation to handle dependencies
DROP TABLE IF EXISTS progress;
DROP TABLE IF EXISTS class_members;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS users; -- Drop the new users table if it exists

-- Create the custom users table for NextAuth
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('developer', 'admin', 'user', 'teacher', 'student'))
);

-- Insert the default developer user with a securely hashed password for "admins1"
INSERT INTO users (username, password_hash, role) VALUES
('developer', '$2a$12$K/7czCYgzNGHX0kQSIk/tOLNS3XfPigInKLzgLJO76MP7RmCGyHK6', 'developer');

-- Create the classes table, linked to a teacher
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create the class_members join table to link students to classes
CREATE TABLE class_members (
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    PRIMARY KEY (class_id, student_id)
);

-- Create the progress table to track student progress
CREATE TABLE progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_member_class_id UUID NOT NULL,
    class_member_student_id UUID NOT NULL,
    surah INTEGER,
    ayah INTEGER,
    page INTEGER,
    updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by UUID NOT NULL REFERENCES public.users(id), -- Teacher who updated it
    FOREIGN KEY (class_member_class_id, class_member_student_id) REFERENCES public.class_members(class_id, student_id) ON DELETE CASCADE
);
