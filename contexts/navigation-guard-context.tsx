'use client';

import { createContext, useContext, useRef, useCallback, type ReactNode } from 'react';

/**
 * A guard callback. Receives the intended destination path.
 * Return true to allow navigation, false to block it.
 * The guard is responsible for showing its own confirmation UI.
 */
export type NavigationGuardFn = (destination: string) => boolean;

interface NavigationGuardContextValue {
  /** Register a guard. Returns a cleanup function that removes it. */
  registerGuard: (guard: NavigationGuardFn) => () => void;
  /** Check the active guard (if any). Returns true if navigation should proceed. */
  checkGuard: (destination: string) => boolean;
}

const NavigationGuardContext = createContext<NavigationGuardContextValue>({
  registerGuard: () => () => {},
  checkGuard: () => true,
});

export function NavigationGuardProvider({ children }: { children: ReactNode }) {
  // Use a ref so guard changes don't cause re-renders of the provider tree
  const guardRef = useRef<NavigationGuardFn | null>(null);

  const registerGuard = useCallback((guard: NavigationGuardFn) => {
    guardRef.current = guard;
    return () => {
      guardRef.current = null;
    };
  }, []);

  const checkGuard = useCallback((destination: string): boolean => {
    if (!guardRef.current) return true;
    return guardRef.current(destination);
  }, []);

  return (
    <NavigationGuardContext.Provider value={{ registerGuard, checkGuard }}>
      {children}
    </NavigationGuardContext.Provider>
  );
}

export function useNavigationGuard() {
  return useContext(NavigationGuardContext);
}
