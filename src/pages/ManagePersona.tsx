import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { usePersona, PersonaMode } from '@/contexts/PersonaContext';
import { HouseholdInvitations } from '@/components/HouseholdInvitations';
import { Users, User, Home, Plus, ArrowLeft, Crown } from 'lucide-react';
import { toast } from 'sonner';

const ManagePersona = () => {
  const { user } = useAuth();
  const { profile, currentHousehold, updatePersonaMode, createHousehold } = usePersona();
  const navigate = useNavigate();
  const [newHouseholdName, setNewHouseholdName] = useState('');
  const [isCreatingHousehold, setIsCreatingHousehold] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading your profile...</h2>
          <p className="text-muted-foreground">Please wait a moment</p>
        </div>
      </div>
    );
  }

  const handleModeSwitch = async (mode: PersonaMode) => {
    if (mode === profile.persona_mode) return;

    if (mode === 'household' && !currentHousehold) {
      toast.error('Please create a household first');
      return;
    }

    await updatePersonaMode(mode, mode === 'household' ? currentHousehold?.id : undefined);
  };

  const handleCreateHousehold = async () => {
    if (!newHouseholdName.trim()) {
      toast.error('Please enter a household name');
      return;
    }

    setIsCreatingHousehold(true);
    const result = await createHousehold(newHouseholdName.trim());
    setIsCreatingHousehold(false);

    if (!result.error) {
      setNewHouseholdName('');
      setShowCreateDialog(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>

        <div className="text-center mb-6 sm:mb-8 px-2">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Manage Your Persona</h1>
          <p className="text-sm sm:text-base text-muted-foreground px-2">
            Choose how you want to use Smart Pantry - individually or with your household
          </p>
          <div className="mt-4">
            <Badge variant={profile.persona_mode === 'individual' ? 'default' : 'secondary'} className="text-xs sm:text-sm">
              Current Mode: {profile.persona_mode === 'individual' ? 'Individual' : 'Household'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Individual Mode Card */}
          <Card className={`cursor-pointer transition-all ${
            profile.persona_mode === 'individual' 
              ? 'ring-2 ring-primary bg-primary/5' 
              : 'hover:shadow-lg'
          }`}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                <User className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <CardTitle className="flex flex-col sm:flex-row items-center justify-center gap-2 text-lg sm:text-xl">
                Individual Mode
                {profile.persona_mode === 'individual' && (
                  <Badge variant="default" className="text-xs">Active</Badge>
                )}
              </CardTitle>
              <CardDescription className="text-sm px-2">
                Manage your personal pantry independently
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                <li>• Private pantry management</li>
                <li>• Personal shopping lists</li>
                <li>• Individual meal planning</li>
                <li>• Full control over your data</li>
              </ul>
              <Button
                variant={profile.persona_mode === 'individual' ? 'secondary' : 'default'}
                className="w-full"
                onClick={() => handleModeSwitch('individual')}
                disabled={profile.persona_mode === 'individual'}
              >
                {profile.persona_mode === 'individual' ? 'Currently Active' : 'Switch to Individual'}
              </Button>
            </CardContent>
          </Card>

          {/* Household Mode Card */}
          <Card className={`cursor-pointer transition-all ${
            profile.persona_mode === 'household' 
              ? 'ring-2 ring-primary bg-primary/5' 
              : 'hover:shadow-lg'
          }`}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <CardTitle className="flex flex-col sm:flex-row items-center justify-center gap-2 text-lg sm:text-xl">
                Household Mode
                {profile.persona_mode === 'household' && (
                  <Badge variant="default" className="text-xs">Active</Badge>
                )}
              </CardTitle>
              <CardDescription className="text-sm px-2">
                Share and manage pantry with household members
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                <li>• Shared pantry with family/roommates</li>
                <li>• Collaborative shopping lists</li>
                <li>• Real-time sync across devices</li>
                <li>• Member management</li>
              </ul>
              
              {currentHousehold ? (
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Home className="h-4 w-4" />
                      <span className="font-medium">{currentHousehold.name}</span>
                      {currentHousehold.owner_id === user.id && (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {currentHousehold.owner_id === user.id ? 'You are the owner' : 'You are a member'}
                    </p>
                  </div>
                  <Button
                    variant={profile.persona_mode === 'household' ? 'secondary' : 'default'}
                    className="w-full"
                    onClick={() => handleModeSwitch('household')}
                    disabled={profile.persona_mode === 'household'}
                  >
                    {profile.persona_mode === 'household' ? 'Currently Active' : 'Switch to Household'}
                  </Button>
                </div>
              ) : (
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Household
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Household</DialogTitle>
                      <DialogDescription>
                        Enter a name for your household. You can invite family members or roommates later.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="household-name">Household Name</Label>
                        <Input
                          id="household-name"
                          placeholder="e.g., The Smith Family, Apartment 3B"
                          value={newHouseholdName}
                          onChange={(e) => setNewHouseholdName(e.target.value)}
                          disabled={isCreatingHousehold}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowCreateDialog(false)}
                          disabled={isCreatingHousehold}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreateHousehold}
                          disabled={isCreatingHousehold || !newHouseholdName.trim()}
                          className="flex-1"
                        >
                          {isCreatingHousehold ? 'Creating...' : 'Create'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Current Status */}
        <Card className="mb-4">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">Current Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h4 className="font-medium mb-2 text-sm sm:text-base">Profile Information</h4>
                <div className="space-y-1 text-sm">
                  <p className="break-words"><strong>Name:</strong> {profile.display_name || 'Not set'}</p>
                  <p className="break-all"><strong>Email:</strong> {profile.email}</p>
                  <p><strong>Mode:</strong> {profile.persona_mode}</p>
                </div>
              </div>
              
              {profile.persona_mode === 'household' && currentHousehold && (
                <div>
                  <h4 className="font-medium mb-2 text-sm sm:text-base">Household Information</h4>
                  <div className="space-y-1 text-sm">
                    <p className="break-words"><strong>Household:</strong> {currentHousehold.name}</p>
                    <p><strong>Role:</strong> {currentHousehold.owner_id === user.id ? 'Owner' : 'Member'}</p>
                    <p><strong>Created:</strong> {new Date(currentHousehold.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Household Invitations */}
        <HouseholdInvitations />
      </div>
    </div>
  );
};

export default ManagePersona;