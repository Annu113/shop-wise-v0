import { useLocation } from "react-router-dom";
import { Hero } from "@/components/Hero";
import { FloatingQuickAdd } from "@/components/FloatingQuickAdd";
import { PantryDashboard } from "@/components/PantryDashboard";
import { ShoppingList } from "@/components/ShoppingList";
import { DashboardStats } from "@/components/DashboardStats";

const Prototype = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const section = searchParams.get('section') || 'home';

  const renderSection = () => {
    switch (section) {
      case 'pantry':
        return (
          <div className="container mx-auto p-4">
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6">
              <h2 className="text-xl font-semibold mb-2">🧪 Prototype: Pantry Management</h2>
              <p className="text-sm text-muted-foreground">Demo version showing pantry features</p>
            </div>
            <PantryDashboard />
          </div>
        );
      case 'shopping-list':
        return (
          <div className="container mx-auto p-4">
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6">
              <h2 className="text-xl font-semibold mb-2">🧪 Prototype: Shopping List</h2>
              <p className="text-sm text-muted-foreground">Demo version showing shopping features</p>
            </div>
            <ShoppingList />
          </div>
        );
      case 'dashboard':
        return (
          <div className="container mx-auto p-4">
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6">
              <h2 className="text-xl font-semibold mb-2">🧪 Prototype: Analytics Dashboard</h2>
              <p className="text-sm text-muted-foreground">Demo version showing analytics features</p>
            </div>
            <DashboardStats />
          </div>
        );
      default:
        return (
          <>
            <div className="bg-primary text-primary-foreground p-4 text-center">
              <h1 className="text-xl font-bold">🧪 Prototype Mode</h1>
              <p className="text-sm opacity-90">Demo version - No account required</p>
            </div>
            <Hero />
            <FloatingQuickAdd />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen">
      {renderSection()}
    </div>
  );
};

export default Prototype;