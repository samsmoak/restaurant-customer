import { NextResponse, type NextRequest } from 'next/server';

/**
 * No-op proxy. Auth is entirely client-side now (JWT in localStorage,
 * Authorization: Bearer on each request to the Go backend). The previous
 * Supabase session-refresh middleware has been removed.
 */
export async function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
