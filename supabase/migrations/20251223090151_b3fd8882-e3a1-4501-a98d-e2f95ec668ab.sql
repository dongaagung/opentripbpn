-- Update has_role function to use plpgsql with input validation
-- SECURITY: This function uses SECURITY DEFINER, so input validation is critical
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Input validation: return FALSE for NULL user_id
  IF _user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user has the specified role
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$;

-- Add comment documenting security considerations
COMMENT ON FUNCTION public.has_role(_user_id UUID, _role app_role) IS 
'Checks if a user has a specific role. Uses SECURITY DEFINER for RLS policy access. 
Input validation: Returns FALSE for NULL user_id. 
Called by RLS policies to enforce role-based access control.';