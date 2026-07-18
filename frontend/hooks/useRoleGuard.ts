import { useEffect, useRef } from 'react';
import { router, useSegments } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types';

export function useRoleGuard(requiredRole?: UserRole) {
  const { isAuthenticated, isLoading, userRole } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/(auth)/welcome');
      return;
    }

    if (requiredRole && userRole !== requiredRole) {
      router.replace('/(tabs)');
      return;
    }
  }, [isAuthenticated, isLoading, userRole, requiredRole, segments]);
}

export function useRequireAuth() {
  const { isAuthenticated, isLoading, userRole } = useAuth();
  const segments = useSegments();
  const hasChecked = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    if (hasChecked.current) return;
    hasChecked.current = true;

    if (!isAuthenticated) {
      router.replace('/(auth)/welcome');
    }
  }, [isAuthenticated, isLoading, segments]);

  return { isAuthenticated, isLoading, userRole };
}

export function useRoleAccess(allowedRoles: UserRole[]) {
  const { isAuthenticated, isLoading, userRole } = useAuth();

  const hasAccess = isAuthenticated && userRole && allowedRoles.includes(userRole);

  return { hasAccess, isLoading, userRole };
}
