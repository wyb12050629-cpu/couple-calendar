'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Owner } from '@/lib/supabase';

type UserContextType = {
  user: Owner | null;
  setUser: (user: Owner) => void;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  isLoading: true,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<Owner | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('couple-calendar-user') as Owner | null;
    if (saved) setUserState(saved);
    setIsLoading(false);
  }, []);

  const setUser = (u: Owner) => {
    localStorage.setItem('couple-calendar-user', u);
    setUserState(u);
  };

  return (
    <UserContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
