"use client";

import { motion } from "framer-motion";
import { Sparkles, Clock3, HeartHandshake } from "lucide-react";

type Feature = {
  title: string;
  body: string;
  icon: React.ComponentType<{ size?: number }>;
};

const FEATURES: Feature[] = [
  {
    title: "Crafted with care",
    body: "Every plate begins at 5am with a trip to the market. Local farms, sustainable fisheries, and produce you can trace back to a name — not a barcode.",
    icon: Sparkles,
  },
  {
    title: "Fast. Always.",
    body: "Pickup ready in 20 minutes. Delivery in 45 or less. We honor the clock — because great food should arrive while it's still great.",
    icon: Clock3,
  },
  {
    title: "Made for you",
    body: "Allergies, swaps, extras, notes for the chef — tell us how you eat. We build each order to your table, not ours.",
    icon: HeartHandshake,
  },
];

export default function LandingExperience() {
  return (
    <section className="py-28 px-6" style={{ backgroundColor: "#0A0805" }}>
      {/* Top separator */}
      <div className="max-w-6xl mx-auto mb-16" style={{
        height: 1,
        background: "linear-gradient(to right, transparent, rgba(201,169,110,0.2), transparent)",
      }} />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p
            className="text-xs tracking-[0.3em] uppercase mb-3"
            style={{ color: "#C9A96E", fontFamily: "var(--font-space-grotesk)" }}
          >
            Why Ember &amp; Forge
          </p>
          <h2
            className="text-4xl md:text-6xl"
            style={{ fontFamily: "var(--font-cormorant)", color: "#FFFFFF", fontWeight: 500 }}
          >
            Every meal, a small{" "}
            <em className="italic" style={{
              backgroundImage: "linear-gradient(105deg, #EDD07A 0%, #C9A96E 50%, #9A6E30 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              celebration.
            </em>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
              whileHover={{ y: -5 }}
              className="rounded-none p-8"
              style={{
                backgroundColor: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(201,169,110,0.12)",
              }}
            >
              {/* Gold icon ring */}
              <div
                className="w-12 h-12 flex items-center justify-center mb-6"
                style={{
                  border: "1px solid rgba(201,169,110,0.35)",
                  color: "#C9A96E",
                  backgroundColor: "rgba(201,169,110,0.06)",
                }}
              >
                <feature.icon size={20} />
              </div>

              {/* Gold rule */}
              <div className="w-8 h-px mb-5" style={{ backgroundColor: "#C9A96E", opacity: 0.5 }} />

              <h3
                className="text-2xl mb-3"
                style={{ fontFamily: "var(--font-playfair)", color: "#FFFFFF" }}
              >
                {feature.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.48)", fontFamily: "var(--font-space-grotesk)" }}
              >
                {feature.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
