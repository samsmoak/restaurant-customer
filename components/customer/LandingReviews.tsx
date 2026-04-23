"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

type Review = {
  quote: string;
  name: string;
  detail: string;
  accent: string;
};

const REVIEWS: Review[] = [
  {
    quote:
      "The short rib ragù was one of the best things I've eaten this year. It arrived hot, the pasta still bouncy. Already ordered again.",
    name: "Priya S.",
    detail: "Ordered delivery — 38 min",
    accent: "#FF5A3C",
  },
  {
    quote:
      "I called about a dairy swap three minutes before closing and they said yes. That's a real restaurant. The food was incredible too.",
    name: "Marcus T.",
    detail: "Regular since 2021",
    accent: "#3EB489",
  },
  {
    quote:
      "We do Friday pickup every week now. The staff know us, the pizza is still warm when I get home, and the honey drizzle is dangerous.",
    name: "The Okafors",
    detail: "52 orders this year",
    accent: "#7C3AED",
  },
];

export default function LandingReviews() {
  return (
    <section className="py-24 px-6" style={{ backgroundColor: "#F0FBF5" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p
            className="text-xs tracking-[0.3em] uppercase mb-3"
            style={{ color: "#3EB489" }}
          >
            From our table to yours
          </p>
          <h2
            className="text-4xl md:text-5xl"
            style={{
              fontFamily: "var(--font-cormorant)",
              color: "#1A1A1A",
              fontWeight: 500,
            }}
          >
            Loved by{" "}
            <em
              className="italic"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #3EB489 0%, #FFB627 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
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
              className="relative rounded-3xl p-7"
              style={{
                backgroundColor: "#FFFFFF",
                border: `2px solid ${review.accent}20`,
                boxShadow: "0 12px 32px rgba(17, 17, 17, 0.06)",
              }}
            >
              <Quote
                size={36}
                className="absolute -top-3 left-6"
                style={{ color: review.accent, fill: review.accent }}
              />
              <div className="flex gap-1 mb-4 mt-3">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    size={16}
                    fill="#FFB627"
                    style={{ color: "#FFB627" }}
                  />
                ))}
              </div>
              <p
                className="text-base leading-relaxed mb-5"
                style={{
                  fontFamily: "var(--font-cormorant)",
                  color: "#1A1A1A",
                  fontStyle: "italic",
                  fontSize: "1.15rem",
                }}
              >
                &ldquo;{review.quote}&rdquo;
              </p>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>
                  {review.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
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
