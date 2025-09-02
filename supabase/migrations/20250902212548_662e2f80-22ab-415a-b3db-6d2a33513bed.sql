-- Create honorarium reports table
CREATE TABLE public.honorarium_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  report_month DATE NOT NULL,
  
  -- Self-assessment scores (1-5 scale)
  leadership_effectiveness INTEGER NOT NULL CHECK (leadership_effectiveness >= 1 AND leadership_effectiveness <= 5),
  team_collaboration INTEGER NOT NULL CHECK (team_collaboration >= 1 AND team_collaboration <= 5),
  initiative_taken INTEGER NOT NULL CHECK (initiative_taken >= 1 AND initiative_taken <= 5),
  responsibility_handling INTEGER NOT NULL CHECK (responsibility_handling >= 1 AND responsibility_handling <= 5),
  goal_achievement INTEGER NOT NULL CHECK (goal_achievement >= 1 AND goal_achievement <= 5),
  
  -- Additional feedback
  achievements TEXT,
  challenges TEXT,
  improvement_areas TEXT,
  
  -- Calculated fields
  total_score INTEGER GENERATED ALWAYS AS (leadership_effectiveness + team_collaboration + initiative_taken + responsibility_handling + goal_achievement) STORED,
  suggested_honorarium DECIMAL(10,2),
  
  -- Status and timestamps
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'approved')),
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  
  -- Constraints
  UNIQUE(user_id, report_month),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.honorarium_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can create their own reports" 
ON public.honorarium_reports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reports" 
ON public.honorarium_reports 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own unreviewed reports" 
ON public.honorarium_reports 
FOR UPDATE 
USING (auth.uid() = user_id AND status = 'submitted');

CREATE POLICY "Personnel can view all reports" 
ON public.honorarium_reports 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.posisie = 'Personeel'
));

CREATE POLICY "Personnel can update report status" 
ON public.honorarium_reports 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.posisie = 'Personeel'
));

-- Function to calculate suggested honorarium
CREATE OR REPLACE FUNCTION calculate_suggested_honorarium()
RETURNS TRIGGER AS $$
BEGIN
  -- Simple calculation: base amount + performance bonus
  -- Base: R200, Performance: up to R300 based on total score (max 25)
  NEW.suggested_honorarium = 200 + ((NEW.total_score / 25.0) * 300);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate honorarium
CREATE TRIGGER calculate_honorarium_trigger
  BEFORE INSERT OR UPDATE ON public.honorarium_reports
  FOR EACH ROW
  EXECUTE FUNCTION calculate_suggested_honorarium();

-- Update timestamp trigger
CREATE TRIGGER update_honorarium_reports_updated_at
  BEFORE UPDATE ON public.honorarium_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();