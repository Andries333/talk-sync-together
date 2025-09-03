-- Add 10 specific monthly assessment questions
ALTER TABLE public.honorarium_reports 
DROP COLUMN leadership_effectiveness,
DROP COLUMN team_collaboration, 
DROP COLUMN initiative_taken,
DROP COLUMN responsibility_handling,
DROP COLUMN goal_achievement;

-- Add 10 specific questions (1-5 scale each)
ALTER TABLE public.honorarium_reports 
ADD COLUMN q1_leadership_vision INTEGER CHECK (q1_leadership_vision >= 1 AND q1_leadership_vision <= 5),
ADD COLUMN q2_team_motivation INTEGER CHECK (q2_team_motivation >= 1 AND q2_team_motivation <= 5),
ADD COLUMN q3_conflict_resolution INTEGER CHECK (q3_conflict_resolution >= 1 AND q3_conflict_resolution <= 5),
ADD COLUMN q4_communication_skills INTEGER CHECK (q4_communication_skills >= 1 AND q4_communication_skills <= 5),
ADD COLUMN q5_project_management INTEGER CHECK (q5_project_management >= 1 AND q5_project_management <= 5),
ADD COLUMN q6_student_engagement INTEGER CHECK (q6_student_engagement >= 1 AND q6_student_engagement <= 5),
ADD COLUMN q7_problem_solving INTEGER CHECK (q7_problem_solving >= 1 AND q7_problem_solving <= 5),
ADD COLUMN q8_time_management INTEGER CHECK (q8_time_management >= 1 AND q8_time_management <= 5),
ADD COLUMN q9_innovation_creativity INTEGER CHECK (q9_innovation_creativity >= 1 AND q9_innovation_creativity <= 5),
ADD COLUMN q10_mentorship_support INTEGER CHECK (q10_mentorship_support >= 1 AND q10_mentorship_support <= 5);

-- Update the total score calculation for 10 questions (max 50)
ALTER TABLE public.honorarium_reports 
DROP COLUMN total_score;

ALTER TABLE public.honorarium_reports 
ADD COLUMN total_score INTEGER GENERATED ALWAYS AS (
  COALESCE(q1_leadership_vision, 0) + 
  COALESCE(q2_team_motivation, 0) + 
  COALESCE(q3_conflict_resolution, 0) + 
  COALESCE(q4_communication_skills, 0) + 
  COALESCE(q5_project_management, 0) + 
  COALESCE(q6_student_engagement, 0) + 
  COALESCE(q7_problem_solving, 0) + 
  COALESCE(q8_time_management, 0) + 
  COALESCE(q9_innovation_creativity, 0) + 
  COALESCE(q10_mentorship_support, 0)
) STORED;

-- Update the honorarium calculation function for 50 max points
CREATE OR REPLACE FUNCTION calculate_suggested_honorarium()
RETURNS TRIGGER AS $$
BEGIN
  -- Base: R300, Performance: up to R400 based on total score (max 50)
  -- Excellent (40-50): R600-700, Good (30-39): R500-599, Average (20-29): R400-499, Below (10-19): R300-399
  NEW.suggested_honorarium = 300 + ((NEW.total_score / 50.0) * 400);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;