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
    if (!token) { router.push("/customer-login?next=/profile"); return; }
    if (!profile && !loading) void fetchProfile();
  }, [hydrated, token, profile, loading, fetchProfile, router]);

  if (!profile) {
    return (
      <main className="min-h-screen pt-28 pb-24 px-6" style={{ backgroundColor: "#F5F7FA" }}>
        <p className="text-sm text-center" style={{ color: "#6B7280" }}>
          Loading your profile…
        </p>
      </main>
    );
  }

  const initials = profile.full_name
    ? profile.full_name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
    : (profile.email?.[0] ?? "U").toUpperCase();

  return (
    <main className="min-h-screen pt-28 pb-24" style={{ backgroundColor: "#F5F7FA" }}>
      <div className="px-6 max-w-3xl mx-auto">
        <p
          className="text-xs font-semibold uppercase tracking-[0.15em] mb-2"
          style={{ color: "#4A4A4A" }}
        >
          Account
        </p>

        {/* Profile header */}
        <div className="flex items-center gap-4 mb-8">
          <div
            className="flex items-center justify-center text-base font-bold shrink-0"
            style={{
              width: 52,
              height: 52,
              backgroundColor: "#0F2B4D",
              color: "#FFFFFF",
              borderRadius: 8,
            }}
          >
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1E1E1E" }}>
              {profile.full_name || "Your profile"}
            </h1>
            <p className="text-sm" style={{ color: "#6B7280" }}>{profile.email}</p>
          </div>
        </div>

        <ProfileForm profile={profile} />
      </div>
    </main>
  );
}
