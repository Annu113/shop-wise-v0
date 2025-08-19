import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePersona } from '@/contexts/PersonaContext';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, UserPlus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Invitation {
  id: string;
  invited_email: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled';
  created_at: string;
  expires_at: string;
}

export const HouseholdInvitations = () => {
  const { user } = useAuth();
  const { currentHousehold, inviteToHousehold, cancelInvitation, getHouseholdInvitations } = usePersona();
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const loadInvitations = async () => {
    if (!currentHousehold) return;
    setLoading(true);
    const data = await getHouseholdInvitations();
    setInvitations(data);
    setLoading(false);
  };

  useEffect(() => {
    loadInvitations();
  }, [currentHousehold]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsInviting(true);
    const result = await inviteToHousehold(inviteEmail.trim());
    setIsInviting(false);

    if (result.success) {
      setInviteEmail('');
      setShowInviteDialog(false);
      loadInvitations(); // Reload to show the new invitation
    }
  };

  const handleCancel = async (invitationId: string) => {
    setCancelling(invitationId);
    const result = await cancelInvitation(invitationId);
    setCancelling(null);
    
    if (result.success) {
      loadInvitations(); // Reload to show updated status
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'declined':
        return <XCircle className="h-4 w-4" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'accepted':
        return 'success';
      case 'declined':
        return 'destructive';
      case 'expired':
        return 'secondary';
      case 'cancelled':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (!currentHousehold || currentHousehold.owner_id !== user?.id) {
    return null; // Only show to household owners
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Household Invitations
            </CardTitle>
            <CardDescription>
              Invite family members or roommates to join your household
            </CardDescription>
          </div>
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Household Member</DialogTitle>
                <DialogDescription>
                  Send an email invitation to join "{currentHousehold.name}"
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="invite-email">Email Address</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="friend@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    disabled={isInviting}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowInviteDialog(false)}
                    disabled={isInviting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleInvite}
                    disabled={isInviting || !inviteEmail.trim()}
                    className="flex-1"
                  >
                    {isInviting ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Loading invitations...</p>
          </div>
        ) : invitations.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No invitations sent yet</p>
            <p className="text-sm text-muted-foreground">
              Invite family members or roommates to collaborate on your pantry
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{invitation.invited_email}</p>
                    <p className="text-sm text-muted-foreground">
                      Sent {new Date(invitation.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={getStatusColor(invitation.status) as any}
                    className="flex items-center gap-1"
                  >
                    {getStatusIcon(invitation.status)}
                    {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                  </Badge>
                  {invitation.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(invitation.id)}
                      disabled={cancelling === invitation.id}
                      className="text-destructive hover:text-destructive"
                    >
                      {cancelling === invitation.id ? 'Cancelling...' : 'Cancel'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};