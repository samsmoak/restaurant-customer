import Link from "next/link";
import OrderConfirmedClient from "./OrderConfirmedClient";

type SearchParams = Promise<{ order?: string }>;

export default async function OrderConfirmedPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { order } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="text-center max-w-md space-y-6">
        <OrderConfirmedClient />

        <div
          className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-5xl"
          style={{
            background: "linear-gradient(135deg, #3EB489 0%, #2E8C68 100%)",
            color: "#FFFFFF",
            boxShadow: "0 12px 32px rgba(62, 180, 137, 0.35)",
          }}
        >
          ✓
        </div>
        <h1
          className="text-5xl font-bold"
          style={{ fontFamily: "var(--font-playfair)", color: "#1A1A1A" }}
        >
          Order{" "}
          <em
            className="italic"
            style={{
              backgroundImage:
                "linear-gradient(90deg, #3EB489 0%, #FFB627 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            confirmed!
          </em>
        </h1>
        <p style={{ color: "#4A4A4A" }} className="text-lg">
          Your order has been placed successfully.
        </p>

        {order && (
          <div
            className="rounded-xl px-5 py-3 inline-block"
            style={{
              backgroundColor: "#FFF7EC",
              border: "1.5px solid rgba(255, 182, 39, 0.35)",
            }}
          >
            <p
              className="text-xs uppercase tracking-wider font-semibold"
              style={{ color: "#94A3B8" }}
            >
              Order number
            </p>
            <p
              className="text-lg font-mono font-bold mt-0.5"
              style={{ color: "#1A1A1A" }}
            >
              {order}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          {order && (
            <Link
              href={`/track?order=${encodeURIComponent(order)}`}
              className="px-6 py-2.5 rounded-full font-semibold text-sm"
              style={{ backgroundColor: "#1A1A1A", color: "#FFFFFF" }}
            >
              Track order
            </Link>
          )}
          <Link
            href="/orders"
            className="px-6 py-2.5 rounded-full font-semibold text-sm"
            style={{
              backgroundColor: "#FFFFFF",
              color: "#1A1A1A",
              border: "1.5px solid #ECECEC",
            }}
          >
            My orders
          </Link>
        </div>
      </div>
    </main>
  );
}
