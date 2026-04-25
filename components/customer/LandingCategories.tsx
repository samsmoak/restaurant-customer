"use client";

import { motion } from "framer-motion";

type Category = {
  name: string;
  tagline: string;
  image: string;
};

const FEATURED: Category[] = [
  {
    name: "Starters",
    tagline: "Small plates, big flavor",
    image: "https://images.unsplash.com/photo-1541014741259-de529411b96a?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Mains",
    tagline: "The heart of every meal",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Sides",
    tagline: "Crispy, cheesy, comforting",
    image: "https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Desserts",
    tagline: "Happy ever afters",
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Drinks",
    tagline: "Sips to complete the story",
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1200&auto=format&fit=crop",
  },
];

export default function LandingCategories() {
  return (
    <section
      id="categories"
      className="relative py-24 px-6"
      style={{ backgroundColor: "#0A0805" }}
    >
      {/* Subtle gold radial glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(201,169,110,0.07) 0%, transparent 60%)",
      }} />

      <div className="relative max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <p
              className="text-xs tracking-[0.3em] uppercase mb-3"
              style={{ color: "#C9A96E", fontFamily: "var(--font-space-grotesk)" }}
            >
              The menu
            </p>
            <h2
              className="text-4xl md:text-6xl leading-tight"
              style={{ fontFamily: "var(--font-cormorant)", color: "#FFFFFF", fontWeight: 500 }}
            >
              What are you{" "}
              <em className="italic" style={{
                backgroundImage: "linear-gradient(105deg, #EDD07A 0%, #C9A96E 50%, #9A6E30 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                craving?
              </em>
            </h2>
          </div>
          <a
            href="/menu"
            className="inline-flex items-center gap-2 text-sm font-semibold self-start md:self-auto transition-all hover:gap-3"
            style={{ color: "#C9A96E", fontFamily: "var(--font-space-grotesk)" }}
          >
            Browse full menu →
          </a>
        </div>

        <div className="flex md:grid gap-4 overflow-x-auto md:overflow-visible md:grid-cols-5 snap-x snap-mandatory pb-4 md:pb-0">
          {FEATURED.map((cat, i) => (
            <motion.a
              key={cat.name}
              href={`/menu#${cat.name.toLowerCase()}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              whileHover={{ y: -6 }}
              className="group relative shrink-0 w-[72vw] md:w-auto aspect-3/4 overflow-hidden snap-start"
              style={{
                borderRadius: 8,
                border: "1px solid rgba(201,169,110,0.2)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-108"
                style={{ backgroundImage: `url(${cat.image})` }}
              />
              {/* Always-on dark gradient */}
              <div className="absolute inset-0" style={{
                background: "linear-gradient(180deg, rgba(0,0,0,0.1) 30%, rgba(10,8,5,0.85) 100%)",
              }} />
              {/* Gold shimmer on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                background: "linear-gradient(180deg, transparent 40%, rgba(201,169,110,0.22) 100%)",
              }} />

              {/* Number badge */}
              <div className="absolute top-3 left-3">
                <span
                  className="px-2 py-0.5 text-[10px] font-semibold tracking-[0.2em]"
                  style={{
                    color: "#C9A96E",
                    fontFamily: "var(--font-space-grotesk)",
                    border: "1px solid rgba(201,169,110,0.4)",
                    backgroundColor: "rgba(10,8,5,0.6)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Text */}
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3
                  className="text-2xl md:text-3xl mb-1"
                  style={{ fontFamily: "var(--font-playfair)", color: "#FFFFFF" }}
                >
                  {cat.name}
                </h3>
                <p className="text-xs tracking-wide" style={{
                  color: "rgba(255,255,255,0.55)",
                  fontFamily: "var(--font-space-grotesk)",
                }}>
                  {cat.tagline}
                </p>
              </div>

              {/* Gold hairline bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity" style={{
                background: "linear-gradient(to right, transparent, #C9A96E, transparent)",
              }} />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
