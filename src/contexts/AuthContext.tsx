'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getFirebaseAuth, onAuthStateChanged, User } from '@/lib/firebase';

interface Subscription {
  status: 'active' | 'inactive' | 'past_due' | 'canceled';
  currentPeriodEnd?: Date;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  subscription: Subscription | null;
  checkSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  subscription: null,
  checkSubscription: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const checkSubscription = async () => {
    if (!user) {
      setSubscription(null);
      return;
    }

    try {
      const response = await fetch('/api/subscription/status', {
        headers: {
          'Authorization': `Bearer ${await user.getIdToken()}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Failed to check subscription:', error);
    }
  };

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      checkSubscription();
    } else {
      setSubscription(null);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, subscription, checkSubscription }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
