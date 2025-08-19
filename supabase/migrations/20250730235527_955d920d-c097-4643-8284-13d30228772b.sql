-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('expiring', 'shopping', 'reminder', 'achievement')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications" ON public.notifications
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON public.notifications
FOR DELETE USING (auth.uid() = user_id);

-- Add updated_at trigger for notifications
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;