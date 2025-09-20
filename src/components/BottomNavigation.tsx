import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Package, TrendingUp, ShoppingCart, BarChart3 } from "lucide-react";

export const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isPrototype = location.pathname.startsWith('/prototype');

  const handleNavigation = (section: string) => {
    if (isPrototype) {
      // In prototype mode, navigate within prototype with sections
      navigate(`/prototype?section=${section}`);
    } else {
      // In normal mode, navigate to the actual routes
      navigate(section === 'home' ? '/' : `/${section}`);
    }
  };

  const getActiveSection = () => {
    if (isPrototype) {
      const searchParams = new URLSearchParams(location.search);
      return searchParams.get('section') || 'home';
    } else {
      if (location.pathname === '/') return 'home';
      return location.pathname.slice(1); // Remove leading slash
    }
  };

  const activeSection = getActiveSection();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t z-50">
      <div className="flex items-center justify-around py-2 px-2 max-w-md mx-auto">
        <button
          onClick={() => handleNavigation('home')}
          className={cn(
            "flex flex-col items-center gap-1 py-2 px-2 rounded-lg transition-colors min-w-0",
            activeSection === 'home'
              ? "text-primary bg-primary/10" 
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          )}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs font-medium">Home</span>
        </button>
        
        <button
          onClick={() => handleNavigation('pantry')}
          className={cn(
            "flex flex-col items-center gap-1 py-2 px-2 rounded-lg transition-colors min-w-0",
            activeSection === 'pantry'
              ? "text-primary bg-primary/10" 
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          )}
        >
          <Package className="w-5 h-5" />
          <span className="text-xs font-medium">Pantry</span>
        </button>
        
        <button
          onClick={() => handleNavigation('shopping-list')}
          className={cn(
            "flex flex-col items-center gap-1 py-2 px-2 rounded-lg transition-colors min-w-0",
            activeSection === 'shopping-list'
              ? "text-primary bg-primary/10" 
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          )}
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-xs font-medium">Shopping</span>
        </button>
        
        <button
          onClick={() => handleNavigation('dashboard')}
          className={cn(
            "flex flex-col items-center gap-1 py-2 px-2 rounded-lg transition-colors min-w-0",
            activeSection === 'dashboard'
              ? "text-primary bg-primary/10" 
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          )}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-xs font-medium">Dashboard</span>
        </button>
      </div>
    </div>
  );
};