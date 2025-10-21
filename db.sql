-- Create the students table
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    progress_surah INTEGER,
    progress_ayah INTEGER
);

-- Create the admin_settings table
CREATE TABLE admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    password_hash TEXT NOT NULL
);

-- Insert a placeholder for the admin password.
-- You will need to replace 'your_hashed_password_here' with the actual hashed password.
INSERT INTO admin_settings (password_hash) VALUES ('your_hashed_password_here');
