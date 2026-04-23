import type { Metadata } from "next";
import CustomerLoginForm from "./CustomerLoginForm";

export const metadata: Metadata = {
  title: "Sign In",
};

type SearchParams = Promise<{ next?: string }>;

export default async function CustomerLoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { next } = await searchParams;
  const gateMessage = next === "/checkout"
    ? "Sign in or create an account to complete your order."
    : null;

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-24 relative overflow-hidden"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(255, 90, 60, 0.18) 0%, transparent 45%), radial-gradient(circle at 80% 80%, rgba(124, 58, 237, 0.15) 0%, transparent 45%)",
        }}
      />
      <div
        className="relative w-full max-w-md rounded-3xl p-8"
        style={{
          backgroundColor: "#FFFFFF",
          border: "2px solid rgba(255, 90, 60, 0.18)",
          boxShadow: "0 20px 60px rgba(17, 17, 17, 0.08)",
        }}
      >
        <div className="text-center mb-6">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: "var(--font-playfair)", color: "#1A1A1A" }}
          >
            Welcome{" "}
            <em
              className="italic"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #FFB627 0%, #FF5A3C 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              back
            </em>
          </h1>
          <p className="text-sm" style={{ color: "#4A4A4A" }}>
            Sign in to your Ember &amp; Forge account.
          </p>
          {gateMessage && (
            <div
              className="mt-4 text-sm px-3 py-2 rounded-lg"
              style={{
                backgroundColor: "rgba(255, 182, 39, 0.12)",
                color: "#A16207",
                border: "1px solid rgba(255, 182, 39, 0.4)",
              }}
            >
              {gateMessage}
            </div>
          )}
        </div>
        <CustomerLoginForm />
      </div>
    </main>
  );
}
