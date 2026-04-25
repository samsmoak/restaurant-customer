"use client";

import { ImageIcon, Plus } from "lucide-react";
import type { MenuItemWithRelations } from "@/types";
import { useCart } from "@/lib/hooks/useCart";

export default function MenuItemCard({
  item,
  onClick,
}: {
  item: MenuItemWithRelations;
  onClick: () => void;
}) {
  const unavailable = !item.is_available;
  const cartItems = useCart((s) => s.items);
  const count = cartItems
    .filter((i) => i.menuItemId === item.id)
    .reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div
      className="flex flex-col overflow-hidden transition-shadow hover:shadow-sm"
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 10,
        opacity: unavailable ? 0.55 : 1,
      }}
    >
      {/* Image */}
      <div
        className="overflow-hidden shrink-0"
        style={{ backgroundColor: "#F5F7FA", aspectRatio: "4/3" }}
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
            <ImageIcon size={28} style={{ color: "#D1D5DB" }} />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col flex-1 p-3 gap-2">
        <div className="flex-1 min-w-0">
          <p
            className="font-semibold text-sm leading-snug line-clamp-2"
            style={{ color: "#1E1E1E" }}
          >
            {item.name}
          </p>
          {item.description && (
            <p
              className="text-xs mt-1 leading-relaxed line-clamp-2"
              style={{ color: "#6B7280" }}
            >
              {item.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mt-auto">
          {unavailable ? (
            <p className="text-xs font-semibold" style={{ color: "#DC2626" }}>
              Unavailable
            </p>
          ) : (
            <p className="text-sm font-bold" style={{ color: "#1E1E1E" }}>
              ${Number(item.base_price).toFixed(2)}
            </p>
          )}

          {!unavailable && (
            <button
              type="button"
              onClick={onClick}
              className="w-8 h-8 shrink-0 flex items-center justify-center font-bold transition-opacity hover:opacity-80"
              style={{
                backgroundColor: "#0F2B4D",
                color: "#FFFFFF",
                borderRadius: 6,
              }}
              aria-label={`Add ${item.name}`}
            >
              {count > 0 ? (
                <span className="text-xs font-bold">{count}</span>
              ) : (
                <Plus size={14} />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
