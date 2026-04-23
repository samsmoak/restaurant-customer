"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useOrdersStore } from "@/lib/stores/orders.store";
import { useRestaurantStore } from "@/lib/stores/restaurant.store";
import type { GoOrder, GoOrderStatus } from "@/lib/api/dto";

const STATUS_STYLES: Record<GoOrderStatus, { bg: string; fg: string }> = {
  new: { bg: "#FEF3C7", fg: "#92400E" },
  preparing: { bg: "#DBEAFE", fg: "#1E40AF" },
  ready: { bg: "#D1FAE5", fg: "#065F46" },
  completed: { bg: "#E5E7EB", fg: "#374151" },
  cancelled: { bg: "#FEE2E2", fg: "#991B1B" },
};

export default function CustomerOrdersPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const hydrate = useAuthStore((s) => s.hydrate);
  const orders = useOrdersStore((s) => s.orders);
  const loading = useOrdersStore((s) => s.loading);
  const error = useOrdersStore((s) => s.error);
  const fetchMine = useOrdersStore((s) => s.fetchMine);
  const restaurant = useRestaurantStore((s) => s.restaurant);
  const fetchRestaurant = useRestaurantStore((s) => s.fetch);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!token) {
      router.push("/customer-login?next=/orders");
      return;
    }
    void fetchMine();
    if (!restaurant) void fetchRestaurant();
  }, [token, fetchMine, fetchRestaurant, restaurant, router]);

  const currency = restaurant?.currency ?? "USD";

  return (
    <main className="min-h-screen pt-28 pb-24 px-6 max-w-3xl mx-auto">
      <p
        className="text-sm tracking-[0.3em] uppercase mb-3 font-semibold"
        style={{ color: "#FF5A3C" }}
      >
        Your history
      </p>
      <h1
        className="text-4xl md:text-5xl font-bold mb-8"
        style={{ fontFamily: "var(--font-playfair)", color: "#1A1A1A" }}
      >
        My orders
      </h1>

      {error && (
        <div
          className="rounded-lg p-4 text-sm"
          style={{
            backgroundColor: "#FEF2F2",
            color: "#991B1B",
            border: "1px solid #FECACA",
          }}
        >
          {error}
        </div>
      )}

      {loading && orders.length === 0 && (
        <div style={{ color: "#4A4A4A" }}>Loading your orders…</div>
      )}

      {!loading && !error && orders.length === 0 ? (
        <EmptyOrders />
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <OrderRow key={o.id} order={o} currency={currency} />
          ))}
        </div>
      )}
    </main>
  );
}

function OrderRow({ order, currency }: { order: GoOrder; currency: string }) {
  const s = STATUS_STYLES[order.status];
  const itemCount = (order.items ?? []).reduce(
    (sum, it) => sum + (it.quantity || 0),
    0
  );
  const fmtTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(order.total);

  return (
    <Link
      href={`/track?order=${encodeURIComponent(order.order_number)}`}
      className="block rounded-2xl p-5 transition-all hover:shadow-md"
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #ECECEC",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p
              className="font-mono font-bold text-sm"
              style={{ color: "#1A1A1A" }}
            >
              {order.order_number}
            </p>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide"
              style={{ backgroundColor: s.bg, color: s.fg }}
            >
              {order.status}
            </span>
          </div>
          <p className="text-sm" style={{ color: "#4A4A4A" }}>
            {format(new Date(order.created_at), "MMM d, yyyy · h:mm a")}
          </p>
          <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>
            {itemCount} item{itemCount === 1 ? "" : "s"} ·{" "}
            <span className="capitalize">{order.order_type}</span>
          </p>
        </div>
        <div className="text-right shrink-0">
          <p
            className="font-bold tabular-nums text-lg"
            style={{ color: "#1A1A1A" }}
          >
            {fmtTotal}
          </p>
          <p
            className="text-xs"
            style={{
              color: order.payment_status === "paid" ? "#10B981" : "#94A3B8",
            }}
          >
            {order.payment_status === "paid"
              ? "Paid"
              : order.payment_status === "failed"
                ? "Payment failed"
                : "Pending"}
          </p>
        </div>
      </div>
    </Link>
  );
}

function EmptyOrders() {
  return (
    <div
      className="rounded-2xl py-16 px-6 text-center"
      style={{
        backgroundColor: "#FFF7EC",
        border: "1.5px dashed rgba(255, 182, 39, 0.35)",
      }}
    >
      <p className="font-semibold text-lg" style={{ color: "#1A1A1A" }}>
        No orders yet
      </p>
      <p className="text-sm mt-1" style={{ color: "#4A4A4A" }}>
        When you place your first order it&apos;ll show up here.
      </p>
      <Link
        href="/menu"
        className="inline-block mt-4 px-5 py-2 rounded-full text-sm font-semibold"
        style={{
          background: "linear-gradient(135deg, #FFB627 0%, #FF5A3C 100%)",
          color: "#FFFFFF",
        }}
      >
        Browse menu
      </Link>
    </div>
  );
}
