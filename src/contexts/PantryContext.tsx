'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';

export interface PantryItem {
  id: string;
  name: string;
  addedAt: Date;
  category?: string;
}

interface PantryContextType {
  items: PantryItem[];
  loading: boolean;
  addItem: (name: string, category?: string) => void;
  addItems: (names: string[]) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
  hasItem: (name: string) => boolean;
}

const PantryContext = createContext<PantryContextType>({
  items: [],
  loading: true,
  addItem: () => {},
  addItems: () => {},
  removeItem: () => {},
  clearAll: () => {},
  hasItem: () => false,
});

const STORAGE_KEY = 'flavor-roi-pantry';

export function PantryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setItems(parsed.map((item: PantryItem) => ({
          ...item,
          addedAt: new Date(item.addedAt),
        })));
      }
    } catch (error) {
      console.error('Failed to load pantry:', error);
    }
    setLoading(false);
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, loading]);

  const addItem = useCallback((name: string, category?: string) => {
    const normalizedName = name.trim();
    if (!normalizedName) return;

    // Check if already exists (case-insensitive)
    const exists = items.some(
      (item) => item.name.toLowerCase() === normalizedName.toLowerCase()
    );
    if (exists) return;

    const newItem: PantryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: normalizedName,
      addedAt: new Date(),
      category,
    };

    setItems((prev) => [...prev, newItem]);
  }, [items]);

  const addItems = useCallback((names: string[]) => {
    const newItems: PantryItem[] = [];
    const existingNames = new Set(items.map((i) => i.name.toLowerCase()));

    for (const name of names) {
      const normalizedName = name.trim();
      if (!normalizedName) continue;
      if (existingNames.has(normalizedName.toLowerCase())) continue;

      existingNames.add(normalizedName.toLowerCase());
      newItems.push({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: normalizedName,
        addedAt: new Date(),
      });
    }

    if (newItems.length > 0) {
      setItems((prev) => [...prev, ...newItems]);
    }
  }, [items]);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
  }, []);

  const hasItem = useCallback((name: string) => {
    return items.some(
      (item) => item.name.toLowerCase() === name.toLowerCase()
    );
  }, [items]);

  return (
    <PantryContext.Provider
      value={{ items, loading, addItem, addItems, removeItem, clearAll, hasItem }}
    >
      {children}
    </PantryContext.Provider>
  );
}

export function usePantry() {
  const context = useContext(PantryContext);
  if (!context) {
    throw new Error('usePantry must be used within a PantryProvider');
  }
  return context;
}
