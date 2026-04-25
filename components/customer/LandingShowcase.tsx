"use client";

import { motion } from "framer-motion";

type Dish = {
  name: string;
  description: string;
  price: string;
  image: string;
};

const DISHES: Dish[] = [
  {
    name: "Smoked Short Rib Ragù",
    description:
      "Twelve-hour braised short rib over hand-rolled pappardelle, finished with aged pecorino and a whisper of rosemary smoke.",
    price: "$28",
    image: "https://images.unsplash.com/photo-1432139509613-5c4255815697?q=80&w=1400&auto=format&fit=crop",
  },
  {
    name: "Charred Miso Salmon",
    description:
      "Wild-caught salmon lacquered in white miso, seared over open flame, served on ginger-scented jasmine rice with blistered shishitos.",
    price: "$32",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=1400&auto=format&fit=crop",
  },
  {
    name: "Truffle & Honey Pizza",
    description:
      "Wood-fired sourdough crust, fior di latte, wild mushrooms, shaved black truffle, and a drizzle of chili honey.",
    price: "$24",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1400&auto=format&fit=crop",
  },
];

export default function LandingShowcase() {
  return (
    <section
      className="relative py-28 px-6 overflow-hidden"
      style={{ backgroundColor: "#0D0B08" }}
    >
      {/* Subtle top separator glow */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{
        background: "linear-gradient(to right, transparent, rgba(201,169,110,0.25), transparent)",
      }} />

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p
            className="text-xs tracking-[0.3em] uppercase mb-3"
            style={{ color: "#C9A96E", fontFamily: "var(--font-space-grotesk)" }}
          >
            From the kitchen
          </p>
          <h2
            className="text-4xl md:text-6xl"
            style={{ fontFamily: "var(--font-cormorant)", color: "#FFFFFF", fontWeight: 500 }}
          >
            Tonight&apos;s{" "}
            <em className="italic" style={{
              backgroundImage: "linear-gradient(105deg, #EDD07A 0%, #C9A96E 50%, #9A6E30 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              favorites
            </em>
          </h2>
        </div>

        <div className="space-y-20">
          {DISHES.map((dish, i) => {
            const reversed = i % 2 === 1;
            return (
              <motion.article
                key={dish.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`grid md:grid-cols-2 gap-8 md:gap-16 items-center ${
                  reversed ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                {/* Image */}
                <div
                  className="relative aspect-4/3 overflow-hidden"
                  style={{
                    borderRadius: 8,
                    border: "1px solid rgba(201,169,110,0.2)",
                    boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
                  }}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${dish.image})` }}
                  />
                  {/* Gold corner accent */}
                  <div className="absolute top-0 left-0 w-12 h-12 pointer-events-none" style={{
                    background: "linear-gradient(135deg, rgba(201,169,110,0.3) 0%, transparent 60%)",
                  }} />
                </div>

                {/* Text */}
                <div>
                  <span
                    className="inline-block text-[10px] tracking-[0.28em] uppercase mb-5 font-semibold"
                    style={{
                      color: "#C9A96E",
                      fontFamily: "var(--font-space-grotesk)",
                      borderBottom: "1px solid rgba(201,169,110,0.35)",
                      paddingBottom: "0.4rem",
                    }}
                  >
                    No. {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3
                    className="text-3xl md:text-5xl leading-tight mb-4"
                    style={{ fontFamily: "var(--font-playfair)", color: "#FFFFFF" }}
                  >
                    {dish.name}
                  </h3>
                  <p
                    className="text-base leading-relaxed mb-8"
                    style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-space-grotesk)" }}
                  >
                    {dish.description}
                  </p>
                  <div className="flex items-center gap-5 flex-wrap">
                    <span
                      className="text-3xl font-bold"
                      style={{
                        fontFamily: "var(--font-playfair)",
                        backgroundImage: "linear-gradient(105deg, #EDD07A 0%, #C9A96E 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {dish.price}
                    </span>
                    <a
                      href="/menu"
                      className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all hover:scale-[1.04]"
                      style={{
                        background: "linear-gradient(135deg, #D4AA6A 0%, #9A6E30 100%)",
                        color: "#FFF8EE",
                        borderRadius: 4,
                        boxShadow: "0 8px 24px rgba(154,110,48,0.35)",
                        fontFamily: "var(--font-space-grotesk)",
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
