-- Remove any existing cancelled invitations
DELETE FROM public.household_invitations 
WHERE status = 'cancelled';