"use client";

import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/lib/hooks/useCart";
import type { MenuItemWithRelations } from "@/types";

type Props = {
  item: MenuItemWithRelations | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

export default function ItemDetailDialog({ item, open, onOpenChange }: Props) {
  const addItem = useCart((s) => s.addItem);

  const [quantity, setQuantity] = useState(1);
  const [sizeName, setSizeName] = useState<string | null>(null);
  const [extrasOn, setExtrasOn] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!item || !open) return;
    setQuantity(1);
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

  const unitTotal = useMemo(() => {
    if (!item) return 0;
    const base = Number(item.base_price) || 0;
    const sz = selectedSize?.price_modifier ?? 0;
    const ex = selectedExtras.reduce((sum, e) => sum + e.price, 0);
    return base + sz + ex;
  }, [item, selectedSize, selectedExtras]);

  const lineTotal = unitTotal * quantity;

  if (!item) return null;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogTitle className="sr-only">{item.name}</DialogTitle>

        <div
          className="aspect-16/10 overflow-hidden"
          style={{ backgroundColor: "#FFF7EC" }}
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
              <ImageIcon size={48} style={{ color: "#E5B875" }} />
            </div>
          )}
        </div>

        <div className="p-5 space-y-5">
          <div>
            <h2
              className="text-2xl font-bold leading-tight"
              style={{ color: "#1A1A1A", fontFamily: "var(--font-playfair)" }}
            >
              {item.name}
            </h2>
            {item.description && (
              <p
                className="text-sm mt-1.5 leading-relaxed"
                style={{ color: "#4A4A4A" }}
              >
                {item.description}
              </p>
            )}
          </div>

          {(item.sizes?.length ?? 0) > 0 && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: "#94A3B8" }}
              >
                Size
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {item.sizes!.map((sz) => {
                  const active = sz.name === sizeName;
                  return (
                    <button
                      key={sz.id}
                      type="button"
                      onClick={() => setSizeName(sz.name)}
                      className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                      style={{
                        border: active
                          ? "2px solid #FF5A3C"
                          : "1.5px solid #ECECEC",
                        backgroundColor: active ? "#FFF1ED" : "#FFFFFF",
                        color: "#1A1A1A",
                      }}
                    >
                      <span>{sz.name}</span>
                      {Number(sz.price_modifier) !== 0 && (
                        <span
                          className="text-xs tabular-nums"
                          style={{ color: "#64748B" }}
                        >
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

          {(item.extras?.length ?? 0) > 0 && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: "#94A3B8" }}
              >
                Extras
              </h3>
              <div className="space-y-1.5">
                {item.extras!
                  .filter((e) => e.is_available)
                  .map((ex) => {
                    const active = !!extrasOn[ex.id];
                    return (
                      <label
                        key={ex.id}
                        className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg cursor-pointer"
                        style={{
                          border: active
                            ? "1.5px solid #FF5A3C"
                            : "1.5px solid #ECECEC",
                          backgroundColor: active ? "#FFF1ED" : "#FFFFFF",
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={active}
                            onChange={(e) =>
                              setExtrasOn((prev) => ({
                                ...prev,
                                [ex.id]: e.target.checked,
                              }))
                            }
                            className="w-4 h-4 accent-[#FF5A3C]"
                          />
                          <span className="text-sm" style={{ color: "#1A1A1A" }}>
                            {ex.name}
                          </span>
                        </div>
                        <span
                          className="text-xs tabular-nums"
                          style={{ color: "#64748B" }}
                        >
                          +${Number(ex.price).toFixed(2)}
                        </span>
                      </label>
                    );
                  })}
              </div>
            </section>
          )}

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: "#94A3B8" }}
            >
              Special instructions
            </h3>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Allergies, preferences, extra sauces…"
              style={{ backgroundColor: "#FFFFFF" }}
            />
          </section>

          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 rounded-full px-2 py-1"
              style={{ border: "1.5px solid #ECECEC" }}
            >
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ color: "#1A1A1A" }}
              >
                <Minus size={15} />
              </button>
              <span
                className="w-6 text-center font-semibold text-sm tabular-nums"
                style={{ color: "#1A1A1A" }}
              >
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ color: "#1A1A1A" }}
              >
                <Plus size={15} />
              </button>
            </div>

            <Button
              onClick={handleAdd}
              className="flex-1 rounded-full text-sm font-bold"
              style={{
                background: "linear-gradient(135deg, #FFB627 0%, #FF5A3C 100%)",
                color: "#FFFFFF",
                height: 44,
              }}
            >
              Add to cart — ${lineTotal.toFixed(2)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
