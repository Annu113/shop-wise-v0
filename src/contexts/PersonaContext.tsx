import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
const sb = supabase as any;
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

export type PersonaMode = 'individual' | 'household';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  display_name: string | null;
  persona_mode: PersonaMode;
  current_household_id: string | null;
}

interface Household {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

interface PersonaContextType {
  profile: Profile | null;
  currentHousehold: Household | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updatePersonaMode: (mode: PersonaMode, householdId?: string) => Promise<void>;
  createHousehold: (name: string) => Promise<{ household?: Household; error?: any }>;
  inviteToHousehold: (email: string) => Promise<{ success: boolean; error?: any }>;
  cancelInvitation: (invitationId: string) => Promise<{ success: boolean; error?: any }>;
  getHouseholdInvitations: () => Promise<any[]>;
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

export const usePersona = () => {
  const context = useContext(PersonaContext);
  if (context === undefined) {
    throw new Error('usePersona must be used within a PersonaProvider');
  }
  return context;
};

export const PersonaProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, session } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentHousehold, setCurrentHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setCurrentHousehold(null);
      setLoading(false);
      return;
    }

    try {
      const { data: profileData, error: profileError } = await sb
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        toast.error('Failed to load profile');
        return;
      }

      setProfile(profileData);

      // Fetch current household if user is in household mode
      if (profileData?.persona_mode === 'household' && profileData.current_household_id) {
        const { data: householdData, error: householdError } = await sb
          .from('households')
          .select('*')
          .eq('id', profileData.current_household_id)
          .maybeSingle();

        if (householdError) {
          console.error('Error fetching household:', householdError);
        } else {
          setCurrentHousehold(householdData);
        }
      } else {
        setCurrentHousehold(null);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  const updatePersonaMode = async (mode: PersonaMode, householdId?: string) => {
    if (!user || !profile) return;

    try {
      const updateData: Partial<Profile> = {
        persona_mode: mode,
        current_household_id: mode === 'household' ? householdId || null : null,
      };

      const { error } = await sb
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) {
        toast.error('Failed to update persona mode');
        return;
      }

      await fetchProfile();
      toast.success(`Switched to ${mode} mode`);
    } catch (error) {
      console.error('Error updating persona mode:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const createHousehold = async (name: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      console.log('Creating household with:', { name, owner_id: user.id });
      
      const { data: household, error: householdError } = await sb
        .from('households')
        .insert({
          name,
          owner_id: user.id,
        })
        .select()
        .single();

      console.log('Household creation result:', { household, householdError });

      if (householdError) {
        console.error('Household creation error:', householdError);
        toast.error(`Failed to create household: ${householdError.message}`);
        return { error: householdError };
      }

      // Add user as a member of their own household
      const { error: memberError } = await sb
        .from('household_members')
        .insert({
          household_id: household.id,
          user_id: user.id,
          role: 'owner',
        });

      if (memberError) {
        console.error('Error adding user as household member:', memberError);
      }

      // Update profile to household mode with this household
      await updatePersonaMode('household', household.id);

      toast.success('Household created successfully!');
      return { household };
    } catch (error) {
      console.error('Error creating household:', error);
      toast.error('An unexpected error occurred');
      return { error };
    }
  };

  const inviteToHousehold = async (email: string) => {
    if (!user || !currentHousehold) return { success: false, error: 'No household selected' };

    try {
      // Create invitation record
      const { data: invitation, error: invitationError } = await supabase
        .from('household_invitations')
        .insert({
          household_id: currentHousehold.id,
          invited_email: email,
          invited_by: user.id,
        })
        .select()
        .single();

      if (invitationError) {
        toast.error('Failed to create invitation');
        return { success: false, error: invitationError };
      }

      // Send invitation email
      const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-household-invitation', {
        body: {
          invitedEmail: email,
          householdName: currentHousehold.name,
          inviterName: profile?.display_name || profile?.email || 'Someone',
          invitationId: invitation.id,
        },
      });

      if (emailError) {
        console.error('Email sending error:', emailError);
        toast.error('Invitation created but email failed to send');
        return { success: false, error: emailError };
      }

      toast.success(`Invitation sent to ${email}!`);
      return { success: true };
    } catch (error) {
      console.error('Error inviting to household:', error);
      toast.error('Failed to send invitation');
      return { success: false, error };
    }
  };

  const getHouseholdInvitations = async () => {
    if (!user || !currentHousehold) return [];

    try {
      const { data, error } = await sb
        .from('household_invitations')
        .select('*')
        .eq('household_id', currentHousehold.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invitations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getHouseholdInvitations:', error);
      return [];
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const { error } = await sb
        .from('household_invitations')
        .delete()
        .eq('id', invitationId)
        .eq('invited_by', user.id); // Ensure only the inviter can cancel

      if (error) {
        toast.error('Failed to cancel invitation');
        return { success: false, error };
      }

      toast.success('Invitation cancelled');
      return { success: true };
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      toast.error('Failed to cancel invitation');
      return { success: false, error };
    }
  };

  useEffect(() => {
    if (session) {
      // Small delay to ensure profile is created by trigger
      setTimeout(() => {
        fetchProfile();
      }, 100);
    } else {
      setProfile(null);
      setCurrentHousehold(null);
      setLoading(false);
    }
  }, [session?.user?.id]);

  const value = {
    profile,
    currentHousehold,
    loading,
    refreshProfile,
    updatePersonaMode,
    createHousehold,
    inviteToHousehold,
    cancelInvitation,
    getHouseholdInvitations,
  };

  return <PersonaContext.Provider value={value}>{children}</PersonaContext.Provider>;
};