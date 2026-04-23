import { NextResponse } from "next/server";

/**
 * Deprecated. Point your Stripe webhook at the Go backend:
 *   POST <API_URL>/api/stripe/webhook
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Stripe webhooks are handled by the Go backend now. Re-point the webhook URL.",
    },
    { status: 410 }
  );
}
