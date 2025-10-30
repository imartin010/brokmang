/**
 * Supabase Server Client
 * For use in Server Actions and Route Handlers
 */

import { cookies, headers } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export function createSupabaseServer() {
  const cookieStore = cookies();
  const hdrs = headers();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // anon is fine for RLS-own-row ops
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {
          /* Next handles cookie setting */
        },
        remove() {
          /* Next handles cookie removal */
        },
      },
      global: {
        headers: {
          // Forward for auth continuity in Route Handlers
          'x-forwarded-for': hdrs.get('x-forwarded-for') ?? undefined,
          'user-agent': hdrs.get('user-agent') ?? undefined,
        },
      },
    }
  );
}

