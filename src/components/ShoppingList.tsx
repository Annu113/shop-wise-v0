import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus,
  Minus,
  Check,
  X,
  ShoppingCart,
  Search
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  isChecked: boolean;
  addedDate: string;
}

const mockShoppingItems: ShoppingItem[] = [
  {
    id: '1',
    name: 'Whole Milk 2%',
    category: 'Dairy',
    quantity: 2,
    isChecked: false,
    addedDate: '2025-01-28'
  },
  {
    id: '2',
    name: 'Organic Bananas',
    category: 'Produce',
    quantity: 6,
    isChecked: false,
    addedDate: '2025-01-28'
  },
  {
    id: '3',
    name: 'Whole Wheat Bread',
    category: 'Bakery',
    quantity: 1,
    isChecked: true,
    addedDate: '2025-01-27'
  },
  {
    id: '4',
    name: 'Greek Yogurt',
    category: 'Dairy',
    quantity: 4,
    isChecked: false,
    addedDate: '2025-01-28'
  }
];

// Common grocery items for auto-suggest
const commonGroceryItems = [
  { name: 'Apples', category: 'Produce' },
  { name: 'Bananas', category: 'Produce' },
  { name: 'Carrots', category: 'Produce' },
  { name: 'Spinach', category: 'Produce' },
  { name: 'Tomatoes', category: 'Produce' },
  { name: 'Whole Milk', category: 'Dairy' },
  { name: 'Greek Yogurt', category: 'Dairy' },
  { name: 'Cheddar Cheese', category: 'Dairy' },
  { name: 'Eggs', category: 'Dairy' },
  { name: 'Chicken Breast', category: 'Meat' },
  { name: 'Ground Beef', category: 'Meat' },
  { name: 'Salmon Fillet', category: 'Seafood' },
  { name: 'Whole Wheat Bread', category: 'Bakery' },
  { name: 'Brown Rice', category: 'Pantry' },
  { name: 'Olive Oil', category: 'Pantry' },
  { name: 'Pasta', category: 'Pantry' },
  { name: 'Oatmeal', category: 'Breakfast' },
  { name: 'Cereal', category: 'Breakfast' },
  { name: 'Orange Juice', category: 'Beverages' },
  { name: 'Coffee', category: 'Beverages' }
];

export const ShoppingList = () => {
  const [items, setItems] = useState(mockShoppingItems);
  const [newItemName, setNewItemName] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.closest('.relative')?.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateQuantity = (id: string, change: number) => {
    setItems(items.map(item => 
      item.id === id 
        ? { ...item, quantity: Math.max(0, item.quantity + change) }
        : item
    ));
  };

  const markAsPurchased = (id: string) => {
    setItems(items.map(item => 
      item.id === id 
        ? { ...item, isChecked: !item.isChecked }
        : item
    ));
  };

  const clearPurchasedItems = () => {
    setItems(items.filter(item => !item.isChecked));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const addNewItem = (selectedItem?: { name: string; category: string }) => {
    const itemToAdd = selectedItem || { name: newItemName, category: 'Other' };
    if (itemToAdd.name.trim()) {
      const newItem: ShoppingItem = {
        id: Date.now().toString(),
        name: itemToAdd.name,
        category: itemToAdd.category,
        quantity: 1,
        isChecked: false,
        addedDate: new Date().toISOString().split('T')[0]
      };
      setItems([...items, newItem]);
      setNewItemName("");
      setSearchOpen(false);
    }
  };

  const filteredSuggestions = commonGroceryItems.filter(item =>
    item.name.toLowerCase().includes(newItemName.toLowerCase()) &&
    !items.some(existingItem => existingItem.name.toLowerCase() === item.name.toLowerCase())
  );

  const uncheckedItems = items.filter(item => !item.isChecked);
  const purchasedItems = items.filter(item => item.isChecked);

  return (
    <div className="space-y-4 pb-20 px-1">
      {/* Shopping List Items */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Shopping List
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Add New Item with Auto-suggest - Mobile Optimized */}
          <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border-2 border-dashed border-primary/20">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                placeholder="Add new item..."
                value={newItemName}
                onChange={(e) => {
                  setNewItemName(e.target.value);
                  setSearchOpen(e.target.value.length > 0);
                }}
                onKeyPress={(e) => e.key === 'Enter' && addNewItem()}
                onFocus={() => newItemName.length > 0 && setSearchOpen(true)}
                className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 font-medium text-sm pr-8"
              />
              <Search className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none" />
              
              {/* Auto-suggest dropdown - Mobile Optimized */}
              {searchOpen && newItemName.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((item) => (
                      <div
                        key={item.name}
                        className="p-3 hover:bg-accent active:bg-accent/80 cursor-pointer border-b last:border-b-0 touch-manipulation"
                        onClick={() => addNewItem(item)}
                      >
                        <div className="flex items-center gap-2">
                          <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm truncate">{item.name}</div>
                            <div className="text-xs text-muted-foreground">{item.category}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 hover:bg-accent active:bg-accent/80 cursor-pointer touch-manipulation" onClick={() => addNewItem()}>
                      <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm truncate">Add "{newItemName}"</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <Button 
              onClick={() => addNewItem()} 
              disabled={!newItemName.trim()}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary flex-shrink-0 touch-manipulation"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Shopping Items - Mobile Optimized */}
          {uncheckedItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No items in your shopping list</p>
              <p className="text-xs mt-1">Add items above to get started</p>
            </div>
          ) : (
            uncheckedItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <Checkbox
                    checked={item.isChecked}
                    onCheckedChange={() => markAsPurchased(item.id)}
                    className="h-5 w-5"
                  />
                  <span className="text-xs text-muted-foreground leading-none">Buy</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">{item.name}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7 touch-manipulation"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7 touch-manipulation"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-destructive touch-manipulation"
                    onClick={() => removeItem(item.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Purchased Items Section - Mobile Optimized */}
      {purchasedItems.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                Purchased ({purchasedItems.length})
              </CardTitle>
              <Button 
                onClick={clearPurchasedItems}
                variant="outline"
                size="sm"
                className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground touch-manipulation"
              >
                <span className="hidden sm:inline">Complete Shopping</span>
                <span className="sm:hidden">Clear</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {purchasedItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg opacity-70">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate line-through">{item.name}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-medium text-muted-foreground">×{item.quantity}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-muted-foreground hover:text-foreground touch-manipulation"
                    onClick={() => markAsPurchased(item.id)}
                    title="Mark as not purchased"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Fixed Bottom Total - Mobile Optimized */}
      <div className="fixed bottom-16 sm:bottom-20 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t z-40">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2 text-center">
            <ShoppingCart className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="font-semibold text-lg">{uncheckedItems.length}</span>
            <span className="text-muted-foreground text-sm sm:text-base">
              {uncheckedItems.length === 1 ? 'item' : 'items'} to buy
            </span>
            {purchasedItems.length > 0 && (
              <>
                <span className="text-muted-foreground hidden sm:inline">•</span>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {purchasedItems.length} purchased
                </span>
                <div className="sm:hidden text-xs text-muted-foreground">
                  ({purchasedItems.length} done)
                </div>
              </>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};