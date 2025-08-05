-- Create daily_checkins table
CREATE TABLE public.daily_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_rating INTEGER NOT NULL CHECK (mood_rating >= 1 AND mood_rating <= 5),
  mood_label TEXT NOT NULL,
  questions_suggestions TEXT,
  check_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own check-ins" 
ON public.daily_checkins 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own check-ins" 
ON public.daily_checkins 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all check-ins" 
ON public.daily_checkins 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND posisie IN ('HK', 'Personeel')
  )
);

-- Create unique index to prevent multiple check-ins per day
CREATE UNIQUE INDEX daily_checkins_user_date_unique 
ON public.daily_checkins (user_id, check_in_date);

-- Add trigger for updated_at
CREATE TRIGGER update_daily_checkins_updated_at
BEFORE UPDATE ON public.daily_checkins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create honorarium calculation function
CREATE OR REPLACE FUNCTION public.calculate_monthly_honorarium_impact(
  p_user_id UUID,
  p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  p_month INTEGER DEFAULT EXTRACT(MONTH FROM CURRENT_DATE)
)
RETURNS DECIMAL(5,2)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  avg_mood DECIMAL(3,2);
  impact_percentage DECIMAL(5,2);
BEGIN
  -- Calculate average mood for the specified month
  SELECT COALESCE(AVG(mood_rating), 0)
  INTO avg_mood
  FROM public.daily_checkins
  WHERE user_id = p_user_id
    AND EXTRACT(YEAR FROM check_in_date) = p_year
    AND EXTRACT(MONTH FROM check_in_date) = p_month;
  
  -- Convert to percentage impact (max 20%)
  -- 5.0 avg = 20%, 1.0 avg = 4%, linear scale
  impact_percentage = ((avg_mood - 1) / 4) * 20;
  
  RETURN GREATEST(0, LEAST(20, impact_percentage));
END;
$$;