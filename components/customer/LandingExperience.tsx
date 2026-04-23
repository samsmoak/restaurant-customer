"use client";

import { motion } from "framer-motion";
import { Sparkles, Clock3, HeartHandshake } from "lucide-react";

type Feature = {
  title: string;
  body: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accent: string;
  tint: string;
};

const FEATURES: Feature[] = [
  {
    title: "Crafted with care",
    body: "Every plate begins at 5am with a trip to the market. Local farms, sustainable fisheries, and produce you can trace back to a name — not a barcode.",
    icon: Sparkles,
    accent: "#FFB627",
    tint: "#FFF7EC",
  },
  {
    title: "Fast. Always.",
    body: "Pickup ready in 20 minutes. Delivery in 45 or less. We honor the clock — because great food should arrive while it's still great.",
    icon: Clock3,
    accent: "#FF5A3C",
    tint: "#FFF0EC",
  },
  {
    title: "Made for you",
    body: "Allergies, swaps, extras, notes for the chef — tell us how you eat. We build each order to your table, not ours.",
    icon: HeartHandshake,
    accent: "#3EB489",
    tint: "#F0FBF5",
  },
];

export default function LandingExperience() {
  return (
    <section className="py-28 px-6" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p
            className="text-xs tracking-[0.3em] uppercase mb-3"
            style={{ color: "#FF5A3C" }}
          >
            Why Ember &amp; Forge
          </p>
          <h2
            className="text-4xl md:text-6xl"
            style={{
              fontFamily: "var(--font-cormorant)",
              color: "#1A1A1A",
              fontWeight: 500,
            }}
          >
            Every meal, a small{" "}
            <em
              className="italic"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #FF5A3C 0%, #7C3AED 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              celebration.
            </em>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
              whileHover={{ y: -6 }}
              className="rounded-3xl p-8 h-full"
              style={{
                backgroundColor: feature.tint,
                border: `2px solid ${feature.accent}25`,
                boxShadow: "0 10px 30px rgba(17, 17, 17, 0.05)",
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{
                  background: `linear-gradient(135deg, ${feature.accent} 0%, ${feature.accent}cc 100%)`,
                  color: "#FFFFFF",
                  boxShadow: `0 8px 20px ${feature.accent}40`,
                }}
              >
                <feature.icon size={24} />
              </div>
              <h3
                className="text-2xl mb-3"
                style={{
                  fontFamily: "var(--font-playfair)",
                  color: "#1A1A1A",
                }}
              >
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#4A4A4A" }}>
                {feature.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
