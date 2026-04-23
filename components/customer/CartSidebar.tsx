"use client";

import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/hooks/useCart";

export default function CartSidebar({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.getSubtotal());
  const removeItem = useCart((s) => s.removeItem);
  const updateQuantity = useCart((s) => s.updateQuantity);

  const handleCheckout = () => {
    onOpenChange(false);
    router.push("/checkout");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-5 py-4 border-b">
          <SheetTitle>Your cart</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#FFF7EC" }}
            >
              <ShoppingBag size={22} style={{ color: "#FF5A3C" }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>
              Your cart is empty
            </p>
            <p className="text-xs text-center max-w-[240px]" style={{ color: "#4A4A4A" }}>
              Add something tasty from the menu to get started.
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.map((it) => (
                <div
                  key={it.cartId}
                  className="flex gap-3 pb-4"
                  style={{ borderBottom: "1px solid #F1F5F9" }}
                >
                  <div
                    className="w-16 h-16 rounded-lg overflow-hidden shrink-0"
                    style={{ backgroundColor: "#FFF7EC" }}
                  >
                    {it.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={it.image_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className="text-sm font-semibold truncate"
                        style={{ color: "#1A1A1A" }}
                      >
                        {it.name}
                        {it.selectedSize && (
                          <span
                            className="font-normal"
                            style={{ color: "#64748B" }}
                          >
                            {" "}
                            · {it.selectedSize.name}
                          </span>
                        )}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeItem(it.cartId)}
                        style={{ color: "#94A3B8" }}
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {it.selectedExtras.length > 0 && (
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "#64748B" }}
                      >
                        + {it.selectedExtras.map((e) => e.name).join(", ")}
                      </p>
                    )}
                    {it.specialInstructions && (
                      <p
                        className="text-xs italic mt-0.5"
                        style={{ color: "#94A3B8" }}
                      >
                        “{it.specialInstructions}”
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <div
                        className="inline-flex items-center rounded-full"
                        style={{ border: "1.5px solid #ECECEC" }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              it.cartId,
                              Math.max(1, it.quantity - 1)
                            )
                          }
                          className="w-7 h-7 flex items-center justify-center"
                          style={{ color: "#1A1A1A" }}
                        >
                          <Minus size={13} />
                        </button>
                        <span
                          className="w-6 text-center text-sm font-semibold tabular-nums"
                          style={{ color: "#1A1A1A" }}
                        >
                          {it.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(it.cartId, it.quantity + 1)
                          }
                          className="w-7 h-7 flex items-center justify-center"
                          style={{ color: "#1A1A1A" }}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <span
                        className="text-sm font-bold tabular-nums"
                        style={{ color: "#1A1A1A" }}
                      >
                        ${it.itemTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="px-5 py-4 space-y-3"
              style={{ borderTop: "1px solid #F1F5F9" }}
            >
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: "#4A4A4A" }}>Subtotal</span>
                <span
                  className="font-bold tabular-nums"
                  style={{ color: "#1A1A1A" }}
                >
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <p className="text-xs" style={{ color: "#94A3B8" }}>
                Taxes and delivery fees calculated at checkout.
              </p>
              <Button
                onClick={handleCheckout}
                className="w-full rounded-full font-bold"
                style={{
                  background:
                    "linear-gradient(135deg, #FFB627 0%, #FF5A3C 100%)",
                  color: "#FFFFFF",
                  height: 44,
                }}
              >
                Checkout — ${subtotal.toFixed(2)}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
