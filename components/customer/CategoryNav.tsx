"use client";

import { useEffect, useRef, useState } from "react";
import type { Category } from "@/types";

export default function CategoryNav({
  categories,
  onSelect,
}: {
  categories: Category[];
  onSelect?: (id: string) => void;
}) {
  const [activeId, setActiveId] = useState<string>(categories[0]?.id ?? "");
  const pillsRef = useRef<HTMLDivElement>(null);

  // Track active category via IntersectionObserver
  useEffect(() => {
    if (categories.length === 0) return;
    const observers: IntersectionObserver[] = [];
    categories.forEach((c) => {
      const el = document.getElementById(`cat-${c.id}`);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(c.id); },
        { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [categories]);

  // Auto-scroll the pill strip to keep active pill centred
  useEffect(() => {
    const container = pillsRef.current;
    if (!container) return;
    const pill = container.querySelector<HTMLElement>(`[data-cat="${activeId}"]`);
    if (!pill) return;
    const left = pill.offsetLeft - container.offsetWidth / 2 + pill.offsetWidth / 2;
    container.scrollTo({ left, behavior: "smooth" });
  }, [activeId]);

  if (categories.length === 0) return null;

  const handleClick = (id: string) => {
    onSelect?.(id);
    const el = document.getElementById(`cat-${id}`);
    if (!el) return;
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - 120,
      behavior: "smooth",
    });
  };

  return (
    <div
      className="sticky top-13 z-30"
      style={{
        backgroundColor: "rgba(245,247,250,0.96)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid #E5E7EB",
      }}
    >
      <div
        ref={pillsRef}
        className="overflow-x-auto flex gap-2 px-6 py-3 justify-center"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((c) => {
          const active = activeId === c.id;
          return (
            <button
              key={c.id}
              data-cat={c.id}
              type="button"
              onClick={() => handleClick(c.id)}
              className="shrink-0 px-4 py-1.5 text-sm font-semibold whitespace-nowrap transition-all"
              style={
                active
                  ? { backgroundColor: "#0F2B4D", color: "#FFFFFF", borderRadius: 6, border: "1px solid #0F2B4D" }
                  : { backgroundColor: "#FFFFFF", color: "#4A4A4A", borderRadius: 6, border: "1px solid #E5E7EB" }
              }
            >
              {c.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
