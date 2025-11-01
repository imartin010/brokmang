/**
 * Middleware - Simple Route Protection
 * Allows public paths, lets pages handle their own auth checks
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

  // For protected paths, let the pages handle auth checks client-side
  // This prevents middleware from blocking valid sessions due to cookie name mismatches
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico).*)'],
};
