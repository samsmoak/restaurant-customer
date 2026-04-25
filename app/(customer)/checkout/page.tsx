"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useProfileStore } from "@/lib/stores/profile.store";
import { useAuthHydrated } from "@/lib/hooks/useAuthHydrated";
import CheckoutForm from "./CheckoutForm";

export default function CheckoutPage() {
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const token = useAuthStore((s) => s.token);
  const profile = useProfileStore((s) => s.profile);
  const fetchProfile = useProfileStore((s) => s.fetch);

  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      router.push("/customer-login?next=/checkout");
      return;
    }
    if (!profile) void fetchProfile();
  }, [hydrated, token, profile, fetchProfile, router]);

  if (!profile) {
    return (
      <main className="min-h-screen pt-28 pb-24 px-6" style={{ backgroundColor: "#F5F7FA" }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-sm" style={{ color: "#4A4A4A" }}>Loading checkout…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-28 pb-24 px-6" style={{ backgroundColor: "#F5F7FA" }}>
      <div className="max-w-5xl mx-auto">
        <p
          className="text-xs font-bold uppercase tracking-[0.2em] mb-1"
          style={{ color: "#4A4A4A" }}
        >
          Almost there
        </p>
        <h1 className="text-3xl font-bold mb-6" style={{ color: "#1E1E1E" }}>
          Checkout
        </h1>
        <CheckoutForm profile={profile} />
      </div>
    </main>
  );
}
