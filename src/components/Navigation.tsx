import { Leaf, Menu, Settings, Info, HelpCircle, LogOut, Users, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationsPopover } from "./NotificationsPopover";
import { useAuth } from "@/contexts/AuthContext";
import { usePersona } from "@/contexts/PersonaContext";

export const Navigation = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, currentHousehold } = usePersona();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleAuth = () => {
    navigate('/auth');
  };

  const handleManagePersona = () => {
    navigate('/manage-persona');
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Leaf className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">ShopWise</span>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Persona Indicator */}
            {user && profile && (
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={profile.persona_mode === 'household' ? 'default' : 'secondary'}
                  className="text-xs flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={handleManagePersona}
                >
                  {profile.persona_mode === 'household' ? (
                    <Users className="w-3 h-3" />
                  ) : (
                    <User className="w-3 h-3" />
                  )}
                  {profile.persona_mode === 'household' && currentHousehold 
                    ? currentHousehold.name 
                    : profile.persona_mode === 'household' 
                      ? 'Household' 
                      : 'Individual'
                  }
                </Badge>
              </div>
            )}

            {user && <NotificationsPopover />}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {user ? (
                  <>
                    <DropdownMenuItem onClick={handleManagePersona}>
                      <Users className="w-4 h-4 mr-2" />
                      Manage Persona
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Info className="w-4 h-4 mr-2" />
                      About
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Help & Support
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={handleAuth}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign In
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Info className="w-4 h-4 mr-2" />
                      About
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Help & Support
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};