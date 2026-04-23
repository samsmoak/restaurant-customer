"use client";

import { motion } from "framer-motion";

type Category = {
  name: string;
  tagline: string;
  image: string;
  accent: string;
};

const FEATURED: Category[] = [
  {
    name: "Starters",
    tagline: "Small plates, big flavor",
    image:
      "https://images.unsplash.com/photo-1541014741259-de529411b96a?q=80&w=1200&auto=format&fit=crop",
    accent: "#FF5A3C",
  },
  {
    name: "Mains",
    tagline: "The heart of every meal",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop",
    accent: "#FFB627",
  },
  {
    name: "Sides",
    tagline: "Crispy, cheesy, comforting",
    image:
      "https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=1200&auto=format&fit=crop",
    accent: "#3EB489",
  },
  {
    name: "Desserts",
    tagline: "Happy ever afters",
    image:
      "https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=1200&auto=format&fit=crop",
    accent: "#7C3AED",
  },
  {
    name: "Drinks",
    tagline: "Sips to complete the story",
    image:
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1200&auto=format&fit=crop",
    accent: "#3AB0E8",
  },
];

export default function LandingCategories() {
  return (
    <section
      id="categories"
      className="relative py-24 px-6"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <p
              className="text-xs tracking-[0.3em] uppercase mb-3"
              style={{ color: "#FF5A3C" }}
            >
              The menu
            </p>
            <h2
              className="text-4xl md:text-6xl leading-tight"
              style={{
                fontFamily: "var(--font-cormorant)",
                color: "#1A1A1A",
                fontWeight: 500,
              }}
            >
              What are you{" "}
              <em
                className="not-italic"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #FF5A3C 0%, #7C3AED 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontStyle: "italic",
                }}
              >
                craving?
              </em>
            </h2>
          </div>
          <a
            href="/menu"
            className="inline-flex items-center gap-2 text-sm font-semibold self-start md:self-auto transition-transform hover:translate-x-1"
            style={{ color: "#FF5A3C" }}
          >
            Browse full menu →
          </a>
        </div>

        <div className="flex md:grid gap-5 overflow-x-auto md:overflow-visible md:grid-cols-5 snap-x snap-mandatory pb-4 md:pb-0">
          {FEATURED.map((cat, i) => (
            <motion.a
              key={cat.name}
              href={`/menu#${cat.name.toLowerCase()}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              whileHover={{ y: -8 }}
              className="group relative shrink-0 w-[75vw] md:w-auto aspect-[3/4] rounded-3xl overflow-hidden snap-start"
              style={{
                border: `2px solid ${cat.accent}30`,
                boxShadow: "0 10px 30px rgba(17, 17, 17, 0.06)",
              }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${cat.image})` }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%)",
                }}
              />
              <div
                className="absolute inset-0 transition-opacity opacity-0 group-hover:opacity-100"
                style={{
                  background: `linear-gradient(180deg, transparent 0%, ${cat.accent}55 100%)`,
                }}
              />
              <div className="absolute top-4 left-4">
                <span
                  className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: cat.accent,
                    color: "#FFFFFF",
                    fontFamily: "var(--font-space-grotesk)",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5 z-10">
                <h3
                  className="text-2xl md:text-3xl mb-1"
                  style={{
                    fontFamily: "var(--font-playfair)",
                    color: "#FFFFFF",
                  }}
                >
                  {cat.name}
                </h3>
                <p className="text-xs" style={{ color: "#FFFFFF", opacity: 0.9 }}>
                  {cat.tagline}
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
