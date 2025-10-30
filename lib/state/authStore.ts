/**
 * Auth Store - Client-side authentication state
 * Uses Zustand with persistence
 * Never uses undefined - only null + isLoading to avoid hydration issues
 */

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthShape, UserType } from '@/types/auth';

export const useAuth = create<AuthShape>()(
  persist(
    (set) => ({
      userId: null,
      email: null,
      userType: null,
      isLoading: true,
      
      setUserType: (t: UserType) => set({ userType: t }),
      
      setAuth: (payload) => set(payload),
      
      reset: () => set({ 
        userId: null, 
        email: null, 
        userType: null, 
        isLoading: false 
      }),
    }),
    { 
      name: 'auth-store',
      partialize: (state) => ({
        userId: state.userId,
        email: state.email,
        userType: state.userType,
      }),
    }
  )
);

