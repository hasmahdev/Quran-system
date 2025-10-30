-- Drop tables in reverse order of foreign key constraints to avoid errors
DROP TABLE IF EXISTS progress;
DROP TABLE IF EXISTS class_members;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS users;

-- Create the users table with an auto-incrementing integer ID
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('developer', 'admin', 'user', 'teacher', 'student')),
    -- Added for the student's own progress tracking, as seen in getMyData handler
    progress_surah INT DEFAULT 1,
    progress_ayah INT DEFAULT 1,
    progress_page INT DEFAULT 1
);

-- Insert the default developer user with the password "admins1"
INSERT INTO users (username, password, role) VALUES
('developer', '$2a$12$K/7czCYgzNGHX0kQSIk/tOLNS3XfPigInKLzgLJO76MP7RmCGyHK6', 'developer');

-- Create the classes table, linked to a teacher by their integer ID
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create the class_members join table to link students to classes
CREATE TABLE class_members (
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (class_id, student_id)
);

-- Create the progress table to track student progress within a class
CREATE TABLE progress (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL,
    surah INTEGER,
    ayah INTEGER,
    page INTEGER,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by INTEGER NOT NULL REFERENCES users(id), -- Teacher who updated it
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);
