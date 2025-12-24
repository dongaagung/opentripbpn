-- Fix RESTRICTIVE RLS policies by converting them to PERMISSIVE with OR logic
-- This ensures that either condition grants access, not requiring both

-- ===== FIX PROFILES TABLE POLICIES =====
-- Drop existing RESTRICTIVE SELECT policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create single PERMISSIVE SELECT policy with OR logic
CREATE POLICY "Users can view own profile or admins can view all"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Drop existing RESTRICTIVE UPDATE policies
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- Create single PERMISSIVE UPDATE policy with OR logic
CREATE POLICY "Users can update own profile or admins can update any"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- ===== FIX USER_ROLES TABLE POLICIES =====
-- Drop existing RESTRICTIVE policies
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Create PERMISSIVE SELECT policy
CREATE POLICY "Users can view own role or admins can view all"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Create PERMISSIVE policies for INSERT, UPDATE, DELETE (admin only)
CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));