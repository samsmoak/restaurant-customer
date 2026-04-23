import type { Metadata } from "next";
import CustomerSignupForm from "./CustomerSignupForm";

export const metadata: Metadata = {
  title: "Create Your Account",
};

export default function CustomerSignupPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-24 relative overflow-hidden"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 15% 15%, rgba(255, 182, 39, 0.2) 0%, transparent 45%), radial-gradient(circle at 85% 85%, rgba(62, 180, 137, 0.18) 0%, transparent 45%)",
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
          <p className="text-sm" style={{ color: "#4A4A4A" }}>
            A free Ember &amp; Forge account unlocks ordering, saved addresses,
            and order history.
          </p>
        </div>
        <CustomerSignupForm />
      </div>
    </main>
  );
}
