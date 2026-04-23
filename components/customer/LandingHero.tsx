"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import RestaurantStatusLive from "./RestaurantStatusLive";

const R3FCanvas = dynamic(() => import("@/components/three/R3FCanvas"), {
  ssr: false,
  loading: () => null,
});

const line1 = ["Made", "to", "make"];
const line2 = ["you", "smile."];

const wordVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: { delay: 0.12 * i, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function LandingHero() {
  return (
    <section
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      {/* Layered bright blobs */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 15% 20%, rgba(255, 182, 39, 0.35) 0%, transparent 45%), radial-gradient(circle at 85% 15%, rgba(255, 90, 60, 0.28) 0%, transparent 42%), radial-gradient(circle at 70% 85%, rgba(62, 180, 137, 0.22) 0%, transparent 50%), radial-gradient(circle at 20% 90%, rgba(124, 58, 237, 0.18) 0%, transparent 45%)",
        }}
      />

      {/* Fine dotted texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.4]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(26,26,26,0.05) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* Floating 3D layer */}
      <R3FCanvas />

      {/* Content */}
      <div className="relative z-10 max-w-5xl w-full px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-6"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs tracking-[0.3em] uppercase"
            style={{
              backgroundColor: "rgba(255, 90, 60, 0.08)",
              border: "1px solid rgba(255, 90, 60, 0.35)",
              color: "#E63E22",
              fontFamily: "var(--font-space-grotesk)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "#FF5A3C" }}
            />
            Ember &amp; Forge &mdash; Est. 2020
          </span>
        </motion.div>

        <h1
          className="font-bold tracking-tight leading-[0.95]"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          <span className="block text-5xl md:text-7xl lg:text-8xl">
            {line1.map((word, i) => (
              <motion.span
                key={word}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={wordVariants}
                className="inline-block mr-3"
                style={{ color: "#1A1A1A" }}
              >
                {word}
              </motion.span>
            ))}
          </span>
          <span className="block text-5xl md:text-7xl lg:text-8xl italic">
            {line2.map((word, i) => (
              <motion.span
                key={word}
                custom={i + line1.length}
                initial="hidden"
                animate="visible"
                variants={wordVariants}
                className="inline-block mr-3 gradient-drift"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #FFB627 0%, #FF5A3C 50%, #7C3AED 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {word}
              </motion.span>
            ))}
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-6 text-base md:text-lg max-w-xl mx-auto"
          style={{ color: "#4A4A4A" }}
        >
          Bright flavors. Fresh from the fire. Delivered warm — or ready when
          you walk in.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15, duration: 0.6 }}
          className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center"
        >
          <a
            href="/menu"
            className="landing-pulse px-8 py-3.5 rounded-full font-semibold text-sm transition-transform hover:scale-[1.03]"
            style={{
              background: "linear-gradient(135deg, #FFB627 0%, #FF5A3C 100%)",
              color: "#FFFFFF",
            }}
          >
            Order Now
          </a>
          <a
            href="/menu#categories"
            className="px-8 py-3.5 rounded-full font-semibold text-sm border-2 transition-colors"
            style={{
              borderColor: "#1A1A1A",
              color: "#1A1A1A",
              backgroundColor: "rgba(255, 255, 255, 0.7)",
            }}
          >
            View Menu
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="mt-10 flex justify-center"
        >
          <RestaurantStatusLive />
        </motion.div>
      </div>

      {/* Bottom scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <div
          className="h-10 w-px"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgba(255, 90, 60, 0.8), transparent)",
          }}
        />
        <ChevronDown
          size={18}
          className="chevron-bounce"
          style={{ color: "#FF5A3C" }}
        />
      </motion.div>
    </section>
  );
}
