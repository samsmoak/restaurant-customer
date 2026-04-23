import { NextResponse, type NextRequest } from "next/server";

/**
 * Legacy signout endpoint. With the Go backend, signout is a client-side
 * operation (drop the JWT). Any remaining links that hit this route are
 * redirected home.
 */
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/", request.url));
}

export async function POST(request: NextRequest) {
  return GET(request);
}
