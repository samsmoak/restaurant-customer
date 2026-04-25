"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Clock, CheckCircle2, Circle } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useOrdersStore } from "@/lib/stores/orders.store";
import { useRestaurantStore } from "@/lib/stores/restaurant.store";
import { useAuthHydrated } from "@/lib/hooks/useAuthHydrated";
import type { GoOrder, GoOrderStatus } from "@/lib/api/dto";

const ACTIVE_STATUSES: GoOrderStatus[] = ["new", "preparing", "ready"];
const STATUS_ORDER: GoOrderStatus[] = ["new", "preparing", "ready", "completed"];
const STEP_LABELS: Record<GoOrderStatus, string> = {
  new: "Order placed",
  preparing: "Preparing",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_BADGE: Record<GoOrderStatus, { bg: string; fg: string; label: string }> = {
  new: { bg: "#FEF3C7", fg: "#92400E", label: "Placed" },
  preparing: { bg: "#DBEAFE", fg: "#1E40AF", label: "Preparing" },
  ready: { bg: "#D1FAE5", fg: "#065F46", label: "Ready!" },
  completed: { bg: "#F3F4F6", fg: "#374151", label: "Completed" },
  cancelled: { bg: "#FEE2E2", fg: "#991B1B", label: "Cancelled" },
};

function stepIndex(status: GoOrderStatus) {
  const i = STATUS_ORDER.indexOf(status);
  return i === -1 ? 0 : i;
}

export default function TrackPage() {
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const token = useAuthStore((s) => s.token);
  const orders = useOrdersStore((s) => s.orders);
  const loading = useOrdersStore((s) => s.loading);
  const error = useOrdersStore((s) => s.error);
  const fetchMine = useOrdersStore((s) => s.fetchMine);
  const restaurant = useRestaurantStore((s) => s.restaurant);
  const fetchRestaurant = useRestaurantStore((s) => s.fetch);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      router.push("/customer-login?next=/track");
      return;
    }
    void fetchMine();
    if (!restaurant) void fetchRestaurant();

    pollRef.current = setInterval(() => void fetchMine(), 30_000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [hydrated, token, fetchMine, fetchRestaurant, restaurant, router]);

  const activeOrders = orders.filter((o) =>
    ACTIVE_STATUSES.includes(o.status)
  );

  return (
    <main className="min-h-screen pt-28 pb-24" style={{ backgroundColor: "#F5F7FA" }}>
      <div className="px-6 max-w-3xl mx-auto">
        <p
          className="text-xs font-semibold uppercase tracking-[0.15em] mb-2"
          style={{ color: "#4A4A4A" }}
        >
          Live status
        </p>
        <h1 className="text-3xl font-bold mb-8" style={{ color: "#1E1E1E" }}>
          Active orders
        </h1>

        {loading && orders.length === 0 && (
          <p className="text-sm" style={{ color: "#6B7280" }}>
            Loading your orders…
          </p>
        )}

        {error && (
          <div
            className="text-sm p-4 mb-4"
            style={{
              backgroundColor: "#FEF2F2",
              color: "#991B1B",
              border: "1px solid #FECACA",
              borderRadius: 8,
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && activeOrders.length === 0 && (
          <NoActiveOrders />
        )}

        <div className="space-y-4">
          {activeOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </div>
    </main>
  );
}

function OrderCard({ order }: { order: GoOrder }) {
  const currentStep = stepIndex(order.status);
  const itemCount = (order.items ?? []).reduce((sum, it) => sum + (it.quantity || 0), 0);
  const badge = STATUS_BADGE[order.status] ?? STATUS_BADGE.new;

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 8,
      }}
    >
      {/* Header */}
      <div className="px-5 py-4" style={{ borderBottom: "1px solid #E5E7EB" }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono font-semibold text-sm" style={{ color: "#1E1E1E" }}>
              {order.order_number}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
              {format(new Date(order.created_at), "MMM d, yyyy · h:mm a")} ·{" "}
              <span className="capitalize">{order.order_type}</span>
            </p>
          </div>
          <span
            className="text-xs font-semibold px-2 py-0.5 uppercase tracking-wide"
            style={{ backgroundColor: badge.bg, color: badge.fg, borderRadius: 4 }}
          >
            {badge.label}
          </span>
        </div>
      </div>

      {/* Stepper */}
      <div className="px-5 py-5" style={{ borderBottom: "1px solid #E5E7EB" }}>
        <div className="relative flex items-start justify-between">
          {/* Track */}
          <div
            className="absolute top-3.5 inset-x-4"
            style={{ height: 2, backgroundColor: "#E5E7EB", zIndex: 0 }}
          >
            <div
              style={{
                height: "100%",
                backgroundColor: "#0F2B4D",
                width: `${(currentStep / (STATUS_ORDER.length - 1)) * 100}%`,
                transition: "width 0.5s ease",
              }}
            />
          </div>

          {STATUS_ORDER.map((key, i) => {
            const done = i <= currentStep;
            return (
              <div
                key={key}
                className="relative z-10 flex flex-col items-center gap-1.5"
                style={{ minWidth: 56 }}
              >
                <div
                  className="w-7 h-7 flex items-center justify-center"
                  style={
                    done
                      ? { backgroundColor: "#0F2B4D", color: "#FFFFFF", borderRadius: 6 }
                      : { backgroundColor: "#FFFFFF", color: "#6B7280", border: "1px solid #E5E7EB", borderRadius: 6 }
                  }
                >
                  {done ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                </div>
                <span
                  className="text-xs text-center font-medium"
                  style={{ color: done ? "#1E1E1E" : "#6B7280", maxWidth: 52 }}
                >
                  {STEP_LABELS[key]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Estimated time */}
      {order.estimated_ready_time && (
        <div
          className="px-5 py-3 flex items-center gap-2"
          style={{ backgroundColor: "#F5F7FA", borderBottom: "1px solid #E5E7EB" }}
        >
          <Clock size={14} style={{ color: "#0F2B4D" }} />
          <span className="text-sm" style={{ color: "#1E1E1E" }}>
            Estimated ready at{" "}
            <strong>{format(new Date(order.estimated_ready_time), "h:mm a")}</strong>
          </span>
        </div>
      )}

      {/* Items summary */}
      <div className="px-5 py-4">
        <p
          className="text-xs font-semibold uppercase tracking-[0.15em] mb-2"
          style={{ color: "#4A4A4A" }}
        >
          Items · {itemCount}
        </p>
        <div className="space-y-1">
          {(order.items ?? []).map((it) => (
            <div key={it.id} className="flex justify-between text-sm gap-4">
              <span style={{ color: "#4A4A4A" }}>
                {it.quantity}× {it.name}
                {it.selected_size && (
                  <span style={{ color: "#6B7280" }}> ({it.selected_size.name})</span>
                )}
              </span>
              <span className="tabular-nums font-medium" style={{ color: "#1E1E1E" }}>
                ${Number(it.item_total).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-3 flex justify-between font-bold" style={{ borderTop: "1px solid #E5E7EB", color: "#1E1E1E" }}>
          <span>Total</span>
          <span className="tabular-nums">${Number(order.total).toFixed(2)}</span>
        </div>
      </div>

      {order.delivery_address && (
        <div className="px-5 pb-4 text-sm" style={{ color: "#4A4A4A" }}>
          <span className="font-semibold" style={{ color: "#1E1E1E" }}>Deliver to: </span>
          {order.delivery_address}
        </div>
      )}

      <div
        className="px-5 py-3"
        style={{ borderTop: "1px solid #E5E7EB", backgroundColor: "#F5F7FA", borderRadius: "0 0 8px 8px" }}
      >
        <span className="text-xs capitalize" style={{ color: "#6B7280" }}>
          {order.payment_status === "paid" ? "Paid" : "Pending payment"}
        </span>
      </div>
    </div>
  );
}

function NoActiveOrders() {
  return (
    <div
      className="py-16 px-6 text-center"
      style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 8 }}
    >
      <p className="font-semibold text-base" style={{ color: "#1E1E1E" }}>
        No active orders
      </p>
      <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
        You don&apos;t have any orders in progress right now.
      </p>
      <div className="flex items-center justify-center gap-3 mt-5">
        <Link
          href="/menu"
          className="px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#0F2B4D", color: "#FFFFFF", borderRadius: 6 }}
        >
          Order now
        </Link>
        <Link
          href="/orders"
          className="px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ backgroundColor: "#FFFFFF", color: "#1E1E1E", border: "1px solid #E5E7EB", borderRadius: 6 }}
        >
          Order history
        </Link>
      </div>
    </div>
  );
}
