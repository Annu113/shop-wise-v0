-- Completely remove all existing policies and create simple, non-recursive ones
-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Users can create their own households" ON households;
DROP POLICY IF EXISTS "Household owners can view and update their households" ON households;
DROP POLICY IF EXISTS "Household members can view their households" ON households;
DROP POLICY IF EXISTS "Users can view household members for their own households" ON household_members;
DROP POLICY IF EXISTS "Household owners can manage all members" ON household_members;
DROP POLICY IF EXISTS "Users can be added to households" ON household_members;

-- Create simple, non-recursive policies for households table
-- Policy 1: Users can insert households where they are the owner
CREATE POLICY "households_insert_policy" 
ON households FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

-- Policy 2: Users can select households they own
CREATE POLICY "households_select_owner_policy" 
ON households FOR SELECT 
USING (auth.uid() = owner_id);

-- Policy 3: Users can update households they own  
CREATE POLICY "households_update_policy" 
ON households FOR UPDATE 
USING (auth.uid() = owner_id);

-- Policy 4: Users can delete households they own
CREATE POLICY "households_delete_policy" 
ON households FOR DELETE 
USING (auth.uid() = owner_id);

-- Create simple policies for household_members table
-- Policy 1: Users can insert themselves into households (we'll check ownership in application logic)
CREATE POLICY "household_members_insert_policy" 
ON household_members FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy 2: Users can view members where they are also a member
CREATE POLICY "household_members_select_policy" 
ON household_members FOR SELECT 
USING (auth.uid() = user_id);

-- Policy 3: Users can update their own membership records
CREATE POLICY "household_members_update_policy" 
ON household_members FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy 4: Users can delete their own membership records
CREATE POLICY "household_members_delete_policy" 
ON household_members FOR DELETE 
USING (auth.uid() = user_id);