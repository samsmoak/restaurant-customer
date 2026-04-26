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
      className="min-h-screen flex items-center justify-center px-4 py-24"
      style={{ backgroundColor: "#F5F7FA" }}
    >
      <div className="w-full max-w-xl">
        <div className="text-center mb-10">
          <p
            className="text-xs font-semibold tracking-[0.2em] uppercase mb-3"
            style={{ color: "#0F2B4D" }}
          >
            Welcome to Ember &amp; Forge
          </p>
          <h1
            className="text-4xl md:text-5xl font-bold mb-3"
            style={{ color: "#1A1A1A" }}
          >
            Create your{" "}
            <em
              className="italic"
              style={{
                backgroundImage: "linear-gradient(105deg, #1A4A8A 0%, #0F2B4D 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              account
            </em>
          </h1>
          <p className="text-base md:text-lg" style={{ color: "#6B7280" }}>
            Order in minutes. Save addresses. Track every meal.
          </p>
        </div>

        <Link
          href="/join/customer"
          className="group relative block rounded-2xl p-8 overflow-hidden transition-all hover:-translate-y-0.5"
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5E7EB",
            boxShadow: "0 4px 24px rgba(15,43,77,0.08)",
          }}
        >
          <div className="flex items-start gap-5">
            <div
              className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl"
              style={{ backgroundColor: "#F0F4FA", border: "1px solid rgba(15,43,77,0.15)" }}
            >
              🍽️
            </div>
            <div className="flex-1 min-w-0">
              <h2
                className="text-xl font-bold mb-1.5"
                style={{ color: "#1A1A1A" }}
              >
                I&apos;m here to eat
              </h2>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "#6B7280" }}>
                Create a customer account to order, save delivery addresses, and
                track every meal you&apos;ve had with us.
              </p>
              <span
                className="inline-flex items-center gap-1.5 text-sm font-semibold"
                style={{ color: "#0F2B4D" }}
              >
                Create customer account →
              </span>
            </div>
          </div>
        </Link>

        <p className="text-center mt-8 text-sm" style={{ color: "#6B7280" }}>
          Already have an account?{" "}
          <Link
            href="/customer-login"
            className="underline font-semibold"
            style={{ color: "#0F2B4D" }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
