import { NextResponse } from "next/server";

/**
 * Deprecated — checkout is now handled by the Go backend at
 * `POST /api/r/:slug/checkout/create-intent`. The customer app calls it
 * directly via `lib/stores/checkout.store.ts`.
 *
 * Kept as a 410 Gone to surface any forgotten callers.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "This endpoint moved to the Go backend. Use the checkout store instead.",
    },
    { status: 410 }
  );
}
