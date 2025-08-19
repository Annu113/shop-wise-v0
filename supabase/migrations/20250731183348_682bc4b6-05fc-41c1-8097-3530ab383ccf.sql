-- Add 'cancelled' status to household_invitations status enum
ALTER TABLE household_invitations 
DROP CONSTRAINT IF EXISTS household_invitations_status_check;

ALTER TABLE household_invitations 
ADD CONSTRAINT household_invitations_status_check 
CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'cancelled'));