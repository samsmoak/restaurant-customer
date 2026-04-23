"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useProfileStore } from "@/lib/stores/profile.store";
import { useAuthHydrated } from "@/lib/hooks/useAuthHydrated";
import ProfileForm from "./ProfileForm";

export default function ProfilePage() {
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const token = useAuthStore((s) => s.token);
  const profile = useProfileStore((s) => s.profile);
  const loading = useProfileStore((s) => s.loading);
  const fetchProfile = useProfileStore((s) => s.fetch);

  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      router.push("/customer-login?next=/profile");
      return;
    }
    if (!profile && !loading) {
      void fetchProfile();
    }
  }, [hydrated, token, profile, loading, fetchProfile, router]);

  if (!profile) {
    return (
      <main className="min-h-screen pt-28 pb-24 px-6">
        <div className="max-w-xl mx-auto text-center" style={{ color: "#4A4A4A" }}>
          Loading your profile…
        </div>
      </main>
    );
  }

  const initials = profile.full_name
    ? profile.full_name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : (profile.email?.[0] ?? "U").toUpperCase();

  return (
    <main className="min-h-screen pt-28 pb-24 px-6">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-5 mb-12">
          <div
            className="rounded-full flex items-center justify-center text-2xl font-bold shrink-0"
            style={{
              width: 72,
              height: 72,
              background: "linear-gradient(135deg, #FFB627 0%, #FF5A3C 100%)",
              color: "#FFFFFF",
            }}
          >
            {initials}
          </div>
          <div>
            <h1
              className="text-2xl font-bold leading-tight"
              style={{ color: "#1A1A1A", fontFamily: "var(--font-playfair)" }}
            >
              {profile.full_name || "Your profile"}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "#9CA3AF" }}>
              {profile.email}
            </p>
          </div>
        </div>

        <p
          className="text-xs tracking-[0.25em] uppercase font-semibold mb-8"
          style={{ color: "#FF5A3C" }}
        >
          Account details
        </p>

        <ProfileForm profile={profile} />
      </div>
    </main>
  );
}
