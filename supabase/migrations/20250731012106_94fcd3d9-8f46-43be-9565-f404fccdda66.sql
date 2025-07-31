-- Add new fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN posisie TEXT,
ADD COLUMN koshuis TEXT,
ADD COLUMN verjaarsdag DATE,
ADD COLUMN telefoonnommer TEXT,
ADD COLUMN profile_completion_count INTEGER DEFAULT 0;

-- Create function to increment profile completion count
CREATE OR REPLACE FUNCTION public.increment_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Only increment if user is updating their own profile
  IF auth.uid() = NEW.user_id THEN
    NEW.profile_completion_count = OLD.profile_completion_count + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profile completion tracking
CREATE TRIGGER on_profile_update_increment_completion
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_profile_completion();

-- Update the handle_new_user function to include new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name, studierigting, posisie_hk_sr, profile_completion_count)
  VALUES (
    NEW.id, 
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.raw_user_meta_data ->> 'studierigting',
    NEW.raw_user_meta_data ->> 'posisie_hk_sr',
    0
  );
  RETURN NEW;
END;
$$;