const ROW1 = [
  "Free Delivery Over $35",
  "Fresh Daily",
  "Order Online",
  "Pickup Available",
];
const ROW2 = [
  "Est. 2020",
  "Premium Ingredients",
  "Fast Delivery",
  "Family Recipes",
];

export default function LandingMarquee() {
  return (
    <section
      className="relative py-5 overflow-hidden"
      style={{
        backgroundColor: "#FFF7EC",
        borderTop: "1px solid #F4E6D0",
        borderBottom: "1px solid #F4E6D0",
      }}
    >
      <div className="relative">
        <Row
          items={ROW1}
          accent="#FF5A3C"
          direction="left"
          className="py-3 text-sm md:text-base"
        />
      </div>
      <div className="relative">
        <Row
          items={ROW2}
          accent="#7C3AED"
          direction="right"
          className="py-3 text-sm md:text-base"
        />
      </div>
    </section>
  );
}

function Row({
  items,
  accent,
  direction,
  className,
}: {
  items: string[];
  accent: string;
  direction: "left" | "right";
  className?: string;
}) {
  const doubled = [...items, ...items];
  return (
    <div className={`flex w-full overflow-hidden whitespace-nowrap ${className ?? ""}`}>
      <div
        className={direction === "left" ? "marquee-left" : "marquee-right"}
        style={{
          display: "inline-flex",
          gap: "3rem",
          paddingRight: "3rem",
          fontFamily: "var(--font-space-grotesk)",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#1A1A1A",
          fontWeight: 600,
        }}
      >
        {doubled.map((label, i) => (
          <span key={`${label}-${i}`} className="inline-flex items-center gap-12">
            <span>{label}</span>
            <span style={{ color: accent, fontSize: "1.2em" }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
