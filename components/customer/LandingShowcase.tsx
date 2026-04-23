"use client";

import { motion } from "framer-motion";

type Dish = {
  name: string;
  description: string;
  price: string;
  image: string;
  accent: string;
};

const DISHES: Dish[] = [
  {
    name: "Smoked Short Rib Ragù",
    description:
      "Twelve-hour braised short rib over hand-rolled pappardelle, finished with aged pecorino and a whisper of rosemary smoke.",
    price: "$28",
    image:
      "https://images.unsplash.com/photo-1432139509613-5c4255815697?q=80&w=1400&auto=format&fit=crop",
    accent: "#FF5A3C",
  },
  {
    name: "Charred Miso Salmon",
    description:
      "Wild-caught salmon lacquered in white miso, seared over open flame, served on ginger-scented jasmine rice with blistered shishitos.",
    price: "$32",
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=1400&auto=format&fit=crop",
    accent: "#3EB489",
  },
  {
    name: "Truffle & Honey Pizza",
    description:
      "Wood-fired sourdough crust, fior di latte, wild mushrooms, shaved black truffle, and a drizzle of chili honey.",
    price: "$24",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1400&auto=format&fit=crop",
    accent: "#FFB627",
  },
];

export default function LandingShowcase() {
  return (
    <section
      className="relative py-28 px-6 overflow-hidden"
      style={{ backgroundColor: "#FFF7EC" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(255, 182, 39, 0.25) 0%, transparent 55%)",
        }}
      />
      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p
            className="text-xs tracking-[0.3em] uppercase mb-3"
            style={{ color: "#FF5A3C" }}
          >
            From the kitchen
          </p>
          <h2
            className="text-4xl md:text-6xl"
            style={{
              fontFamily: "var(--font-cormorant)",
              color: "#1A1A1A",
              fontWeight: 500,
            }}
          >
            Tonight&apos;s{" "}
            <em
              className="italic"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #FFB627 0%, #FF5A3C 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              favorites
            </em>
          </h2>
        </div>

        <div className="space-y-24">
          {DISHES.map((dish, i) => {
            const reversed = i % 2 === 1;
            return (
              <motion.article
                key={dish.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`grid md:grid-cols-2 gap-8 md:gap-14 items-center ${
                  reversed ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div
                  className="relative aspect-4/3 rounded-3xl overflow-hidden"
                  style={{
                    border: `3px solid ${dish.accent}`,
                    boxShadow: `0 20px 50px ${dish.accent}30`,
                  }}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${dish.image})` }}
                  />
                </div>
                <div>
                  <span
                    className="inline-block px-3 py-1 rounded-full text-[10px] tracking-[0.25em] uppercase mb-4 font-bold"
                    style={{
                      backgroundColor: dish.accent,
                      color: "#FFFFFF",
                      fontFamily: "var(--font-space-grotesk)",
                    }}
                  >
                    No. {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3
                    className="text-3xl md:text-5xl leading-tight mb-4"
                    style={{
                      fontFamily: "var(--font-playfair)",
                      color: "#1A1A1A",
                    }}
                  >
                    {dish.name}
                  </h3>
                  <p
                    className="text-base md:text-lg mb-6 leading-relaxed"
                    style={{ color: "#4A4A4A" }}
                  >
                    {dish.description}
                  </p>
                  <div className="flex items-center gap-5 flex-wrap">
                    <span
                      className="text-3xl font-bold"
                      style={{
                        fontFamily: "var(--font-space-grotesk)",
                        color: dish.accent,
                      }}
                    >
                      {dish.price}
                    </span>
                    <a
                      href="/menu"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:scale-[1.04]"
                      style={{
                        backgroundColor: dish.accent,
                        color: "#FFFFFF",
                        boxShadow: `0 8px 24px ${dish.accent}40`,
                      }}
                    >
                      Add to order →
                    </a>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
