-- Check and fix infinite recursion in households table policies
-- First, let's see what policies exist and then recreate them properly

-- Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view households they belong to" ON households;
DROP POLICY IF EXISTS "Users can create households" ON households;
DROP POLICY IF EXISTS "Owners can update their households" ON households;

-- Create corrected policies for households table
CREATE POLICY "Users can create their own households" 
ON households FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Household owners can view and update their households" 
ON households FOR ALL 
USING (auth.uid() = owner_id);

CREATE POLICY "Household members can view their households" 
ON households FOR SELECT 
USING (
  auth.uid() = owner_id 
  OR EXISTS (
    SELECT 1 FROM household_members 
    WHERE household_members.household_id = households.id 
    AND household_members.user_id = auth.uid()
  )
);