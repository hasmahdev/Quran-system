-- Create the users table if it doesn't already exist
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('developer', 'admin', 'user', 'teacher', 'student')),
    phone TEXT,
    progress_surah INTEGER,
    progress_ayah INTEGER,
    progress_page INTEGER
);

-- Insert the developer user if they don't exist, or update their password if they do.
-- This "upsert" command ensures the password is correct without causing errors on re-runs.
INSERT INTO users (username, password, role) VALUES
('developer', '$2a$10$Vk5cjiLPNYzNT3UZPfpqJuzHFz0EWC1bHrsao61LiCeTCWy18XdLq', 'developer')
ON CONFLICT (username) DO UPDATE SET
password = EXCLUDED.password;

-- Create the classes table if it doesn't already exist
CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create the class_members join table if it doesn't already exist
CREATE TABLE IF NOT EXISTS class_members (
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (class_id, student_id)
);

-- Create the progress table if it doesn't already exist
