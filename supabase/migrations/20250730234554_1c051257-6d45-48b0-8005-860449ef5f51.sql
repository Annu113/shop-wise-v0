-- Create persona mode enum
CREATE TYPE public.persona_mode AS ENUM ('individual', 'household');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT,
  persona_mode persona_mode NOT NULL DEFAULT 'individual',
  current_household_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create households table
CREATE TABLE public.households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create household members table
CREATE TABLE public.household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(household_id, user_id)
);

-- Create pantry items table
CREATE TABLE public.pantry_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit TEXT,
  category TEXT,
  expiry_date DATE,
  notes TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  household_id UUID REFERENCES public.households(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pantry_items ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

-- Households policies
CREATE POLICY "Users can view households they belong to" ON public.households
FOR SELECT USING (
  auth.uid() = owner_id OR 
  EXISTS (
    SELECT 1 FROM public.household_members 
    WHERE household_id = households.id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create households" ON public.households
FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their households" ON public.households
FOR UPDATE USING (auth.uid() = owner_id);

-- Household members policies
CREATE POLICY "Users can view household members for their households" ON public.household_members
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.households 
    WHERE id = household_id AND (owner_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM public.household_members hm2 WHERE hm2.household_id = household_id AND hm2.user_id = auth.uid()))
  )
);

CREATE POLICY "Household owners can manage members" ON public.household_members
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.households 
    WHERE id = household_id AND owner_id = auth.uid()
  )
);

-- Pantry items policies
CREATE POLICY "Users can view own pantry items" ON public.pantry_items
FOR SELECT USING (
  auth.uid() = user_id OR 
  (household_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.household_members 
    WHERE household_id = pantry_items.household_id AND user_id = auth.uid()
  ))
);

CREATE POLICY "Users can insert pantry items" ON public.pantry_items
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND (
    household_id IS NULL OR EXISTS (
      SELECT 1 FROM public.household_members 
      WHERE household_id = pantry_items.household_id AND user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update own pantry items" ON public.pantry_items
FOR UPDATE USING (
  auth.uid() = user_id OR 
  (household_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.household_members 
    WHERE household_id = pantry_items.household_id AND user_id = auth.uid()
  ))
);

CREATE POLICY "Users can delete own pantry items" ON public.pantry_items
FOR DELETE USING (
  auth.uid() = user_id OR 
  (household_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.household_members 
    WHERE household_id = pantry_items.household_id AND user_id = auth.uid()
  ))
);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updating timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_households_updated_at
  BEFORE UPDATE ON public.households
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pantry_items_updated_at
  BEFORE UPDATE ON public.pantry_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();