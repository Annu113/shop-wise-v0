import { ShoppingList as ShoppingListComponent } from "@/components/ShoppingList";

const ShoppingList = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="space-y-4 sm:space-y-6">
          <ShoppingListComponent />
        </div>
      </div>
    </div>
  );
};

export default ShoppingList;