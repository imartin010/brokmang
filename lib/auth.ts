import { supabase } from "./supabase-browser";

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: any;
}

/**
 * Sign up a new user
 */
export async function signUp(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      return { success: false, message: error.message };
    }

    // Check if email confirmation is required
    if (data.user && !data.session) {
      return {
        success: true,
        message: "Please check your email to confirm your account.",
        user: data.user,
      };
    }

    return {
      success: true,
      message: "Account created successfully!",
      user: data.user,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "An unexpected error occurred",
    };
  }
}

/**
 * Sign in an existing user
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message: "Signed in successfully!",
      user: data.user,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "An unexpected error occurred",
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: "Signed out successfully!" };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "An unexpected error occurred",
    };
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message: "Password reset email sent! Check your inbox.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "An unexpected error occurred",
    };
  }
}

/**
 * Update user password
 */
export async function updatePassword(
  newPassword: string
): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message: "Password updated successfully!",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "An unexpected error occurred",
    };
  }
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

