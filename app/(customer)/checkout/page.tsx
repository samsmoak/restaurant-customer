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
      <main className="min-h-screen pt-28 px-6 max-w-2xl mx-auto pb-16">
        <p style={{ color: "#4A4A4A" }}>Loading checkout…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-28 px-6 max-w-2xl mx-auto pb-16">
      <p
        className="text-sm tracking-[0.3em] uppercase mb-3 font-semibold"
        style={{ color: "#FF5A3C" }}
      >
        Almost there
      </p>
      <h1
        className="text-5xl font-bold mb-3"
        style={{ fontFamily: "var(--font-playfair)", color: "#1A1A1A" }}
      >
        Checkout
      </h1>
      <p style={{ color: "#4A4A4A" }} className="text-lg mb-8">
        Tell us where it&apos;s going, then pay.
      </p>

      <CheckoutForm profile={profile} />
    </main>
  );
}
