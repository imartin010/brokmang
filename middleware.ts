/**
 * Middleware - Simple Route Protection
 * Protects dashboard, allows public paths and auth flow
 */

import { NextResponse, NextRequest } from 'next/server';

const PUBLIC_PATHS = new Set<string>([
  '/',
  '/auth/signin',
  '/auth/signup',
  '/auth/callback',
  '/select-role',
  '/favicon.ico',
]);

export function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const path = url.pathname;

  // Allow public paths and Next.js internals
  if (PUBLIC_PATHS.has(path) || path.startsWith('/_next') || path.startsWith('/api')) {
    return NextResponse.next();
  }

  // Check for Supabase auth cookie (various formats)
  const authCookie = 
    req.cookies.get('sb-access-token') ?? 
    req.cookies.get('sb:token') ??
    req.cookies.get('sb-eamywkblubazqmepaxmm-auth-token');

  if (!authCookie) {
    const res = NextResponse.redirect(new URL('/auth/signin', req.url));
    res.headers.set('Cache-Control', 'no-store');
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico).*)'],
};
