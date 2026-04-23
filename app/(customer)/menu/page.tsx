"use client";

import { useState } from "react";
import { useMenu } from "@/lib/hooks/useMenu";
import MenuItemCard from "@/components/customer/MenuItemCard";
import ItemDetailDialog from "@/components/customer/ItemDetailDialog";
import CategoryNav from "@/components/customer/CategoryNav";
import type { MenuItemWithRelations } from "@/types";

export default function MenuPage() {
  const { categories, loading } = useMenu();
  const [selected, setSelected] = useState<MenuItemWithRelations | null>(null);

  const visibleCategories = categories.filter((c) => c.items.length > 0);

  return (
    <main className="min-h-screen pt-28 pb-24">
      <header className="px-6 max-w-7xl mx-auto mb-8">
        <p
          className="text-sm tracking-[0.3em] uppercase mb-3 font-semibold"
          style={{ color: "#FF5A3C" }}
        >
          The menu
        </p>
        <h1
          className="text-5xl md:text-6xl font-bold mb-3"
          style={{ fontFamily: "var(--font-playfair)", color: "#1A1A1A" }}
        >
          Our{" "}
          <em
            className="italic"
            style={{
              backgroundImage:
                "linear-gradient(90deg, #FFB627 0%, #FF5A3C 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            kitchen
          </em>
        </h1>
        <p style={{ color: "#4A4A4A" }} className="text-lg max-w-xl">
          Fresh ingredients, bold flavors. Tap anything to add it to your
          cart.
        </p>
      </header>

      {!loading && visibleCategories.length > 0 && (
        <div className="px-6 max-w-7xl mx-auto">
          <CategoryNav categories={visibleCategories} />
        </div>
      )}

      <div className="px-6 max-w-7xl mx-auto mt-6 space-y-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : visibleCategories.length === 0 ? (
          <EmptyMenu />
        ) : (
          visibleCategories.map((cat) => (
            <section key={cat.id} id={`cat-${cat.id}`}>
              <h2
                className="text-3xl font-bold mb-1"
                style={{
                  fontFamily: "var(--font-playfair)",
                  color: "#1A1A1A",
                }}
              >
                {cat.name}
              </h2>
              {cat.description && (
                <p
                  className="text-sm mb-5 max-w-2xl"
                  style={{ color: "#4A4A4A" }}
                >
                  {cat.description}
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {cat.items.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onClick={() => setSelected(item)}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      <ItemDetailDialog
        item={selected}
        open={!!selected}
        onOpenChange={(v) => !v && setSelected(null)}
      />
    </main>
  );
}

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: "#FFFFFF", border: "1px solid #ECECEC" }}
    >
      <div
        className="aspect-4/3 animate-pulse"
        style={{ backgroundColor: "#F8FAFC" }}
      />
      <div className="p-4 space-y-2">
        <div
          className="h-4 rounded animate-pulse"
          style={{ backgroundColor: "#F1F5F9", width: "70%" }}
        />
        <div
          className="h-3 rounded animate-pulse"
          style={{ backgroundColor: "#F1F5F9", width: "90%" }}
        />
      </div>
    </div>
  );
}

function EmptyMenu() {
  return (
    <div
      className="rounded-2xl py-16 px-6 text-center max-w-xl mx-auto"
      style={{
        backgroundColor: "#FFF7EC",
        border: "1.5px dashed rgba(255, 182, 39, 0.35)",
      }}
    >
      <p className="font-semibold text-lg" style={{ color: "#1A1A1A" }}>
        Menu coming soon
      </p>
      <p className="text-sm mt-1" style={{ color: "#4A4A4A" }}>
        The restaurant hasn't added any items yet. Check back soon.
      </p>
    </div>
  );
}
