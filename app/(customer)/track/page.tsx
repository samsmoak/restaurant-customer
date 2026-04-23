export default function TrackPage() {
  return (
    <main className="min-h-screen pt-32 px-6 max-w-2xl mx-auto">
      <p
        className="text-sm tracking-[0.3em] uppercase mb-3 font-semibold"
        style={{ color: "#3EB489" }}
      >
        Where&apos;s my food?
      </p>
      <h1
        className="text-5xl font-bold mb-3"
        style={{ fontFamily: "var(--font-playfair)", color: "#1A1A1A" }}
      >
        Track your order
      </h1>
      <p style={{ color: "#4A4A4A" }} className="text-lg">
        Enter your order number to track its status in real time.
      </p>
    </main>
  );
}
