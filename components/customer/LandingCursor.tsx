"use client";

import { useEffect, useRef, useState } from "react";

export default function LandingCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    // Pointer detection: no-op on touch devices
    const hasFinePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;
    if (!hasFinePointer) return;

    document.body.classList.add("landing-cursor-active");

    let dotX = -100;
    let dotY = -100;
    let ringX = -100;
    let ringY = -100;

    const onMove = (e: MouseEvent) => {
      dotX = e.clientX;
      dotY = e.clientY;

      const target = e.target as HTMLElement | null;
      const interactive = !!target?.closest(
        "a,button,[role='button'],input,textarea,select"
      );
      setHovering(interactive);
    };

    const onLeave = () => {
      dotX = -100;
      dotY = -100;
    };

    let rafId: number;
    const tick = () => {
      ringX += (dotX - ringX) * 0.18;
      ringY += (dotY - ringY) * 0.18;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.body.classList.remove("landing-cursor-active");
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-9999 hidden md:block"
        style={{
          width: 6,
          height: 6,
          marginLeft: -3,
          marginTop: -3,
          borderRadius: "50%",
          backgroundColor: "#FF5A3C",
          transition: "width 0.15s, height 0.15s",
        }}
      />
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-9999 hidden md:block"
        style={{
          width: hovering ? 52 : 36,
          height: hovering ? 52 : 36,
          marginLeft: hovering ? -26 : -18,
          marginTop: hovering ? -26 : -18,
          borderRadius: "50%",
          border: `1.5px solid ${hovering ? "#7C3AED" : "rgba(255, 90, 60, 0.7)"}`,
          backgroundColor: hovering ? "rgba(124, 58, 237, 0.14)" : "transparent",
          transition:
            "width 0.2s ease, height 0.2s ease, margin 0.2s ease, border-color 0.2s ease, background-color 0.2s ease",
        }}
      />
    </>
  );
}
