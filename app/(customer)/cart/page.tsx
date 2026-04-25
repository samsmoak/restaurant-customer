"use client";

import { useEffect, useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/hooks/useCart";
import { useRestaurantStore } from "@/lib/stores/restaurant.store";
import { hydrateCart } from "@/lib/stores/cart.store";

export default function CartPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.getSubtotal());
  const removeItem = useCart((s) => s.removeItem);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const restaurant = useRestaurantStore((s) => s.restaurant);
  const fetchRestaurant = useRestaurantStore((s) => s.fetch);

  useEffect(() => {
    hydrateCart();
    setMounted(true);
    if (!restaurant) void fetchRestaurant();
  }, [restaurant, fetchRestaurant]);

  const currency = restaurant?.currency ?? "USD";
  const fmt = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(v);

  if (!mounted) return null;

  return (
    <main className="min-h-screen pt-28 pb-24" style={{ backgroundColor: "#F5F7FA" }}>
      <div className="px-6 max-w-4xl mx-auto">
        <p
          className="text-xs font-semibold uppercase tracking-[0.15em] mb-2"
          style={{ color: "#4A4A4A" }}
        >
          Review
        </p>
        <h1 className="text-3xl font-bold mb-8" style={{ color: "#1E1E1E" }}>
          Your cart
        </h1>

        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6">
            {/* Items */}
            <div className="space-y-2 mb-6 lg:mb-0">
              {items.map((it) => (
                <CartRow
                  key={it.cartId}
                  item={it}
                  fmt={fmt}
                  onRemove={() => removeItem(it.cartId)}
                  onQty={(q) => updateQuantity(it.cartId, q)}
                />
              ))}
            </div>

            {/* Summary */}
            <div>
              <div
                className="sticky top-28 p-6"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: 8,
                }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-[0.15em] mb-4"
                  style={{ color: "#4A4A4A" }}
                >
                  Order summary
                </p>

                <div className="space-y-2 mb-4">
                  {items.map((it) => (
                    <div key={it.cartId} className="flex justify-between text-sm gap-3">
                      <span className="truncate" style={{ color: "#4A4A4A" }}>
                        {it.quantity}× {it.name}
                        {it.selectedSize ? ` (${it.selectedSize.name})` : ""}
                      </span>
                      <span className="tabular-nums shrink-0 font-medium" style={{ color: "#1E1E1E" }}>
                        {fmt(it.itemTotal)}
                      </span>
                    </div>
                  ))}
                </div>

                <div
                  className="border-t pt-4 mb-5"
                  style={{ borderColor: "#E5E7EB" }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: "#4A4A4A" }}>Subtotal</span>
                    <span className="font-bold text-base tabular-nums" style={{ color: "#1E1E1E" }}>
                      {fmt(subtotal)}
                    </span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: "#6B7280" }}>
                    Delivery fees &amp; taxes calculated at checkout
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/checkout")}
                  className="w-full flex items-center justify-center gap-2 font-semibold text-sm transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: "#0F2B4D",
                    color: "#FFFFFF",
                    borderRadius: 6,
                    height: 44,
                  }}
                >
                  Checkout
                  <ArrowRight size={15} />
                </button>

                <Link
                  href="/menu"
                  className="block text-center text-sm mt-3 transition-opacity hover:opacity-70"
                  style={{ color: "#0F2B4D" }}
                >
                  + Add more items
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function CartRow({
  item,
  fmt,
  onRemove,
  onQty,
}: {
  item: {
    cartId: string;
    name: string;
    image_url?: string | null;
    selectedSize?: { name: string } | null;
    selectedExtras: { name: string }[];
    specialInstructions?: string;
    quantity: number;
    itemTotal: number;
  };
  fmt: (v: number) => string;
  onRemove: () => void;
  onQty: (q: number) => void;
}) {
  return (
    <div
      className="flex gap-4 p-4"
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 8,
      }}
    >
      <div
        className="w-14 h-14 rounded overflow-hidden shrink-0"
        style={{ backgroundColor: "#F5F7FA" }}
      >
        {item.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image_url} alt="" className="w-full h-full object-cover" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-sm" style={{ color: "#1E1E1E" }}>
              {item.name}
              {item.selectedSize && (
                <span className="font-normal" style={{ color: "#6B7280" }}>
                  {" "}· {item.selectedSize.name}
                </span>
              )}
            </p>
            {item.selectedExtras.length > 0 && (
              <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
                + {item.selectedExtras.map((e) => e.name).join(", ")}
              </p>
            )}
            {item.specialInstructions && (
              <p className="text-xs italic mt-0.5" style={{ color: "#6B7280" }}>
                &ldquo;{item.specialInstructions}&rdquo;
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 transition-opacity hover:opacity-60"
            style={{ color: "#6B7280" }}
          >
            <Trash2 size={14} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div
            className="inline-flex items-center"
            style={{ border: "1px solid #E5E7EB", borderRadius: 6 }}
          >
            <button
              type="button"
              onClick={() => onQty(Math.max(1, item.quantity - 1))}
              className="w-7 h-7 flex items-center justify-center transition-colors hover:bg-gray-50"
              style={{ color: "#1E1E1E" }}
            >
              <Minus size={12} />
            </button>
            <span
              className="w-6 text-center text-sm font-semibold tabular-nums"
              style={{ color: "#1E1E1E" }}
            >
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onQty(item.quantity + 1)}
              className="w-7 h-7 flex items-center justify-center transition-colors hover:bg-gray-50"
              style={{ color: "#1E1E1E" }}
            >
              <Plus size={12} />
            </button>
          </div>

          <span className="font-bold tabular-nums text-sm" style={{ color: "#1E1E1E" }}>
            {fmt(item.itemTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}

function EmptyCart() {
  return (
    <div
      className="py-20 px-6 text-center max-w-sm mx-auto"
      style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 8 }}
    >
      <div
        className="w-12 h-12 flex items-center justify-center mx-auto mb-4"
        style={{ backgroundColor: "#F5F7FA", borderRadius: 8 }}
      >
        <ShoppingBag size={20} style={{ color: "#6B7280" }} />
      </div>
      <p className="font-semibold text-base" style={{ color: "#1E1E1E" }}>
        Your cart is empty
      </p>
      <p className="text-sm mt-1 mb-5" style={{ color: "#6B7280" }}>
        Add items from the menu to get started.
      </p>
      <Link
        href="/menu"
        className="inline-flex items-center gap-2 px-5 py-2 font-semibold text-sm transition-opacity hover:opacity-90"
        style={{ backgroundColor: "#0F2B4D", color: "#FFFFFF", borderRadius: 6 }}
      >
        Browse menu
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}
