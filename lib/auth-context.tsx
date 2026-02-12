import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { profileStorage } from '@/lib/storage';
import type { PlayerProfile } from '@/lib/types';

interface AuthContextValue {
  profile: PlayerProfile | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (profile: PlayerProfile) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profile: PlayerProfile) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile from AsyncStorage on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const savedProfile = await profileStorage.get();
        setProfile(savedProfile);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const login = async (newProfile: PlayerProfile) => {
    try {
      await profileStorage.set(newProfile);
      setProfile(newProfile);
    } catch (error) {
      console.error('Failed to login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await profileStorage.clear();
      setProfile(null);
    } catch (error) {
      console.error('Failed to logout:', error);
      throw error;
    }
  };

  const updateProfile = async (updatedProfile: PlayerProfile) => {
    try {
      await profileStorage.set(updatedProfile);
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  const isLoggedIn = profile !== null;

  const value = useMemo(() => ({
    profile,
    isLoading,
    isLoggedIn,
    login,
    logout,
    updateProfile,
  }), [profile, isLoading, isLoggedIn]);

  // Don't render children until profile is loaded to avoid hydration mismatch
  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={value}>
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
