import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { usePersona } from '@/contexts/PersonaContext';
import { supabase } from '@/integrations/supabase/client';
const sb = supabase as any;
import { Users, CheckCircle, XCircle, Clock, Home, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface InvitationData {
  id: string;
  household_id: string;
  invited_email: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expires_at: string;
  household: {
    name: string;
    owner_id: string;
  };
  inviter: {
    display_name: string;
    email: string;
  };
}

const AcceptInvitation = () => {
  const { user } = useAuth();
  const { refreshProfile } = usePersona();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const invitationId = searchParams.get('id');

  useEffect(() => {
    const loadInvitation = async () => {
      if (!invitationId) {
        setError('Invalid invitation link');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await sb
          .from('household_invitations')
          .select(`
            id,
            household_id,
            invited_email,
            invited_by,
            status,
            expires_at
          `)
          .eq('id', invitationId)
          .single();

        if (error) {
          setError('Invitation not found');
          return;
        }

        if (!data) {
          setError('Invitation not found');
          return;
        }

        // Fetch household data separately
        const { data: householdData } = await sb
          .from('households')
          .select('name, owner_id')
          .eq('id', data.household_id)
          .single();

        // Fetch inviter data separately
        const { data: inviterData } = await sb
          .from('profiles')
          .select('display_name, email')
          .eq('user_id', data.invited_by)
          .single();

        // Check if invitation is expired
        if (new Date(data.expires_at) < new Date()) {
          await sb
            .from('household_invitations')
            .update({ status: 'expired' })
            .eq('id', invitationId);
          
          setError('This invitation has expired');
          return;
        }

        // Transform the data to match our interface
        const transformedData: InvitationData = {
          id: data.id,
          household_id: data.household_id,
          invited_email: data.invited_email,
          status: data.status as 'pending' | 'accepted' | 'declined' | 'expired',
          expires_at: data.expires_at,
          household: {
            name: householdData?.name || 'Unknown Household',
            owner_id: householdData?.owner_id || '',
          },
          inviter: {
            display_name: inviterData?.display_name || '',
            email: inviterData?.email || '',
          },
        };

        setInvitation(transformedData);
      } catch (err) {
        console.error('Error loading invitation:', err);
        setError('Failed to load invitation');
      } finally {
        setLoading(false);
      }
    };

    loadInvitation();
  }, [invitationId]);

  const handleAccept = async () => {
    if (!invitation || !user) return;

    // Check if user's email matches the invitation
    if (user.email !== invitation.invited_email) {
      toast.error(`This invitation is for ${invitation.invited_email}. Please sign in with the correct email.`);
      return;
    }

    setProcessing(true);
    
    try {
      // Update invitation status
      const { error: invitationError } = await sb
        .from('household_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id);

      if (invitationError) {
        throw invitationError;
      }

      // Add user to household members
      const { error: memberError } = await sb
        .from('household_members')
        .insert({
          household_id: invitation.household_id,
          user_id: user.id,
          role: 'member',
        });

      if (memberError) {
        throw memberError;
      }

      // Update user's profile to household mode
      const { error: profileError } = await sb
        .from('profiles')
        .update({
          persona_mode: 'household',
          current_household_id: invitation.household_id,
        })
        .eq('user_id', user.id);

      if (profileError) {
        throw profileError;
      }

      await refreshProfile();
      toast.success(`Welcome to ${invitation.household.name}!`);
      navigate('/manage-persona');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error('Failed to accept invitation');
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!invitation) return;

    setProcessing(true);
    
    try {
      const { error } = await sb
        .from('household_invitations')
        .update({ status: 'declined' })
        .eq('id', invitation.id);

      if (error) {
        throw error;
      }

      toast.success('Invitation declined');
      navigate('/');
    } catch (error) {
      console.error('Error declining invitation:', error);
      toast.error('Failed to decline invitation');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/10">
        <div className="text-center">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-spin" />
          <h2 className="text-xl font-semibold mb-2">Loading invitation...</h2>
          <p className="text-muted-foreground">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/10">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  if (invitation.status !== 'pending') {
    const statusConfig = {
      accepted: {
        icon: CheckCircle,
        color: 'text-green-500',
        title: 'Invitation Already Accepted',
        description: 'You have already joined this household.',
      },
      declined: {
        icon: XCircle,
        color: 'text-red-500',
        title: 'Invitation Declined',
        description: 'You have declined this invitation.',
      },
      expired: {
        icon: AlertCircle,
        color: 'text-orange-500',
        title: 'Invitation Expired',
        description: 'This invitation has expired.',
      },
    };

    const config = statusConfig[invitation.status];
    const Icon = config.icon;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/10">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Icon className={`h-12 w-12 mx-auto mb-4 ${config.color}`} />
            <CardTitle>{config.title}</CardTitle>
            <CardDescription>{config.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/10 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Household Invitation</CardTitle>
          <CardDescription>
            You've been invited to join a household on Smart Pantry
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">{invitation.household.name}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <p><strong>Invited by:</strong> {invitation.inviter.display_name || invitation.inviter.email}</p>
              <p><strong>Email:</strong> {invitation.invited_email}</p>
              <p><strong>Expires:</strong> {new Date(invitation.expires_at).toLocaleDateString()}</p>
            </div>
          </div>

          {!user ? (
            <div className="space-y-4">
              <p className="text-center text-muted-foreground">
                Please sign in to accept this invitation
              </p>
              <Button onClick={() => navigate('/auth')} className="w-full">
                Sign In
              </Button>
            </div>
          ) : user.email !== invitation.invited_email ? (
            <div className="space-y-4">
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  This invitation is for <strong>{invitation.invited_email}</strong> but you're signed in as <strong>{user.email}</strong>.
                  Please sign in with the correct email address.
                </p>
              </div>
              <Button onClick={() => navigate('/auth')} variant="outline" className="w-full">
                Sign In with Different Email
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">What happens when you join?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Share pantry items with household members</li>
                  <li>• Collaborate on shopping lists</li>
                  <li>• Get notifications about expiring items</li>
                  <li>• Work together to reduce food waste</li>
                </ul>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleDecline}
                  disabled={processing}
                  className="flex-1"
                >
                  Decline
                </Button>
                <Button 
                  onClick={handleAccept}
                  disabled={processing}
                  className="flex-1"
                >
                  {processing ? 'Joining...' : 'Accept & Join'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitation;