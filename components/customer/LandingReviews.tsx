"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

type Review = {
  quote: string;
  name: string;
  detail: string;
};

const REVIEWS: Review[] = [
  {
    quote:
      "The short rib ragù was one of the best things I've eaten this year. It arrived hot, the pasta still bouncy. Already ordered again.",
    name: "Priya S.",
    detail: "Ordered delivery — 38 min",
  },
  {
    quote:
      "I called about a dairy swap three minutes before closing and they said yes. That's a real restaurant. The food was incredible too.",
    name: "Marcus T.",
    detail: "Regular since 2021",
  },
  {
    quote:
      "We do Friday pickup every week now. The staff know us, the pizza is still warm when I get home, and the honey drizzle is dangerous.",
    name: "The Okafors",
    detail: "52 orders this year",
  },
];

export default function LandingReviews() {
  return (
    <section className="py-24 px-6" style={{ backgroundColor: "#0D0B08" }}>
      {/* Top separator */}
      <div className="max-w-6xl mx-auto mb-14" style={{
        height: 1,
        background: "linear-gradient(to right, transparent, rgba(201,169,110,0.2), transparent)",
      }} />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p
            className="text-xs tracking-[0.3em] uppercase mb-3"
            style={{ color: "#C9A96E", fontFamily: "var(--font-space-grotesk)" }}
          >
            From our table to yours
          </p>
          <h2
            className="text-4xl md:text-5xl"
            style={{ fontFamily: "var(--font-cormorant)", color: "#FFFFFF", fontWeight: 500 }}
          >
            Loved by{" "}
            <em className="italic" style={{
              backgroundImage: "linear-gradient(105deg, #EDD07A 0%, #C9A96E 50%, #9A6E30 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              neighbors
            </em>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {REVIEWS.map((review, i) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ y: -4 }}
              className="relative p-7"
              style={{
                backgroundColor: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(201,169,110,0.12)",
              }}
            >
              {/* Gold opening quote */}
              <div
                className="text-5xl leading-none mb-4 select-none"
                style={{
                  fontFamily: "var(--font-cormorant)",
                  backgroundImage: "linear-gradient(135deg, #D4AA6A, #9A6E30)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                &ldquo;
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} size={13} fill="#C9A96E" style={{ color: "#C9A96E" }} />
                ))}
              </div>

              <p
                className="leading-relaxed mb-6"
                style={{
                  fontFamily: "var(--font-cormorant)",
                  color: "rgba(255,255,255,0.75)",
                  fontStyle: "italic",
                  fontSize: "1.1rem",
                }}
              >
                {review.quote}
              </p>

              {/* Thin gold rule */}
              <div className="w-full h-px mb-4" style={{ backgroundColor: "rgba(201,169,110,0.15)" }} />

              <div>
                <p className="text-sm font-semibold" style={{ color: "#FFFFFF", fontFamily: "var(--font-space-grotesk)" }}>
                  {review.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-space-grotesk)" }}>
                  {review.detail}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
