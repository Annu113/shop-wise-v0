-- Fix infinite recursion in household_members RLS policies
-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view household members for their households" ON household_members;
DROP POLICY IF EXISTS "Household owners can manage members" ON household_members;

-- Create corrected policies that don't cause infinite recursion
CREATE POLICY "Users can view household members for their own households" 
ON household_members FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM households 
    WHERE households.id = household_members.household_id 
    AND (households.owner_id = auth.uid() OR household_members.user_id = auth.uid())
  )
);

CREATE POLICY "Household owners can manage all members" 
ON household_members FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM households 
    WHERE households.id = household_members.household_id 
    AND households.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can be added to households" 
ON household_members FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM households 
    WHERE households.id = household_members.household_id 
    AND households.owner_id = auth.uid()
  )
);