-- Create the public.profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('developer', 'admin', 'user', 'teacher', 'student'))
);

-- Create a trigger function to populate the public.profiles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, role)
    VALUES (new.id, new.raw_user_meta_data->>'app_role');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger to call the function on new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS for the public.profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies to allow users to read their own profile
CREATE POLICY "Users can read their own profile"
ON public.profiles
FOR SELECT USING (auth.uid() = id);
