-- Create storage bucket for learning content
INSERT INTO storage.buckets (id, name, public)
VALUES ('learning-content', 'learning-content', true);

-- Create RLS policies for learning content bucket
CREATE POLICY "Admins can upload learning content" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'learning-content' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND posisie IN ('HK', 'Personeel')
  )
);

CREATE POLICY "Everyone can view learning content" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'learning-content');

CREATE POLICY "Admins can update learning content" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'learning-content' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND posisie IN ('HK', 'Personeel')
  )
);

CREATE POLICY "Admins can delete learning content" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'learning-content' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND posisie IN ('HK', 'Personeel')
  )
);