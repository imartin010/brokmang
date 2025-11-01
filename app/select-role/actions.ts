/**
 * Server Action - Set User Role
 * Safe, validated role setting with RLS enforcement
 */

'use server';

import { RoleSchema } from '@/lib/schemas';
import { createSupabaseServer } from '@/lib/supabase-server';

export async function setUserRole(formData: FormData) {
  const parsed = RoleSchema.safeParse({ user_type: formData.get('user_type') });
  
  if (!parsed.success) {
    return { ok: false, error: 'Invalid role' };
  }

  const supabase = createSupabaseServer();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  
  if (authErr || !user) {
    return { ok: false, error: 'Not authenticated' };
  }

  // Upsert own row. RLS allows only self user_id.
  const { error } = await supabase
    .from('user_profiles')
    .upsert(
      {
        user_id: user.id,
        user_type: parsed.data.user_type,
        full_name: user.email?.split('@')[0] ?? 'User',
      },
      { onConflict: 'user_id' }
    )
    .select('user_id')
    .single();

  if (error) {
    console.error('Error saving role:', error);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

