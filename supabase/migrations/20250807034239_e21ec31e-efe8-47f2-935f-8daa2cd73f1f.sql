-- Create learning units table
CREATE TABLE public.learning_units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'document')),
  content_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create learning questions table
CREATE TABLE public.learning_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  learning_unit_id UUID NOT NULL REFERENCES public.learning_units(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'short_answer')),
  options JSONB, -- Array of options for multiple choice
  correct_answer TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 1,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user learning progress table
CREATE TABLE public.user_learning_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  learning_unit_id UUID NOT NULL REFERENCES public.learning_units(id) ON DELETE CASCADE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  test_score INTEGER, -- Percentage score (0-100)
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, learning_unit_id)
);

-- Enable Row Level Security
ALTER TABLE public.learning_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for learning_units
CREATE POLICY "Everyone can view active learning units" 
ON public.learning_units 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage learning units" 
ON public.learning_units 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.posisie IN ('HK', 'Personeel')
  )
);

-- RLS Policies for learning_questions
CREATE POLICY "Everyone can view questions for active units" 
ON public.learning_questions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.learning_units 
    WHERE learning_units.id = learning_questions.learning_unit_id 
    AND learning_units.is_active = true
  )
);

CREATE POLICY "Admins can manage learning questions" 
ON public.learning_questions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.posisie IN ('HK', 'Personeel')
  )
);

-- RLS Policies for user_learning_progress
CREATE POLICY "Users can view their own progress" 
ON public.user_learning_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create/update their own progress" 
ON public.user_learning_progress 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress" 
ON public.user_learning_progress 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.posisie IN ('HK', 'Personeel')
  )
);

-- Add updated_at triggers
CREATE TRIGGER update_learning_units_updated_at
  BEFORE UPDATE ON public.learning_units
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_learning_progress_updated_at
  BEFORE UPDATE ON public.user_learning_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();