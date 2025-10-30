/**
 * Server Action - Set User Type
 * Updates user type and revalidates dashboard
 */

'use server';

import { supabaseServer } from '@/lib/supabase/server';
import type { UserType } from '@/types/auth';
import { revalidatePath } from 'next/cache';

export async function setUserTypeAction(t: UserType) {
  const supabase = supabaseServer();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No session');

  // Map TypeScript type to database format
  const dbUserType = t === 'CEO' ? 'ceo' : 'team_leader';

  const { error } = await supabase
    .from('sales_agents')
    .upsert(
      { 
        user_id: user.id, 
        user_type: dbUserType 
      },
      { onConflict: 'user_id' }
    );

  if (error) throw error;

  // Revalidate dashboard to reflect changes
  revalidatePath('/dashboard');
  revalidatePath('/select-account-type');
  
  return { success: true };
}

