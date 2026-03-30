import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserSchema } from '@insforge/sdk';
import { insforge } from '../lib/insforge';

interface AuthContextType {
  user: UserSchema | null;
  loading: boolean;
  isOnboarded: boolean;
  signOut: () => Promise<void>;
  setUser: (user: UserSchema | null) => void;
  checkUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isOnboarded: false,
  signOut: async () => {},
  setUser: () => {},
  checkUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSchema | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkUser = async () => {
    try {
      const { data } = await insforge.auth.getCurrentUser();
      if (data?.user) {
        setUser(data.user);
        // Check if onboarded (has a profile record)
        const { data: profile } = await insforge.database
          .from('profiles')
          .select('pregnancy_week')
          .eq('user_id', data.user.id)
          .single();
        
        setIsOnboarded(!!profile?.pregnancy_week);
      } else {
        setUser(null);
        setIsOnboarded(false);
      }
    } catch (err) {
      console.error('Failed to get current user:', err);
      setUser(null);
      setIsOnboarded(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  const signOut = async () => {
    try {
      await insforge.auth.signOut();
      setUser(null);
      setIsOnboarded(false);
      window.location.href = '/auth';
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isOnboarded, signOut, setUser, checkUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
