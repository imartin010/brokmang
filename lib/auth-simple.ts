/**
 * Simple Auth Functions - Clean Rebuild
 * Reliable sign-in/sign-up with proper session handling
 */

import { supabase } from './supabase-browser';

export interface AuthResult {
  success: boolean;
  message: string;
  error?: any;
}

/**
 * Sign up a new user
 */
export async function signUpUser(email: string, password: string): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
      },
    });

    if (error) {
      return {
        success: false,
        message: error.message,
        error,
      };
    }

    // Check if email confirmation is required
    const needsEmailConfirmation = !data.session;

    if (needsEmailConfirmation) {
      return {
        success: true,
        message: 'Please check your email to verify your account',
      };
    }

    return {
      success: true,
      message: 'Account created successfully!',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Sign up failed',
      error,
    };
  }
}

/**
 * Sign in existing user
 */
export async function signInUser(email: string, password: string): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        message: error.message,
        error,
      };
    }

    if (!data.session) {
      return {
        success: false,
        message: 'No session created. Please try again.',
      };
    }

    return {
      success: true,
      message: 'Signed in successfully!',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Sign in failed',
      error,
    };
  }
}

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        message: error.message,
        error,
      };
    }

    return {
      success: true,
      message: 'Signed out successfully',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Sign out failed',
      error,
    };
  }
}

/**
 * Get current session
 */
export async function getCurrentSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }

    return data.session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting user:', error);
      return null;
    }

    return data.user;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

