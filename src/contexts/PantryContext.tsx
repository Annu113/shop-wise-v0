import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Milk, Apple, Cookie, Package } from "lucide-react";
import { format, addDays } from "date-fns";
import shelfLifeData from '@/data/shelfLife.json';

export interface PantryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  expiryDate: string; // Always required in final state
  purchasedDate: string;
  shelfLifeDays?: number; // Optional custom shelf life
  status: 'fresh' | 'expiring' | 'expired' | 'consumed';
  daysLeft: number;
  totalShelfLife: number; // Total shelf life in days
  icon: React.ReactNode;
}

// Input type for adding items
type AddItemInput = {
  name: string;
  category: string;
  quantity: number;
  purchasedDate: string;
  expiryDate?: string; // Optional - will be calculated from shelf life if not provided
  shelfLifeDays?: number; // Optional custom shelf life
  icon: React.ReactNode;
};

interface PantryContextType {
  items: PantryItem[];
  updateQuantity: (id: string, change: number) => void;
  updateStatus: (id: string, newStatus: 'fresh' | 'expiring' | 'expired' | 'consumed') => void;
  updateItem: (id: string, updates: Partial<PantryItem>) => void;
  removeItem: (id: string) => void;
  addItem: (item: AddItemInput) => void;
  addToCart: (item: PantryItem) => void;
  getExpiringItems: () => PantryItem[];
}

const PantryContext = createContext<PantryContextType | undefined>(undefined);

const initialItems: AddItemInput[] = [
  {
    name: 'Whole Milk 2%',
    category: 'Dairy',
    quantity: 2,
    purchasedDate: '2025-01-25',
    // No expiryDate - will be calculated from shelf life
    icon: <Milk className="w-4 h-4" />
  },
  {
    name: 'Organic Bananas',
    category: 'Produce',
    quantity: 6,
    purchasedDate: '2025-01-28',
    // No expiryDate - will be calculated from shelf life
    icon: <Apple className="w-4 h-4" />
  },
  {
    name: 'Whole Wheat Bread',
    category: 'Bakery',
    quantity: 1,
    purchasedDate: '2025-01-26',
    // No expiryDate - will be calculated from shelf life
    icon: <Cookie className="w-4 h-4" />
  },
  {
    name: 'Greek Yogurt',
    category: 'Dairy',
    quantity: 4,
    expiryDate: '2025-02-10', // Has explicit expiry date
    purchasedDate: '2025-01-27',
    icon: <Package className="w-4 h-4" />
  },
  {
    name: 'Fresh Spinach',
    category: 'Produce',
    quantity: 1,
    purchasedDate: '2025-01-29',
    // No expiryDate - will be calculated from shelf life
    icon: <Apple className="w-4 h-4" />
  },
  {
    name: 'Cheddar Cheese',
    category: 'Dairy',
    quantity: 1,
    purchasedDate: '2025-01-28',
    shelfLifeDays: 21, // Custom shelf life override
    icon: <Package className="w-4 h-4" />
  }
];

// Helper function to get default shelf life for an item
const getDefaultShelfLife = (itemName: string, category: string): number => {
  const categoryData = shelfLifeData[category as keyof typeof shelfLifeData];
  if (categoryData && categoryData[itemName as keyof typeof categoryData]) {
    return categoryData[itemName as keyof typeof categoryData] as number;
  }
  
  // Default shelf life by category if specific item not found
  const categoryDefaults: { [key: string]: number } = {
    'Dairy': 7,
    'Produce': 7,
    'Bakery': 5,
    'Meat': 3,
    'Pantry': 365,
    'Frozen': 90
  };
  
  return categoryDefaults[category] || 7;
};

// Helper function to calculate expiry date from purchase date and shelf life
const calculateExpiryDate = (purchasedDate: string, shelfLifeDays: number): string => {
  const purchaseDate = new Date(purchasedDate);
  const expiryDate = addDays(purchaseDate, shelfLifeDays);
  return format(expiryDate, 'yyyy-MM-dd');
};

// Helper function to calculate days left
const calculateDaysLeft = (expiryDate: string): number => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

// Helper function to determine status based on quantity, days left, and total shelf life
const determineStatus = (quantity: number, daysLeft: number, totalShelfLife: number): 'fresh' | 'expiring' | 'expired' | 'consumed' => {
  if (quantity === 0) return 'consumed';
  if (daysLeft < 0) return 'expired';
  
  // Calculate 40% of shelf life remaining as expiring threshold
  const expiringThreshold = Math.ceil(totalShelfLife * 0.4);
  if (daysLeft <= expiringThreshold) return 'expiring';
  
  return 'fresh';
};

export const PantryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Process initial items with shelf life logic
  const itemsWithCalculatedStatus = initialItems.map((item, index) => {
    // Determine shelf life: custom > item-specific > category default
    const totalShelfLife = item.shelfLifeDays || getDefaultShelfLife(item.name, item.category);
    
    // Calculate expiry date if not provided
    const expiryDate = item.expiryDate || calculateExpiryDate(item.purchasedDate, totalShelfLife);
    
    // Calculate days left and status
    const daysLeft = calculateDaysLeft(expiryDate);
    const status = determineStatus(item.quantity, daysLeft, totalShelfLife);
    
    return {
      ...item,
      id: (index + 1).toString(),
      expiryDate,
      totalShelfLife,
      daysLeft,
      status
    };
  });
  
  const [items, setItems] = useState(itemsWithCalculatedStatus);

  // Real-time updates: recalculate status every minute to keep filters current
  useEffect(() => {
    const updateItemStatuses = () => {
      setItems(currentItems => 
        currentItems.map(item => {
          const daysLeft = calculateDaysLeft(item.expiryDate);
          const status = determineStatus(item.quantity, daysLeft, item.totalShelfLife);
          return {
            ...item,
            daysLeft,
            status
          };
        })
      );
    };

    // Update immediately on mount
    updateItemStatuses();
    
    // Update every minute (60000ms) to keep real-time
    const interval = setInterval(updateItemStatuses, 60000);
    
    // Also update at midnight for day transitions
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const midnightTimeout = setTimeout(() => {
      updateItemStatuses();
      // Set up daily updates at midnight
      const dailyInterval = setInterval(updateItemStatuses, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyInterval);
    }, msUntilMidnight);

    return () => {
      clearInterval(interval);
      clearTimeout(midnightTimeout);
    };
  }, []);

  const updateQuantity = (id: string, change: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, item.quantity + change);
        const status = determineStatus(newQuantity, item.daysLeft, item.totalShelfLife);
        return { ...item, quantity: newQuantity, status };
      }
      return item;
    }));
  };

  const updateStatus = (id: string, newStatus: 'fresh' | 'expiring' | 'expired' | 'consumed') => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { 
          ...item, 
          status: newStatus,
          quantity: newStatus === 'consumed' ? 0 : item.quantity
        };
        
        // Auto-add to shopping cart when marked as consumed
        if (newStatus === 'consumed') {
          addToCart(updatedItem);
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const updateItem = (id: string, updates: Partial<PantryItem>) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, ...updates };
        
        // Recalculate total shelf life if needed
        if (updates.shelfLifeDays || updates.name || updates.category) {
          updatedItem.totalShelfLife = updates.shelfLifeDays || 
            getDefaultShelfLife(updatedItem.name, updatedItem.category);
        }
        
        // Recalculate expiry date if purchase date or shelf life changed
        if (updates.purchasedDate || updates.shelfLifeDays) {
          updatedItem.expiryDate = updates.expiryDate || 
            calculateExpiryDate(updatedItem.purchasedDate, updatedItem.totalShelfLife);
        }
        
        // Recalculate days left and status if expiry date or quantity was updated
        if (updates.expiryDate || updates.purchasedDate || updates.shelfLifeDays) {
          updatedItem.daysLeft = calculateDaysLeft(updatedItem.expiryDate);
        }
        
        const finalQuantity = updates.quantity !== undefined ? updates.quantity : updatedItem.quantity;
        updatedItem.status = determineStatus(finalQuantity, updatedItem.daysLeft, updatedItem.totalShelfLife);
        return updatedItem;
      }
      return item;
    }));
  };

  const addItem = (item: AddItemInput) => {
    // Determine shelf life: custom > item-specific > category default
    const totalShelfLife = item.shelfLifeDays || getDefaultShelfLife(item.name, item.category);
    
    // Calculate expiry date if not provided
    const expiryDate = item.expiryDate || calculateExpiryDate(item.purchasedDate, totalShelfLife);
    
    // Calculate days left and status
    const daysLeft = calculateDaysLeft(expiryDate);
    const status = determineStatus(item.quantity, daysLeft, totalShelfLife);
    
    const newItem: PantryItem = {
      ...item,
      id: Date.now().toString(),
      expiryDate,
      totalShelfLife,
      daysLeft,
      status,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const addToCart = (item: PantryItem) => {
    // This will be connected to the shopping list state later
    console.log('Adding to cart:', item.name);
  };

  const getExpiringItems = () => {
    return items.filter(item => {
      if (item.status === 'consumed' || item.daysLeft < 0) return false;
      const expiringThreshold = Math.ceil(item.totalShelfLife * 0.4);
      return item.daysLeft <= expiringThreshold;
    });
  };

  return (
    <PantryContext.Provider value={{
      items,
      updateQuantity,
      updateStatus,
      updateItem,
      removeItem,
      addItem,
      addToCart,
      getExpiringItems
    }}>
      {children}
    </PantryContext.Provider>
  );
};

export const usePantry = () => {
  const context = useContext(PantryContext);
  if (context === undefined) {
    throw new Error('usePantry must be used within a PantryProvider');
  }
  return context;
};