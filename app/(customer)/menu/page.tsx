"use client";

import { useMemo, useRef, useState } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { useMenu } from "@/lib/hooks/useMenu";
import MenuItemCard from "@/components/customer/MenuItemCard";
import ItemDetailDialog from "@/components/customer/ItemDetailDialog";
import CategoryNav from "@/components/customer/CategoryNav";
import type { MenuItemWithRelations } from "@/types";

export default function MenuPage() {
  const { categories, loading } = useMenu();
  const [selected, setSelected] = useState<MenuItemWithRelations | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCatId, setFilterCatId] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const visibleCategories = useMemo(
    () => categories.filter((c) => c.items.length > 0),
    [categories]
  );

  // Apply search + category filter
  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return visibleCategories
      .filter((cat) => !filterCatId || cat.id === filterCatId)
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            !q ||
            item.name.toLowerCase().includes(q) ||
            item.description?.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [visibleCategories, filterCatId, searchQuery]);

  const isFiltered = !!searchQuery.trim() || !!filterCatId;

  const clearFilters = () => {
    setSearchQuery("");
    setFilterCatId("");
  };

  return (
    <main className="min-h-screen pb-24" style={{ backgroundColor: "#F5F7FA" }}>

      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="pt-28 pb-5 px-6 max-w-5xl mx-auto">
        <p
          className="text-xs font-semibold uppercase tracking-[0.15em] mb-1"
          style={{ color: "#4A4A4A" }}
        >
          The menu
        </p>
        <h1 className="text-3xl font-bold mb-5" style={{ color: "#1E1E1E" }}>
          What are you having today?
        </h1>

        {/* Search + Category dropdown */}
        <div className="flex gap-2.5">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "#9CA3AF" }}
            />
            <input
              ref={searchRef}
              type="search"
              placeholder="Search items…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                border: "1px solid #E5E7EB",
                borderRadius: 6,
                padding: "0.6rem 0.875rem 0.6rem 2.25rem",
                backgroundColor: "#FFFFFF",
                color: "#1E1E1E",
                fontSize: "0.875rem",
                outline: "none",
                fontFamily: "inherit",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#0F2B4D")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
          </div>

          {/* Category dropdown */}
          <div className="relative shrink-0">
            <select
              value={filterCatId}
              onChange={(e) => setFilterCatId(e.target.value)}
              style={{
                appearance: "none",
                WebkitAppearance: "none",
                border: filterCatId ? "1px solid #0F2B4D" : "1px solid #E5E7EB",
                borderRadius: 6,
                padding: "0.6rem 2.5rem 0.6rem 0.875rem",
                backgroundColor: filterCatId ? "#F0F4FA" : "#FFFFFF",
                color: filterCatId ? "#0F2B4D" : "#4A4A4A",
                fontSize: "0.875rem",
                fontWeight: 500,
                outline: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                minWidth: 160,
                transition: "border-color 0.15s",
              }}
            >
              <option value="">All categories</option>
              {visibleCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: filterCatId ? "#0F2B4D" : "#6B7280" }}
            />
          </div>

          {/* Clear filters */}
          {isFiltered && (
            <button
              type="button"
              onClick={clearFilters}
              className="shrink-0 px-3 flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70"
              style={{
                border: "1px solid #E5E7EB",
                borderRadius: 6,
                backgroundColor: "#FFFFFF",
                color: "#4A4A4A",
              }}
            >
              <X size={13} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Sticky horizontal category nav ──────────────────────── */}
      {!loading && visibleCategories.length > 0 && (
        <CategoryNav
          categories={visibleCategories}
          onSelect={(id) => setFilterCatId("")}
        />
      )}

      {/* ── Item grid ───────────────────────────────────────────── */}
      <div className="px-6 max-w-5xl mx-auto mt-6 space-y-10">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          isFiltered ? (
            <NoResults onClear={clearFilters} />
          ) : (
            <EmptyMenu />
          )
        ) : (
          filteredCategories.map((cat) => (
            <section key={cat.id} id={`cat-${cat.id}`}>
              {/* Category header */}
              <div className="flex items-baseline gap-3 mb-4">
                <h2 className="text-xl font-bold" style={{ color: "#1E1E1E" }}>
                  {cat.name}
                </h2>
                <span className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "#9CA3AF" }}>
                  {cat.items.length} item{cat.items.length !== 1 ? "s" : ""}
                </span>
              </div>
              {cat.description && (
                <p className="text-sm mb-4 max-w-xl leading-relaxed" style={{ color: "#6B7280" }}>
                  {cat.description}
                </p>
              )}

              {/* Cards grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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

// ---------------------------------------------------------------------------
// Skeleton loader — vertical card shape
// ---------------------------------------------------------------------------

function SkeletonCard() {
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      <div
        className="w-full animate-pulse"
        style={{ backgroundColor: "#F1F5F9", aspectRatio: "4/3" }}
      />
      <div className="p-3 space-y-2">
        <div
          className="h-3 rounded animate-pulse"
          style={{ backgroundColor: "#F1F5F9", width: "70%" }}
        />
        <div
          className="h-2.5 rounded animate-pulse"
          style={{ backgroundColor: "#F1F5F9", width: "90%" }}
        />
        <div
          className="h-2.5 rounded animate-pulse"
          style={{ backgroundColor: "#F1F5F9", width: "35%" }}
        />
      </div>
    </div>
  );
}

function NoResults({ onClear }: { onClear: () => void }) {
  return (
    <div
      className="py-14 px-6 text-center max-w-sm mx-auto"
      style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 10 }}
    >
      <p className="font-semibold text-base" style={{ color: "#1E1E1E" }}>
        No items found
      </p>
      <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
        Try a different search term or category.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-4 px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-80"
        style={{ backgroundColor: "#0F2B4D", color: "#FFFFFF", borderRadius: 6 }}
      >
        Clear filters
      </button>
    </div>
  );
}

function EmptyMenu() {
  return (
    <div
      className="py-16 px-6 text-center max-w-sm mx-auto"
      style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 10 }}
    >
      <p className="font-semibold text-base" style={{ color: "#1E1E1E" }}>
        Menu coming soon
      </p>
      <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
        The restaurant hasn&apos;t added any items yet.
      </p>
    </div>
  );
}
