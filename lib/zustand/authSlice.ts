/**
 * Auth Slice - User authentication and org context
 * Brokmang. v1.1
 */

import { StateCreator } from 'zustand';
import type { User } from '@supabase/supabase-js';
import type { UserAccountType } from '../types';

export interface AuthSlice {
  // User state
  user: User | null;
  loading: boolean;
  userAccountType: UserAccountType | null; // CEO or Team Leader
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setUserAccountType: (type: UserAccountType | null) => void;
  signOut: () => void;
  
  // Computed
  isAuthenticated: () => boolean;
  isCEO: () => boolean;
  isTeamLeader: () => boolean;
  hasFinancialAccess: () => boolean;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set, get) => ({
  // Initial state
  user: null,
  loading: true,
  userAccountType: null,
  
  // Actions
  setUser: (user) => set({ user, loading: false }),
  
  setLoading: (loading) => set({ loading }),
  
  setUserAccountType: (type) => set({ userAccountType: type }),
  
  signOut: () => {
    set({ 
      user: null,
      userAccountType: null,
      loading: false,
    });
  },
  
  // Computed
  isAuthenticated: () => get().user !== null,
  isCEO: () => get().userAccountType === 'ceo',
  isTeamLeader: () => get().userAccountType === 'team_leader',
  hasFinancialAccess: () => get().userAccountType === 'ceo',
});

