-- Create household invitations table
CREATE TABLE public.household_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID NOT NULL,
  invited_email TEXT NOT NULL,
  invited_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT household_invitations_household_id_fkey FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
  CONSTRAINT household_invitations_status_check CHECK (status IN ('pending', 'accepted', 'declined', 'expired'))
);

-- Enable RLS on household invitations
ALTER TABLE public.household_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for household invitations
CREATE POLICY "household_invitations_insert_policy" 
ON household_invitations FOR INSERT 
WITH CHECK (auth.uid() = invited_by);

CREATE POLICY "household_invitations_select_policy" 
ON household_invitations FOR SELECT 
USING (
  auth.uid() = invited_by 
  OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.email = household_invitations.invited_email
  )
);

CREATE POLICY "household_invitations_update_policy" 
ON household_invitations FOR UPDATE 
USING (
  auth.uid() = invited_by 
  OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.email = household_invitations.invited_email
  )
);

-- Add updated_at trigger for household_invitations
CREATE TRIGGER update_household_invitations_updated_at
BEFORE UPDATE ON public.household_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_household_invitations_email ON household_invitations(invited_email);
CREATE INDEX idx_household_invitations_household_id ON household_invitations(household_id);
CREATE INDEX idx_household_invitations_status ON household_invitations(status);