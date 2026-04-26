import type { Metadata } from "next";
import CustomerSignupForm from "./CustomerSignupForm";

export const metadata: Metadata = {
  title: "Create Your Account",
};

export default function CustomerSignupPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-24"
      style={{ backgroundColor: "#F5F7FA" }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p
            className="text-xs font-semibold uppercase tracking-[0.2em] mb-3"
            style={{ color: "#0F2B4D" }}
          >
            Ember &amp; Forge
          </p>
          <h1
            className="text-4xl font-bold mb-2"
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
          <p className="text-sm" style={{ color: "#6B7280" }}>
            A free Ember &amp; Forge account unlocks ordering, saved addresses,
            and order history.
          </p>
        </div>

        <div
          className="p-8 rounded-2xl"
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5E7EB",
            boxShadow: "0 4px 24px rgba(15,43,77,0.08)",
          }}
        >
          <CustomerSignupForm />
        </div>
      </div>
    </main>
  );
}
