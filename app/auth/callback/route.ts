import { NextResponse, type NextRequest } from "next/server";

/**
 * Legacy Supabase OAuth callback. The Go backend uses Google Identity
 * Services client-side, so there's no server-side OAuth round-trip anymore.
 * Any stale callback hits just land the user back at login with the `next`
 * param preserved.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") || "/menu";
  const errorDescription = url.searchParams.get("error_description");

  const redirect = new URL("/customer-login", url.origin);
  redirect.searchParams.set("next", next);
  if (errorDescription) redirect.searchParams.set("error", errorDescription);
  return NextResponse.redirect(redirect);
}
