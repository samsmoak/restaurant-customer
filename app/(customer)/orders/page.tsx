"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ChevronRight } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useOrdersStore } from "@/lib/stores/orders.store";
import { useRestaurantStore } from "@/lib/stores/restaurant.store";
import { useAuthHydrated } from "@/lib/hooks/useAuthHydrated";
import type { GoOrder, GoOrderStatus } from "@/lib/api/dto";

const STATUS_LABEL: Record<GoOrderStatus, string> = {
  new: "Placed",
  preparing: "Preparing",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_COLORS: Record<GoOrderStatus, { bg: string; fg: string }> = {
  new: { bg: "#FEF3C7", fg: "#92400E" },
  preparing: { bg: "#DBEAFE", fg: "#1E40AF" },
  ready: { bg: "#D1FAE5", fg: "#065F46" },
  completed: { bg: "#F3F4F6", fg: "#374151" },
  cancelled: { bg: "#FEE2E2", fg: "#991B1B" },
};

export default function CustomerOrdersPage() {
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const token = useAuthStore((s) => s.token);
  const orders = useOrdersStore((s) => s.orders);
  const loading = useOrdersStore((s) => s.loading);
  const error = useOrdersStore((s) => s.error);
  const fetchMine = useOrdersStore((s) => s.fetchMine);
  const restaurant = useRestaurantStore((s) => s.restaurant);
  const fetchRestaurant = useRestaurantStore((s) => s.fetch);

  useEffect(() => {
    if (!hydrated) return;
    if (!token) { router.push("/customer-login?next=/orders"); return; }
    void fetchMine();
    if (!restaurant) void fetchRestaurant();
  }, [hydrated, token, fetchMine, fetchRestaurant, restaurant, router]);

  const currency = restaurant?.currency ?? "USD";

  return (
    <main className="min-h-screen pt-28 pb-24" style={{ backgroundColor: "#F5F7FA" }}>
      <div className="px-6 max-w-4xl mx-auto">
        <p
          className="text-xs font-semibold uppercase tracking-[0.15em] mb-2"
          style={{ color: "#4A4A4A" }}
        >
          History
        </p>
        <h1 className="text-3xl font-bold mb-8" style={{ color: "#1E1E1E" }}>
          My orders
        </h1>

        {error && (
          <div
            className="rounded-[8px] p-4 text-sm mb-4"
            style={{ backgroundColor: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA" }}
          >
            {error}
          </div>
        )}

        {loading && orders.length === 0 && (
          <p className="text-sm" style={{ color: "#6B7280" }}>Loading your orders…</p>
        )}

        {!loading && !error && orders.length === 0 ? (
          <EmptyOrders />
        ) : (
          <div className="space-y-2">
            {orders.map((o) => (
              <OrderRow key={o.id} order={o} currency={currency} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function OrderRow({ order, currency }: { order: GoOrder; currency: string }) {
  const s = STATUS_COLORS[order.status];
  const itemCount = (order.items ?? []).reduce((sum, it) => sum + (it.quantity || 0), 0);
  const fmtTotal = new Intl.NumberFormat("en-US", { style: "currency", currency }).format(order.total);

  return (
    <Link
      href={`/track?order=${encodeURIComponent(order.order_number)}`}
      className="flex items-center justify-between gap-4 p-4 transition-shadow hover:shadow-sm"
      style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 8 }}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono font-semibold text-sm" style={{ color: "#1E1E1E" }}>
            {order.order_number}
          </span>
          <span
            className="text-xs font-semibold px-2 py-0.5 uppercase tracking-wide"
            style={{ backgroundColor: s.bg, color: s.fg, borderRadius: 4 }}
          >
            {STATUS_LABEL[order.status]}
          </span>
        </div>
        <p className="text-xs" style={{ color: "#4A4A4A" }}>
          {format(new Date(order.created_at), "MMM d, yyyy · h:mm a")}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
          {itemCount} item{itemCount === 1 ? "" : "s"} ·{" "}
          <span className="capitalize">{order.order_type}</span>
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <p className="font-bold tabular-nums text-sm" style={{ color: "#1E1E1E" }}>
            {fmtTotal}
          </p>
          <p
            className="text-xs"
            style={{
              color:
                order.payment_status === "paid"
                  ? "#166534"
                  : order.payment_status === "failed"
                  ? "#DC2626"
                  : "#6B7280",
            }}
          >
            {order.payment_status === "paid"
              ? "Paid"
              : order.payment_status === "failed"
              ? "Payment failed"
              : "Pending"}
          </p>
        </div>
        <ChevronRight size={16} style={{ color: "#6B7280" }} />
      </div>
    </Link>
  );
}

function EmptyOrders() {
  return (
    <div
      className="py-16 px-6 text-center"
      style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 8 }}
    >
      <p className="font-semibold text-base" style={{ color: "#1E1E1E" }}>
        No orders yet
      </p>
      <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
        When you place your first order it&apos;ll show up here.
      </p>
      <Link
        href="/menu"
        className="inline-block mt-4 px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
        style={{ backgroundColor: "#0F2B4D", color: "#FFFFFF", borderRadius: 6 }}
      >
        Browse menu
      </Link>
    </div>
  );
}
