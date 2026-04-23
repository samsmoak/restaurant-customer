"use client";

import { motion } from "framer-motion";
import { Phone } from "lucide-react";

export default function LandingFinalCTA() {
  return (
    <section
      className="relative py-28 px-6 overflow-hidden gradient-drift"
      style={{
        background: "var(--gradient-appetite)",
        backgroundSize: "200% 200%",
      }}
    >
      {/* Soft sunburst pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.18) 0%, transparent 60%)",
        }}
      />
      {/* Diagonal stripes */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #FFFFFF 0, #FFFFFF 2px, transparent 2px, transparent 18px)",
        }}
      />
      <div className="relative max-w-4xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs tracking-[0.3em] uppercase mb-4 font-semibold"
          style={{ color: "rgba(255, 255, 255, 0.85)" }}
        >
          Hungry yet?
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl mb-8"
          style={{
            fontFamily: "var(--font-playfair)",
            color: "#FFFFFF",
            lineHeight: 1.05,
            textShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
          }}
        >
          Ready to order?
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3 justify-center items-center"
        >
          <a
            href="/menu"
            className="px-9 py-4 rounded-full font-bold text-sm transition-transform hover:scale-[1.04]"
            style={{
              backgroundColor: "#FFFFFF",
              color: "#E63E22",
              boxShadow: "0 12px 32px rgba(0, 0, 0, 0.18)",
            }}
          >
            Order Now
          </a>
          <a
            href="tel:+15551234567"
            className="inline-flex items-center gap-2 px-9 py-4 rounded-full font-bold text-sm border-2 transition-colors hover:bg-white/15"
            style={{ borderColor: "#FFFFFF", color: "#FFFFFF" }}
          >
            <Phone size={16} />
            (555) 123-4567
          </a>
        </motion.div>
      </div>
    </section>
  );
}
