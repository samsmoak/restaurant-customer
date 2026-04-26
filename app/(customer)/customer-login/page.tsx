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
  const gateMessage =
    next === "/checkout"
      ? "Sign in or create an account to complete your order."
      : null;

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-24"
      style={{ backgroundColor: "#F5F7FA" }}
    >
      <div className="w-full max-w-md">
        {/* Header */}
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
            Welcome{" "}
            <em
              className="italic"
              style={{
                backgroundImage: "linear-gradient(105deg, #1A4A8A 0%, #0F2B4D 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              back
            </em>
          </h1>
          <p className="text-sm" style={{ color: "#6B7280" }}>
            Sign in to your account to continue.
          </p>
          {gateMessage && (
            <div
              className="mt-4 text-sm px-4 py-3 rounded-lg"
              style={{
                backgroundColor: "rgba(15,43,77,0.06)",
                color: "#0F2B4D",
                border: "1px solid rgba(15,43,77,0.2)",
              }}
            >
              {gateMessage}
            </div>
          )}
        </div>

        {/* Card */}
        <div
          className="p-8 rounded-2xl"
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5E7EB",
            boxShadow: "0 4px 24px rgba(15,43,77,0.08)",
          }}
        >
          <CustomerLoginForm />
        </div>
      </div>
    </main>
  );
}
