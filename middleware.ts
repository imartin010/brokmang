/**
 * Middleware - Clean Rebuild
 * Simple route protection
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: req.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: req.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Get user session
  const { data: { session } } = await supabase.auth.getSession();
  const pathname = req.nextUrl.pathname;

  // Define route types
  const publicRoutes = ['/', '/auth', '/auth/callback'];
  const protectedRoutes = ['/dashboard', '/select-account-type', '/analyze', '/history', '/crm', '/reports', '/insights'];

  const isPublic = publicRoutes.includes(pathname);
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthPage = pathname.startsWith('/auth');

  // If trying to access protected route without session → redirect to auth
  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/auth', req.url));
  }

  // If logged in and trying to access auth page → redirect to dashboard
  if (session && isAuthPage && pathname !== '/auth/callback') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
