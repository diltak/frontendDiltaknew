'use client';

import {
  createContext, useContext, useEffect, useState,
  useMemo, useCallback,
} from 'react';
import { toast } from 'sonner';
import type { User } from '@/types/index';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── helpers ────────────────────────────────────────────────────────────────────

/** Read the profile stored by the custom API login flow */
function getLocalProfile(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user_profile');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Normalize: accept both id (snake_case) and uid (API camelCase)
    const id = parsed?.id || parsed?.uid || '';
    const role = parsed?.role || '';
    if (!id || !role) return null;
    // Ensure app-convention fields are set, normalizing API camelCase if needed
    return {
      ...parsed,
      id,
      role,
      company_id:   parsed.company_id   ?? parsed.companyId   ?? '',
      company_name: parsed.company_name ?? parsed.companyName ?? '',
      first_name:   parsed.first_name   ?? (parsed.displayName?.split(' ')?.[0]   ?? ''),
      last_name:    parsed.last_name    ?? (parsed.displayName?.split(' ')?.slice(1).join(' ') ?? ''),
      is_active:    parsed.is_active    ?? true,
      email:        parsed.email        ?? '',
      created_at:   parsed.created_at   ?? '',
      updated_at:   parsed.updated_at   ?? '',
    } as User;
  } catch {
    return null;
  }
}

function clearLocalAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_profile');
  localStorage.removeItem('login_data');
}

// ── Provider ───────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    // Try custom API profile first
    const localProfile = getLocalProfile();
    if (localProfile) {
      setUser(localProfile);
    } else {
      setUser(null);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      clearLocalAuth();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    // Initialize auth state purely from localStorage
    const localProfile = getLocalProfile();
    if (localProfile) {
      setUser(localProfile);
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  const value = useMemo(
    () => ({ user, loading, signOut, refreshUser }),
    [user, loading, signOut, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
