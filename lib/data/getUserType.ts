/**
 * Server-side user type fetching
 * Used in SSR to get current user's role before rendering
 */

import { supabaseServer } from '@/lib/supabase/server';
import type { UserType } from '@/types/auth';

export interface UserTypeData {
  userId: string;
  email: string | null;
  userType: UserType | null;
}

export async function getUserTypeServer(): Promise<UserTypeData> {
  const supabase = supabaseServer();
  
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  
  if (userErr || !user) {
    return { userId: '', email: null, userType: null };
  }

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('user_id, user_type')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    return { userId: user.id, email: user.email ?? null, userType: null };
  }

  // Map database values to TypeScript types
  // Database has 'ceo' or 'team_leader'
  let mappedUserType: UserType | null = null;
  if (profile?.user_type) {
    const rawType = profile.user_type.toLowerCase();
    if (rawType === 'ceo') mappedUserType = 'CEO';
    else if (rawType === 'team_leader' || rawType === 'teamleader') mappedUserType = 'TeamLeader';
  }

  return {
    userId: user.id,
    email: user.email ?? null,
    userType: mappedUserType,
  };
}

