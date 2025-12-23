-- Add must_change_password column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN must_change_password boolean DEFAULT false;

-- Update RLS policy for profiles to allow users to update their own must_change_password
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);