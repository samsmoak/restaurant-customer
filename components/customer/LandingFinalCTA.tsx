"use client";

import { motion } from "framer-motion";
import { Phone } from "lucide-react";

export default function LandingFinalCTA() {
  return (
    <section
      className="relative py-28 px-6 overflow-hidden"
      style={{ backgroundColor: "#0A0805" }}
    >
      {/* Gold radial glow — centred */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 50% 60%, rgba(201,169,110,0.1) 0%, transparent 65%)",
      }} />
      {/* Top hairline */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{
        background: "linear-gradient(to right, transparent, rgba(201,169,110,0.3), transparent)",
      }} />

      <div className="relative max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="inline-flex items-center gap-2.5 px-4 py-2 mb-8 text-xs tracking-[0.28em] uppercase"
          style={{
            border: "1px solid rgba(201,169,110,0.35)",
            color: "#C9A96E",
            fontFamily: "var(--font-space-grotesk)",
            backgroundColor: "rgba(201,169,110,0.06)",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#C9A96E" }} />
          Hungry yet?
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="font-bold text-white mb-6"
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "clamp(3rem, 7vw, 6rem)",
            lineHeight: 1.0,
          }}
        >
          Made to make
          <br />
          <em style={{
            backgroundImage: "linear-gradient(105deg, #EDD07A 0%, #C9A96E 45%, #9A6E30 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            display: "inline-block",
          }}>
            you smile.
          </em>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="text-sm leading-relaxed mb-10 max-w-sm mx-auto"
          style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-space-grotesk)" }}
        >
          Order online for delivery or walk-in pickup — fresh, fast, and exactly as you want it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="flex flex-col sm:flex-row gap-3 justify-center items-center"
        >
          <a
            href="/menu"
            className="px-9 py-4 font-semibold text-sm tracking-[0.06em] transition-all hover:scale-[1.03]"
            style={{
              background: "linear-gradient(135deg, #D4AA6A 0%, #9A6E30 100%)",
              color: "#FFF8EE",
              fontFamily: "var(--font-space-grotesk)",
              boxShadow: "0 12px 36px rgba(154,110,48,0.4)",
            }}
          >
            Order Now
          </a>
          <a
            href="tel:+15551234567"
            className="inline-flex items-center gap-2 px-9 py-4 font-semibold text-sm tracking-[0.06em] transition-all hover:bg-white/5"
            style={{
              border: "1px solid rgba(201,169,110,0.35)",
              color: "rgba(255,255,255,0.7)",
              fontFamily: "var(--font-space-grotesk)",
            }}
          >
            <Phone size={15} style={{ color: "#C9A96E" }} />
            (555) 123-4567
          </a>
        </motion.div>
      </div>
    </section>
  );
}
