"use client";

import { useRestaurantStatus } from "@/lib/hooks/useRestaurantStatus";
import RestaurantStatus from "./RestaurantStatus";

interface RestaurantStatusLiveProps {
  size?: "sm" | "md";
}

export default function RestaurantStatusLive({ size = "md" }: RestaurantStatusLiveProps) {
  const { isOpen, nextStatusChange, loading } = useRestaurantStatus();

  if (loading) {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full border-2 ${
          size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm"
        }`}
        style={{
          borderColor: "rgba(156, 163, 175, 0.3)",
          backgroundColor: "rgba(156, 163, 175, 0.08)",
          color: "#4A4A4A",
          backdropFilter: "blur(8px)",
        }}
      >
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#9CA3AF" }} />
        <span>Checking hours…</span>
      </div>
    );
  }

  return (
    <RestaurantStatus
      isOpen={isOpen}
      nextStatusChange={nextStatusChange}
      size={size}
    />
  );
}
