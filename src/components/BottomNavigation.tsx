import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Package, TrendingUp, ShoppingCart, BarChart3 } from "lucide-react";

export const BottomNavigation = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t z-50">
      <div className="flex items-center justify-around py-2 px-2 max-w-md mx-auto">
        <NavLink
          to="/"
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 py-2 px-2 rounded-lg transition-colors min-w-0",
              isActive 
                ? "text-primary bg-primary/10" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )
          }
        >
          <Home className="w-5 h-5" />
          <span className="text-xs font-medium">Home</span>
        </NavLink>
        
        <NavLink
          to="/pantry"
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 py-2 px-2 rounded-lg transition-colors min-w-0",
              isActive 
                ? "text-primary bg-primary/10" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )
          }
        >
          <Package className="w-5 h-5" />
          <span className="text-xs font-medium">Pantry</span>
        </NavLink>
        
        
        <NavLink
          to="/shopping-list"
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 py-2 px-2 rounded-lg transition-colors min-w-0",
              isActive 
                ? "text-primary bg-primary/10" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )
          }
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-xs font-medium">Shopping</span>
        </NavLink>
        
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 py-2 px-2 rounded-lg transition-colors min-w-0",
              isActive 
                ? "text-primary bg-primary/10" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )
          }
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-xs font-medium">Dashboard</span>
        </NavLink>
      </div>
    </div>
  );
};