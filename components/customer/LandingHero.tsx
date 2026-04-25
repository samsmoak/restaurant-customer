"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, type TargetAndTransition } from "framer-motion";
import { ChevronDown } from "lucide-react";
import RestaurantStatusLive from "./RestaurantStatusLive";

// ── Slides ────────────────────────────────────────────────────────────────────

const SLIDES = [
  {
    url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=90&fit=crop",
    alt: "Elegant restaurant interior with warm amber lighting",
    label: "The Dining Room",
  },
  {
    url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=90&fit=crop",
    alt: "Intimate restaurant atmosphere with candlelit tables",
    label: "The Experience",
  },
  {
    url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=90&fit=crop",
    alt: "Beautifully arranged artisan dishes",
    label: "The Craft",
  },
  {
    url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&q=90&fit=crop",
    alt: "Fine dining table setting with wine glasses",
    label: "The Atmosphere",
  },
  {
    url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=1920&q=90&fit=crop",
    alt: "Signature plated cuisine under warm light",
    label: "The Cuisine",
  },
];

const INTERVAL_MS = 5500;
const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];
const DUR = 0.92;

// ── Responsive geometry ───────────────────────────────────────────────────────
//
//  Cards are inset from ALL four sides so the dark background frames them
//  like physical photographs on a dark surface.
//
//  Mobile  : cards fill ~55% of viewport height, positioned in the bottom
//            half. One peek card visible on the right edge.
//  Desktop : cards fill most of the right panel (36–100%), with clear top/
//            bottom margins. Two peek cards fan out on the right.

type Geo = {
  /** top inset (px) — dark strip above the deck */
  cardTop: number;
  /** bottom inset (px) — dark strip below the deck (above progress bar) */
  cardBottom: number;
  /** left inset (px) within the deck container */
  cardLeft: number;
  /** right inset (px) — reserved zone for peek strips */
  inset: number;
  p1x: number; p1y: number;
  p2x: number; p2y: number;
  showPeek2: boolean;
};

const GEO_MOBILE: Geo = {
  cardTop: 0,    // no top inset on mobile — cards start right below text area
  cardBottom: 24,
  cardLeft: 12,
  inset: 52,
  p1x: 24, p1y: -6,
  p2x: 0,  p2y: 0,
  showPeek2: false,
};

const GEO_DESKTOP: Geo = {
  cardTop: 72,    // ~10vh at 720px — visible dark strip above cards
  cardBottom: 60,
  cardLeft: 0,
  inset: 96,
  p1x: 42, p1y: -10,
  p2x: 84, p2y: -20,
  showPeek2: true,
};

// ── Card state machine ────────────────────────────────────────────────────────

type Role = "active" | "peek1" | "peek2" | "exiting";
type Card = { key: number; slideIdx: number; role: Role };

const ROLE_Z: Record<Role, number> = { exiting: 3, active: 2, peek1: 1, peek2: 0 };
const ROLE_SHADOW: Record<Role, string> = {
  active:  "0 24px 72px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.06)",
  peek1:   "10px 20px 50px rgba(0,0,0,0.65)",
  peek2:   "14px 20px 40px rgba(0,0,0,0.5)",
  exiting: "none",
};

function initCards(): Card[] {
  return [
    { key: 2, slideIdx: 2 % SLIDES.length, role: "peek2"  },
    { key: 1, slideIdx: 1 % SLIDES.length, role: "peek1"  },
    { key: 0, slideIdx: 0,                 role: "active" },
  ];
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function LandingHero() {
  const [cards, setCards]     = useState<Card[]>(initCards);
  const [current, setCurrent] = useState(0);
  const keyRef                = useRef(SLIDES.length);

  const [isMobile, setIsMobile] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    setIsMobile(mq.matches);
    const h = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  const geo = isMobile ? GEO_MOBILE : GEO_DESKTOP;

  const roleAnim = useMemo((): Record<Role, TargetAndTransition> => ({
    active: {
      x: 0, y: 0, rotate: 0, scale: 1, opacity: 1,
      transition: { duration: DUR, ease: EASE },
    },
    peek1: {
      x: geo.p1x, y: geo.p1y, rotate: 3.5, scale: 0.972, opacity: 0.78,
      transition: { duration: DUR, ease: EASE },
    },
    peek2: {
      x: geo.p2x, y: geo.p2y, rotate: 7, scale: 0.944, opacity: 0.48,
      transition: { duration: DUR, ease: EASE },
    },
    exiting: {
      x: "-120%", y: 0, rotate: -6, scale: 0.88, opacity: 0,
      transition: { duration: DUR, ease: EASE },
    },
  }), [geo.p1x, geo.p1y, geo.p2x, geo.p2y]);

  const advance = useCallback(() => {
    const newKey      = keyRef.current++;
    const newSlideIdx = (current + 3) % SLIDES.length;
    setCards((prev) => {
      const updated = prev.map((c): Card => {
        if (c.role === "active") return { ...c, role: "exiting" };
        if (c.role === "peek1")  return { ...c, role: "active"  };
        if (c.role === "peek2")  return { ...c, role: "peek1"   };
        return c;
      });
      return [...updated, { key: newKey, slideIdx: newSlideIdx, role: "peek2" }];
    });
    setCurrent((c) => (c + 1) % SLIDES.length);
  }, [current]);

  const removeExiting = useCallback((key: number) => {
    setCards((prev) => prev.filter((c) => c.key !== key));
  }, []);

  const goTo = useCallback((idx: number) => {
    if (idx === current) return;
    const k = keyRef.current;
    keyRef.current += 3;
    setCards([
      { key: k + 2, slideIdx: (idx + 2) % SLIDES.length, role: "peek2"  },
      { key: k + 1, slideIdx: (idx + 1) % SLIDES.length, role: "peek1"  },
      { key: k,     slideIdx: idx,                         role: "active" },
    ]);
    setCurrent(idx);
  }, [current]);

  useEffect(() => {
    const t = setInterval(advance, INTERVAL_MS);
    return () => clearInterval(t);
  }, [advance]);

  const visibleCards = cards.filter((c) => geo.showPeek2 || c.role !== "peek2");

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: "100dvh", backgroundColor: "#0A0805" }}
    >

      {/* ── CSS keyframes ────────────────────────────────────────────── */}
      <style>{`
        @keyframes kenBurns {
          from { transform: scale(1.0) translate(0px, 0px); }
          to   { transform: scale(1.09) translate(-6px, -3px); }
        }
        @keyframes progressFill {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        /* rotate around the base, like a hand of cards */
        .deck-card { transform-origin: bottom center; }
      `}</style>

      {/* ── MOBILE layout: text stacked above the deck ───────────────── */}
      {/*
          Mobile splits the hero vertically:
            top 46%  → dark panel with all text content
            bottom 54% → card deck (all four sides of card visible)

          Desktop: deck is on the right panel (lg:left-[36%]),
                   text is absolutely positioned on the left.
      */}

      {/* Mobile text block — sits in natural flow, top of screen */}
      <div className="lg:hidden absolute top-0 left-0 right-0 z-20 flex flex-col justify-end pb-4"
           style={{ height: "46%" }}>
        <div className="px-6 sm:px-10 space-y-4">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <span
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs tracking-[0.22em] uppercase"
              style={{
                border: "1px solid rgba(201,169,110,0.4)",
                color: "#C9A96E",
                fontFamily: "var(--font-space-grotesk)",
                backgroundColor: "rgba(201,169,110,0.06)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#C9A96E" }} />
              Ember &amp; Forge &mdash; Est.&nbsp;2020
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="font-bold text-white leading-[0.88]"
            style={{ fontFamily: "var(--font-playfair)", fontSize: "clamp(2.6rem, 10vw, 3.8rem)" }}
          >
            Made to make
            <br />
            <em style={{
              backgroundImage: "linear-gradient(105deg, #EDD07A 0%, #C9A96E 45%, #9A6E30 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text", display: "inline-block",
            }}>
              you smile.
            </em>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="text-sm leading-relaxed max-w-xs"
            style={{ color: "rgba(255,255,255,0.48)", fontFamily: "var(--font-space-grotesk)" }}
          >
            Bright flavors. Fresh from the fire. Delivered warm — or ready when you walk in.
          </motion.p>

          {/* CTA + Status row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.75 }}
            className="flex items-center gap-4 flex-wrap"
          >
            <a
              href="/menu"
              className="font-semibold text-sm tracking-[0.07em]"
              style={{
                background: "linear-gradient(135deg, #D4AA6A 0%, #9A6E30 100%)",
                color: "#FFF8EE",
                padding: "0.75rem 1.75rem",
              }}
            >
              Order Now
            </a>
            <RestaurantStatusLive size="sm" />
          </motion.div>
        </div>
      </div>

      {/* ── Card deck ────────────────────────────────────────────────── */}
      {/*
          The deck container occupies:
            Mobile  : bottom 54% of viewport height, full width
            Desktop : full height, left=36%

          Cards inside are INSET from all four sides:
            top, bottom  → dark background frames the cards like photos
            left         → small inset on mobile; 0 on desktop (left panel is the frame)
            right        → reserved for peek strips
      */}
      <div
        className="absolute right-0 left-0 lg:top-0 lg:bottom-0 lg:left-[36%]"
        style={{
          zIndex: 1,
          overflow: "visible",
          // Mobile: deck in the bottom 54%
          top: isMobile ? "46%" : undefined,
          bottom: isMobile ? 0 : undefined,
        }}
      >
        {visibleCards.map((card) => (
          <motion.div
            key={card.key}
            className="deck-card"
            initial={card.role === "peek2"
              ? { x: geo.p2x + 64, y: geo.p2y - 8, rotate: 10, scale: 0.92, opacity: 0 }
              : card.role === "peek1" && !geo.showPeek2
              ? { x: geo.p1x + 40, y: geo.p1y - 6, rotate: 6,  scale: 0.94, opacity: 0 }
              : undefined}
            animate={roleAnim[card.role]}
            style={{
              position: "absolute",
              top: geo.cardTop,
              bottom: geo.cardBottom,
              left: geo.cardLeft,
              right: geo.inset,
              zIndex: ROLE_Z[card.role],
              borderRadius: 6,
              overflow: "hidden",
              boxShadow: ROLE_SHADOW[card.role],
              willChange: "transform",
            }}
            onAnimationComplete={() => {
              if (card.role === "exiting") removeExiting(card.key);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={SLIDES[card.slideIdx].url}
              alt={SLIDES[card.slideIdx].alt}
              className="w-full h-full object-cover"
              style={
                card.role === "active"
                  ? { animation: `kenBurns ${INTERVAL_MS}ms ease-out forwards` }
                  : undefined
              }
              draggable={false}
            />

            {/* Depth tint on peek cards */}
            {(card.role === "peek1" || card.role === "peek2") && (
              <div className="absolute inset-0 pointer-events-none"
                   style={{ backgroundColor: "rgba(10,8,5,0.38)" }} />
            )}

            {/* Slide label + counter on the active card (bottom-left corner) */}
            {card.role === "active" && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`card-lbl-${current}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.5, duration: 0.4 } }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  className="absolute bottom-3 left-3 right-3 flex items-end justify-between pointer-events-none"
                >
                  {/* Label */}
                  <span
                    className="px-2 py-1 text-xs tracking-[0.2em] uppercase"
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontFamily: "var(--font-space-grotesk)",
                      backgroundColor: "rgba(10,8,5,0.5)",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    {SLIDES[card.slideIdx].label}
                  </span>
                  {/* Counter */}
                  <span
                    className="px-2 py-1 text-xs tabular-nums"
                    style={{
                      color: "rgba(255,255,255,0.45)",
                      fontFamily: "var(--font-space-grotesk)",
                      backgroundColor: "rgba(10,8,5,0.5)",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    {String(current + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
                  </span>
                </motion.div>
              </AnimatePresence>
            )}

            {/* Gold hairline on active card's right edge */}
            {card.role === "active" && (
              <div className="absolute top-0 right-0 bottom-0 pointer-events-none" style={{
                width: 1,
                background: "linear-gradient(to bottom, transparent 8%, rgba(201,169,110,0.5) 28%, rgba(201,169,110,0.5) 72%, transparent 92%)",
              }} />
            )}
          </motion.div>
        ))}
      </div>

      {/* ── Desktop text panel (hidden on mobile) ────────────────────── */}
      <div
        className="hidden lg:flex absolute top-0 bottom-0 z-20 flex-col justify-center"
        style={{
          left: "clamp(1.5rem, 7vw, 6.5rem)",
          right: "62%",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="mb-8"
        >
          <span
            className="inline-flex items-center gap-2.5 px-4 py-2 text-xs tracking-[0.28em] uppercase whitespace-nowrap"
            style={{
              border: "1px solid rgba(201,169,110,0.45)",
              color: "#C9A96E",
              fontFamily: "var(--font-space-grotesk)",
              backdropFilter: "blur(6px)",
              backgroundColor: "rgba(201,169,110,0.06)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#C9A96E" }} />
            Ember &amp; Forge &mdash; Est.&nbsp;2020
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 56 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.05, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="font-bold text-white leading-[0.9]"
          style={{ fontFamily: "var(--font-playfair)", fontSize: "clamp(3rem, 5.5vw, 6rem)" }}
        >
          Made to make
          <br />
          <em style={{
            backgroundImage: "linear-gradient(105deg, #EDD07A 0%, #C9A96E 45%, #9A6E30 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text", display: "inline-block",
          }}>
            you smile.
          </em>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.72 }}
          className="mt-6 text-sm leading-relaxed max-w-xs"
          style={{ color: "rgba(255,255,255,0.48)", fontFamily: "var(--font-space-grotesk)" }}
        >
          Bright flavors. Fresh from the fire.
          <br />
          Delivered warm &mdash; or ready when you walk in.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.95 }}
          className="mt-9"
        >
          <a
            href="/menu"
            className="inline-block font-semibold text-sm tracking-[0.07em] transition-all hover:scale-[1.03] active:scale-100"
            style={{
              background: "linear-gradient(135deg, #D4AA6A 0%, #9A6E30 100%)",
              color: "#FFF8EE",
              padding: "0.9rem 2.25rem",
            }}
          >
            Order Now
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.7 }}
          className="mt-8"
        >
          <RestaurantStatusLive />
        </motion.div>
      </div>

      {/* ── Background gradient (desktop left panel fill) ─────────────── */}
      {/* Keeps the left panel dark on desktop without needing a separate element */}
      <div
        className="absolute inset-0 pointer-events-none hidden lg:block"
        style={{
          zIndex: 10,
          background:
            "linear-gradient(to right, rgba(10,8,5,0.98) 0%, rgba(10,8,5,0.92) 22%, rgba(10,8,5,0.6) 36%, rgba(10,8,5,0.1) 50%, transparent 65%)",
        }}
      />
      {/* Bottom vignette (both mobile and desktop) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 10,
          background: "linear-gradient(to top, rgba(10,8,5,0.7) 0%, transparent 22%)",
        }}
      />

      {/* ── Progress bars ─────────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 z-30 flex" style={{ height: 3 }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goTo(i)}
            className="relative flex-1 overflow-hidden"
            style={{ backgroundColor: "rgba(255,255,255,0.12)", border: "none", padding: 0, cursor: "pointer" }}
          >
            {i < current && (
              <div className="absolute inset-0" style={{ backgroundColor: "#C9A96E" }} />
            )}
            {i === current && (
              <div
                key={`p-${current}`}
                className="absolute inset-0"
                style={{
                  backgroundColor: "#C9A96E",
                  transformOrigin: "left",
                  animation: `progressFill ${INTERVAL_MS}ms linear forwards`,
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Scroll hint ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.6 }}
        className="absolute z-20 flex flex-col items-center gap-1.5"
        style={{
          bottom: 14,
          left: isMobile ? "50%" : "18%",
          transform: "translateX(-50%)",
        }}
      >
        <div className="w-px h-6"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.28), transparent)" }} />
        <ChevronDown size={12} className="chevron-bounce" style={{ color: "rgba(255,255,255,0.26)" }} />
      </motion.div>

    </section>
  );
}
