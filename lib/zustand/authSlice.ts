/**
 * Auth Slice - User authentication and org context
 * Brokmang. v1.1
 */

import { StateCreator } from 'zustand';
import type { User } from '@supabase/supabase-js';
import type { UserRole } from '../types';

export interface AuthSlice {
  // User state
  user: User | null;
  loading: boolean;
  
  // Current org context
  currentOrgId: string | null;
  currentOrgSlug: string | null;
  userRole: UserRole | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setCurrentOrg: (orgId: string, orgSlug: string, role: UserRole) => void;
  clearCurrentOrg: () => void;
  signOut: () => void;
  
  // Computed
  isAuthenticated: () => boolean;
  hasOrgContext: () => boolean;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set, get) => ({
  // Initial state
  user: null,
  loading: true,
  currentOrgId: null,
  currentOrgSlug: null,
  userRole: null,
  
  // Actions
  setUser: (user) => set({ user, loading: false }),
  
  setLoading: (loading) => set({ loading }),
  
  setCurrentOrg: (orgId, orgSlug, role) => {
    set({ 
      currentOrgId: orgId, 
      currentOrgSlug: orgSlug,
      userRole: role 
    });
    
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('brokmang_current_org', JSON.stringify({
        orgId,
        orgSlug,
        role,
        timestamp: Date.now(),
      }));
    }
  },
  
  clearCurrentOrg: () => {
    set({ 
      currentOrgId: null, 
      currentOrgSlug: null,
      userRole: null 
    });
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('brokmang_current_org');
    }
  },
  
  signOut: () => {
    set({ 
      user: null, 
      currentOrgId: null,
      currentOrgSlug: null,
      userRole: null,
      loading: false,
    });
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('brokmang_current_org');
    }
  },
  
  // Computed
  isAuthenticated: () => get().user !== null,
  hasOrgContext: () => get().currentOrgId !== null && get().userRole !== null,
});

