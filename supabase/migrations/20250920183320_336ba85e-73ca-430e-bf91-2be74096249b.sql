-- Create enum for persona modes
CREATE TYPE public.persona_mode AS ENUM ('individual', 'household');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  persona_mode persona_mode DEFAULT 'individual',
  current_household_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create households table
CREATE TABLE public.households (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create household_members table
CREATE TABLE public.household_members (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id),
  UNIQUE(household_id, user_id)
);

-- Create household_invitations table
CREATE TABLE public.household_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Add foreign key constraint for current_household_id
ALTER TABLE public.profiles ADD CONSTRAINT fk_profiles_current_household 
  FOREIGN KEY (current_household_id) REFERENCES public.households(id) ON DELETE SET NULL;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for households
CREATE POLICY "Users can view households they belong to" ON public.households
  FOR SELECT USING (
    id IN (
      SELECT household_id FROM public.household_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create households" ON public.households
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Household owners can update their households" ON public.households
  FOR UPDATE USING (auth.uid() = owner_id);

-- RLS Policies for household_members
CREATE POLICY "Users can view members of their households" ON public.household_members
  FOR SELECT USING (
    household_id IN (
      SELECT household_id FROM public.household_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert themselves as household members" ON public.household_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for household_invitations
CREATE POLICY "Users can view invitations for their households" ON public.household_invitations
  FOR SELECT USING (
    household_id IN (
      SELECT household_id FROM public.household_members 
      WHERE user_id = auth.uid()
    )
    OR invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can create invitations for their households" ON public.household_invitations
  FOR INSERT WITH CHECK (
    household_id IN (
      SELECT household_id FROM public.household_members 
      WHERE user_id = auth.uid()
    )
    AND auth.uid() = invited_by
  );

CREATE POLICY "Users can update invitations they received" ON public.household_invitations
  FOR UPDATE USING (
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can delete invitations for their households" ON public.household_invitations
  FOR DELETE USING (
    household_id IN (
      SELECT household_id FROM public.household_members 
      WHERE user_id = auth.uid()
    )
  );

-- Create function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_households_updated_at
  BEFORE UPDATE ON public.households
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_household_invitations_updated_at
  BEFORE UPDATE ON public.household_invitations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();