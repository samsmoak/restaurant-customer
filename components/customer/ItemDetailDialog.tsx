"use client";

import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useCart } from "@/lib/hooks/useCart";
import type { MenuItemWithRelations } from "@/types";

type Props = {
  item: MenuItemWithRelations | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

export default function ItemDetailDialog({ item, open, onOpenChange }: Props) {
  const addItem = useCart((s) => s.addItem);
  const cartItems = useCart((s) => s.items);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeItem = useCart((s) => s.removeItem);

  const [quantity, setQuantity] = useState(1);
  const [sizeName, setSizeName] = useState<string | null>(null);
  const [extrasOn, setExtrasOn] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");

  // Reset local state whenever the dialog opens for a new item.
  useEffect(() => {
    if (!item || !open) return;
    setNotes("");
    setExtrasOn({});
    const defaultSize = item.sizes?.find((s) => s.is_default) ?? item.sizes?.[0];
    setSizeName(defaultSize?.name ?? null);
  }, [item, open]);

  const selectedSize = useMemo(() => {
    if (!item || !sizeName) return null;
    const s = (item.sizes ?? []).find((x) => x.name === sizeName);
    return s ? { name: s.name, price_modifier: Number(s.price_modifier) || 0 } : null;
  }, [item, sizeName]);

  const selectedExtras = useMemo(() => {
    if (!item) return [];
    return (item.extras ?? [])
      .filter((e) => extrasOn[e.id])
      .map((e) => ({ name: e.name, price: Number(e.price) || 0 }));
  }, [item, extrasOn]);

  // Find an existing cart entry that matches the current size + extras selection.
  const existingEntry = useMemo(() => {
    if (!item) return null;
    const extrasNames = [...selectedExtras]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((e) => e.name)
      .join(",");
    return (
      cartItems.find(
        (i) =>
          i.menuItemId === item.id &&
          (i.selectedSize?.name ?? "default") === (selectedSize?.name ?? "default") &&
          [...i.selectedExtras]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((e) => e.name)
            .join(",") === extrasNames
      ) ?? null
    );
  }, [cartItems, item, selectedSize, selectedExtras]);

  // Sync local quantity to the existing cart entry when selection changes.
  useEffect(() => {
    setQuantity(existingEntry ? existingEntry.quantity : 1);
  }, [existingEntry]);

  const unitTotal = useMemo(() => {
    if (!item) return 0;
    const base = Number(item.base_price) || 0;
    const sz = selectedSize?.price_modifier ?? 0;
    const ex = selectedExtras.reduce((sum, e) => sum + e.price, 0);
    return base + sz + ex;
  }, [item, selectedSize, selectedExtras]);

  if (!item) return null;

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleAdd = () => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      image_url: item.image_url,
      quantity,
      base_price: Number(item.base_price),
      selectedSize,
      selectedExtras,
      specialInstructions: notes,
    });
    toast.success(`Added ${quantity} × ${item.name} to cart`);
    onOpenChange(false);
  };

  const handleDecrease = () => {
    if (existingEntry) {
      if (existingEntry.quantity <= 1) {
        removeItem(existingEntry.cartId);
        toast(`Removed ${item.name} from cart`);
        onOpenChange(false);
      } else {
        updateQuantity(existingEntry.cartId, existingEntry.quantity - 1);
      }
    } else {
      setQuantity((q) => Math.max(1, q - 1));
    }
  };

  const handleIncrease = () => {
    if (existingEntry) {
      updateQuantity(existingEntry.cartId, existingEntry.quantity + 1);
    } else {
      setQuantity((q) => q + 1);
    }
  };

  const displayQty = existingEntry ? existingEntry.quantity : quantity;
  const lineTotal = unitTotal * displayQty;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogTitle className="sr-only">{item.name}</DialogTitle>

        {/* Image */}
        <div
          className="aspect-video overflow-hidden"
          style={{ backgroundColor: "#F5F7FA" }}
        >
          {item.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon size={40} style={{ color: "#6B7280" }} />
            </div>
          )}
        </div>

        <div className="p-5 space-y-5">
          {/* Title */}
          <div>
            <h2 className="text-xl font-bold" style={{ color: "#1E1E1E" }}>
              {item.name}
            </h2>
            {item.description && (
              <p className="text-sm mt-1 leading-relaxed" style={{ color: "#4A4A4A" }}>
                {item.description}
              </p>
            )}
          </div>

          {/* Sizes */}
          {(item.sizes?.length ?? 0) > 0 && (
            <section>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-2" style={{ color: "#4A4A4A" }}>
                Size
              </p>
              <div className="grid grid-cols-2 gap-2">
                {item.sizes!.map((sz) => {
                  const active = sz.name === sizeName;
                  return (
                    <button
                      key={sz.id}
                      type="button"
                      onClick={() => setSizeName(sz.name)}
                      className="flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-all"
                      style={{
                        border: active ? "1px solid #0F2B4D" : "1px solid #E5E7EB",
                        backgroundColor: active ? "#F0F4FA" : "#FFFFFF",
                        color: "#1E1E1E",
                        borderRadius: 6,
                      }}
                    >
                      <span>{sz.name}</span>
                      {Number(sz.price_modifier) !== 0 && (
                        <span className="text-xs tabular-nums" style={{ color: "#6B7280" }}>
                          {Number(sz.price_modifier) > 0 ? "+" : ""}$
                          {Number(sz.price_modifier).toFixed(2)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Extras */}
          {(item.extras?.length ?? 0) > 0 && (
            <section>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-2" style={{ color: "#4A4A4A" }}>
                Extras
              </p>
              <div className="space-y-1.5">
                {item.extras!
                  .filter((e) => e.is_available)
                  .map((ex) => {
                    const active = !!extrasOn[ex.id];
                    return (
                      <label
                        key={ex.id}
                        className="flex items-center justify-between gap-3 px-3 py-2.5 cursor-pointer transition-all"
                        style={{
                          border: active ? "1px solid #0F2B4D" : "1px solid #E5E7EB",
                          backgroundColor: active ? "#F0F4FA" : "#FFFFFF",
                          borderRadius: 6,
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={active}
                            onChange={(e) =>
                              setExtrasOn((prev) => ({ ...prev, [ex.id]: e.target.checked }))
                            }
                            style={{ accentColor: "#0F2B4D", width: 15, height: 15 }}
                          />
                          <span className="text-sm" style={{ color: "#1E1E1E" }}>
                            {ex.name}
                          </span>
                        </div>
                        <span className="text-xs tabular-nums" style={{ color: "#6B7280" }}>
                          +${Number(ex.price).toFixed(2)}
                        </span>
                      </label>
                    );
                  })}
              </div>
            </section>
          )}

          {/* Special instructions — only shown before first add */}
          {!existingEntry && (
            <section>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-2" style={{ color: "#4A4A4A" }}>
                Special instructions
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Allergies, preferences, extra sauces…"
                style={{
                  width: "100%",
                  border: "1px solid #E5E7EB",
                  borderRadius: 4,
                  padding: "0.625rem 0.875rem",
                  fontSize: "0.875rem",
                  color: "#1E1E1E",
                  outline: "none",
                  fontFamily: "inherit",
                  resize: "none",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#0F2B4D")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
              />
            </section>
          )}

          {/* Footer: qty stepper + action */}
          <div className="flex items-center justify-between gap-3 pt-1">
            {/* Stepper */}
            <div
              className="inline-flex items-center"
              style={{ border: "1px solid #E5E7EB", borderRadius: 6 }}
            >
              <button
                type="button"
                onClick={handleDecrease}
                className="w-9 h-9 flex items-center justify-center transition-colors hover:bg-gray-50"
                style={{ color: "#1E1E1E" }}
              >
                <Minus size={14} />
              </button>
              <span
                className="w-7 text-center font-semibold text-sm tabular-nums"
                style={{ color: "#1E1E1E" }}
              >
                {displayQty}
              </span>
              <button
                type="button"
                onClick={handleIncrease}
                className="w-9 h-9 flex items-center justify-center transition-colors hover:bg-gray-50"
                style={{ color: "#1E1E1E" }}
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Action button — hidden when item is already in cart */}
            {!existingEntry && (
              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 font-semibold text-sm transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: "#0F2B4D",
                  color: "#FFFFFF",
                  borderRadius: 6,
                  height: 44,
                }}
              >
                Add to cart — ${lineTotal.toFixed(2)}
              </button>
            )}

            {/* When in cart: show live total */}
            {existingEntry && (
              <p className="text-sm font-bold tabular-nums" style={{ color: "#1E1E1E" }}>
                ${lineTotal.toFixed(2)} in cart
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
