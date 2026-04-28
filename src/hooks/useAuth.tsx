import React, { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { RegisterProfile, UpdateProfile, UserProfile } from '../types/parking';
import { loginUser, logoutUser, registerUser, updateUserProfile, type BackendUser } from '../services/authService';

type AuthContextValue = {
  user: UserProfile | null;
  uid: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (profile: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  register: (profile: RegisterProfile) => Promise<void>;
  updateProfile: (profile: UpdateProfile) => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

const getUid = (user: BackendUser): string => user.uid ?? user.id ?? '';

const toUserProfile = (u: BackendUser): UserProfile => ({
  firstName: u.firstName,
  middleName: u.middleName ?? '',
  lastName: u.lastName,
  email: u.email,
  fullName: [u.firstName, u.middleName ?? '', u.lastName].filter(Boolean).join(' '),
});

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const login = useCallback(async (profile: { email: string; password: string }) => {
  setIsLoading(true);
  setError(null);

  try {
    console.log('Step 1: Starting login...');
    const backendUser = await loginUser(profile);
    console.log('Step 2: Got backend user:', backendUser);
    setUser(toUserProfile(backendUser));
    setUid(getUid(backendUser));
    console.log('Step 3: User state set, should navigate now');
  } catch (err) {
    console.log('Login failed at:', err);
    const message = err instanceof Error ? err.message : 'Failed to login';
    setError(message);
    throw err;
  } finally {
    setIsLoading(false);
  }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await logoutUser();
      setUser(null);
      setUid(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to logout';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (profile: RegisterProfile) => {
    setIsLoading(true);
    setError(null);

    try {
      await registerUser({
        firstName: profile.firstName,
        middleName: profile.middleName,
        lastName: profile.lastName,
        email: profile.email,
        password: profile.password,
      });

      const backendUser = await loginUser({
        email: profile.email,
        password: profile.password,
      });

      setUser(toUserProfile(backendUser));
      setUid(getUid(backendUser));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to register';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (profile: UpdateProfile) => {
    if (!uid) {
      const uidError = new Error('User is not authenticated');
      setError(uidError.message);
      throw uidError;
    }

    setIsLoading(true);
    setError(null);

    try {
      const backendUser = await updateUserProfile(uid, profile);
      setUser(toUserProfile(backendUser));
      setUid(getUid(backendUser) || uid);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [uid]);

  const value = useMemo(
    () => ({
      user,
      uid,
      isAuthenticated: !!user && !!uid,
      isLoading,
      error,
      login,
      logout,
      register,
      updateProfile,
      clearError,
    }),
    [user, uid, isLoading, error, login, logout, register, updateProfile, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
