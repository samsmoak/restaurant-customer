import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Join Ember & Forge",
  description:
    "Create a customer account to order, save addresses, and track every meal.",
};

export default function JoinPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-24 relative overflow-hidden"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(255, 182, 39, 0.2) 0%, transparent 45%), radial-gradient(circle at 80% 80%, rgba(255, 90, 60, 0.18) 0%, transparent 45%)",
        }}
      />
      <div className="relative w-full max-w-xl">
        <div className="text-center mb-10">
          <p
            className="text-sm tracking-[0.3em] uppercase mb-3 font-semibold"
            style={{ color: "#FF5A3C" }}
          >
            Welcome to Ember &amp; Forge
          </p>
          <h1
            className="text-4xl md:text-5xl font-bold mb-3"
            style={{ fontFamily: "var(--font-playfair)", color: "#1A1A1A" }}
          >
            Create your{" "}
            <em
              className="italic"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #FFB627 0%, #FF5A3C 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              account
            </em>
          </h1>
          <p className="text-base md:text-lg" style={{ color: "#4A4A4A" }}>
            Order in minutes. Save addresses. Track every meal.
          </p>
        </div>

        <Link
          href="/join/customer"
          className="group relative block rounded-3xl p-8 overflow-hidden transition-transform hover:-translate-y-1"
          style={{
            backgroundColor: "#FFFFFF",
            border: "2px solid rgba(255, 90, 60, 0.2)",
            boxShadow: "0 16px 48px rgba(255, 90, 60, 0.12)",
          }}
        >
          <div
            className="absolute -right-10 -top-10 w-48 h-48 rounded-full opacity-25 blur-3xl"
            style={{ backgroundColor: "#FFB627" }}
          />
          <div
            className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full opacity-25 blur-3xl"
            style={{ backgroundColor: "#FF5A3C" }}
          />
          <div className="relative">
            <div
              className="inline-flex w-14 h-14 rounded-2xl items-center justify-center mb-5 text-2xl"
              style={{
                background:
                  "linear-gradient(135deg, #FFB627 0%, #FF5A3C 100%)",
                color: "#FFFFFF",
                boxShadow: "0 8px 20px rgba(255, 90, 60, 0.32)",
              }}
            >
              🍽️
            </div>
            <h2
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: "var(--font-playfair)", color: "#1A1A1A" }}
            >
              I&apos;m here to eat
            </h2>
            <p className="text-sm mb-5" style={{ color: "#4A4A4A" }}>
              Create a customer account to order, save delivery addresses, and
              track every meal you&apos;ve had with us.
            </p>
            <span
              className="inline-flex items-center gap-2 text-sm font-bold"
              style={{ color: "#FF5A3C" }}
            >
              Create customer account →
            </span>
          </div>
        </Link>

        <p className="text-center mt-8 text-sm" style={{ color: "#4A4A4A" }}>
          Already have an account?{" "}
          <Link
            href="/customer-login"
            className="underline font-semibold"
            style={{ color: "#FF5A3C" }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
