import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Milk, Apple, Cookie, Package } from "lucide-react";

export interface PantryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  expiryDate: string;
  purchasedDate: string;
  status: 'fresh' | 'expiring' | 'expired' | 'consumed';
  daysLeft: number;
  icon: React.ReactNode;
}

interface PantryContextType {
  items: PantryItem[];
  updateQuantity: (id: string, change: number) => void;
  updateStatus: (id: string, newStatus: 'fresh' | 'expiring' | 'expired' | 'consumed') => void;
  updateItem: (id: string, updates: Partial<PantryItem>) => void;
  removeItem: (id: string) => void;
  addItem: (item: Omit<PantryItem, 'id'>) => void;
  addToCart: (item: PantryItem) => void;
  getExpiringItems: () => PantryItem[];
}

const PantryContext = createContext<PantryContextType | undefined>(undefined);

const initialItems: PantryItem[] = [
  {
    id: '1',
    name: 'Whole Milk 2%',
    category: 'Dairy',
    quantity: 2,
    expiryDate: '2025-01-31',
    purchasedDate: '2025-01-25',
    status: 'expiring',
    daysLeft: 2,
    icon: <Milk className="w-4 h-4" />
  },
  {
    id: '2',
    name: 'Organic Bananas',
    category: 'Produce',
    quantity: 6,
    expiryDate: '2025-02-05',
    purchasedDate: '2025-01-28',
    status: 'fresh',
    daysLeft: 7,
    icon: <Apple className="w-4 h-4" />
  },
  {
    id: '3',
    name: 'Whole Wheat Bread',
    category: 'Bakery',
    quantity: 1,
    expiryDate: '2025-01-29',
    purchasedDate: '2025-01-26',
    status: 'expired',
    daysLeft: -1,
    icon: <Cookie className="w-4 h-4" />
  },
  {
    id: '4',
    name: 'Greek Yogurt',
    category: 'Dairy',
    quantity: 4,
    expiryDate: '2025-02-10',
    purchasedDate: '2025-01-27',
    status: 'fresh',
    daysLeft: 12,
    icon: <Package className="w-4 h-4" />
  },
  {
    id: '5',
    name: 'Fresh Spinach',
    category: 'Produce',
    quantity: 1,
    expiryDate: '2025-02-03',
    purchasedDate: '2025-01-29',
    status: 'expiring',
    daysLeft: 5,
    icon: <Apple className="w-4 h-4" />
  },
  {
    id: '6',
    name: 'Cheddar Cheese',
    category: 'Dairy',
    quantity: 1,
    expiryDate: '2025-02-04',
    purchasedDate: '2025-01-28',
    status: 'expiring',
    daysLeft: 6,
    icon: <Package className="w-4 h-4" />
  }
];

// Constants
const EXPIRING_DAYS = 7;

// Helper function to calculate days left
const calculateDaysLeft = (expiryDate: string): number => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

// Helper function to determine status based on quantity and days left
const determineStatus = (quantity: number, daysLeft: number): 'fresh' | 'expiring' | 'expired' | 'consumed' => {
  if (quantity === 0) return 'consumed';
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= EXPIRING_DAYS) return 'expiring';
  return 'fresh';
};

export const PantryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Update initial items with calculated days left and status
  const itemsWithCalculatedStatus = initialItems.map(item => {
    const daysLeft = calculateDaysLeft(item.expiryDate);
    const status = determineStatus(item.quantity, daysLeft);
    return {
      ...item,
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
          const status = determineStatus(item.quantity, daysLeft);
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
        const status = determineStatus(newQuantity, item.daysLeft);
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
        // Recalculate days left and status if expiry date or quantity was updated
        if (updates.expiryDate) {
          updatedItem.daysLeft = calculateDaysLeft(updates.expiryDate);
        }
        const finalQuantity = updates.quantity !== undefined ? updates.quantity : updatedItem.quantity;
        updatedItem.status = determineStatus(finalQuantity, updatedItem.daysLeft);
        return updatedItem;
      }
      return item;
    }));
  };

  const addItem = (item: Omit<PantryItem, 'id'>) => {
    const daysLeft = calculateDaysLeft(item.expiryDate);
    const status = determineStatus(item.quantity, daysLeft);
    const newItem: PantryItem = {
      ...item,
      id: Date.now().toString(),
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
    return items.filter(item => item.daysLeft <= 7 && item.daysLeft >= 0 && item.status !== 'consumed');
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