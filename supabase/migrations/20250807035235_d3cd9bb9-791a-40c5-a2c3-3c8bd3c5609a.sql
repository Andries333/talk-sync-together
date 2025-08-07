-- Create notifications table
CREATE TABLE public.notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    sender_id UUID NOT NULL,
    target_audience TEXT NOT NULL, -- 'alle_leiers', 'alle_personeel', 'alle_hks', 'alle_srs', 'sport', 'kultuur', 'sosiaal', 'studente_ondersteuning', 'voorsitter', 'ondervoorsitter'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view notifications" 
ON public.notifications 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = auth.uid() 
        AND posisie IN ('HK', 'Personeel')
    )
);

-- Create user_notifications table to track read status
CREATE TABLE public.user_notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, notification_id)
);

-- Enable RLS
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for user_notifications
CREATE POLICY "Users can view their own notification status" 
ON public.user_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notification status" 
ON public.user_notifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification status" 
ON public.user_notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();