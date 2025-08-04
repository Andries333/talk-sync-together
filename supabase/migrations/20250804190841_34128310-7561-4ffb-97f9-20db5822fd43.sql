-- Fix security warning by setting search_path for increment_profile_completion function
CREATE OR REPLACE FUNCTION public.increment_profile_completion()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  -- Only increment if user is updating their own profile
  IF auth.uid() = NEW.user_id THEN
    NEW.profile_completion_count = OLD.profile_completion_count + 1;
  END IF;
  RETURN NEW;
END;
$$;