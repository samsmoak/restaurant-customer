"use client";

import { ImageIcon } from "lucide-react";
import type { MenuItemWithRelations } from "@/types";

export default function MenuItemCard({
  item,
  onClick,
}: {
  item: MenuItemWithRelations;
  onClick: () => void;
}) {
  const unavailable = !item.is_available;
  return (
    <button
      type="button"
      onClick={unavailable ? undefined : onClick}
      disabled={unavailable}
      className="text-left w-full rounded-2xl overflow-hidden transition-all group"
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #ECECEC",
        opacity: unavailable ? 0.55 : 1,
        cursor: unavailable ? "not-allowed" : "pointer",
      }}
    >
      <div
        className="aspect-4/3 overflow-hidden"
        style={{ backgroundColor: "#FFF7EC" }}
      >
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={36} style={{ color: "#E5B875" }} />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3
            className="font-semibold text-base leading-tight"
            style={{ color: "#1A1A1A" }}
          >
            {item.name}
          </h3>
          <span
            className="font-bold text-sm tabular-nums shrink-0 mt-0.5"
            style={{ color: "#FF5A3C" }}
          >
            ${Number(item.base_price).toFixed(2)}
          </span>
        </div>
        {item.description && (
          <p
            className="text-xs leading-relaxed line-clamp-2"
            style={{ color: "#4A4A4A" }}
          >
            {item.description}
          </p>
        )}
        {unavailable && (
          <p
            className="text-xs mt-2 font-semibold"
            style={{ color: "#DC2626" }}
          >
            Currently unavailable
          </p>
        )}
      </div>
    </button>
  );
}
