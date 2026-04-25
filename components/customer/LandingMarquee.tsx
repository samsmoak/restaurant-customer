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
      className="relative py-4 overflow-hidden"
      style={{
        backgroundColor: "#0D0B08",
        borderTop: "1px solid rgba(201,169,110,0.15)",
        borderBottom: "1px solid rgba(201,169,110,0.15)",
      }}
    >
      <Row items={ROW1} direction="left" className="py-2.5 text-sm" />
      <Row items={ROW2} direction="right" className="py-2.5 text-sm" />
    </section>
  );
}

function Row({
  items,
  direction,
  className,
}: {
  items: string[];
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
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.55)",
          fontWeight: 500,
          fontSize: "0.72rem",
        }}
      >
        {doubled.map((label, i) => (
          <span key={`${label}-${i}`} className="inline-flex items-center gap-12">
            <span>{label}</span>
            <span style={{ color: "#C9A96E", fontSize: "0.8em", opacity: 0.8 }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
