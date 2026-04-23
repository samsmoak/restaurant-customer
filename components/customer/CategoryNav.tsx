"use client";

import type { Category } from "@/types";

export default function CategoryNav({
  categories,
}: {
  categories: Category[];
}) {
  if (categories.length === 0) return null;

  const handleClick = (id: string) => {
    const el = document.getElementById(`cat-${id}`);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <div
      className="sticky top-20 z-30 py-3 -mx-6 px-6 overflow-x-auto"
      style={{
        backgroundColor: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
      }}
    >
      <div className="flex gap-2 w-max">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => handleClick(c.id)}
            className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all hover:scale-105"
            style={{
              backgroundColor: "#FFFFFF",
              color: "#1A1A1A",
              border: "1.5px solid #ECECEC",
            }}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
