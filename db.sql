-- Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS admin_settings;

-- Create the users table to handle all roles
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('developer', 'admin', 'user', 'teacher', 'student'))
);

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

-- Create the progress table to track student progress within a class context
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

-- Insert a default developer user for initial setup
-- You should replace 'your_hashed_password_here' with an actual hashed password during deployment
INSERT INTO users (full_name, username, password_hash, role) VALUES ('Default Developer', 'developer', 'your_hashed_password_here', 'developer');
