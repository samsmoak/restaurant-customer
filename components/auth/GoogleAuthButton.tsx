"use client";

/**
 * Google sign-in button (customer side).
 *
 * Uses Google Identity Services (GIS) in-browser to obtain an ID token,
 * then forwards it to the Go backend `/api/auth/google`.
 *
 * Requires:
 *   - NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID set on the frontend
 *   - GOOGLE_OAUTH_CLIENT_ID set on the backend (same value; used for audience)
 *
 * If neither is set, the button renders disabled with a helpful message.
 */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useAuthStore } from "@/lib/stores/auth.store";
import { isApiError } from "@/lib/api/client";

type Props = { next: string; label?: string };

type GISCredentialResponse = { credential: string };

type GISGoogle = {
  accounts: {
    id: {
      initialize: (opts: {
        client_id: string;
        callback: (r: GISCredentialResponse) => void;
      }) => void;
      renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
      prompt: () => void;
    };
  };
};

declare global {
  // eslint-disable-next-line no-var
  var google: GISGoogle | undefined;
}

export default function GoogleAuthButton({
  next,
  label = "Continue with Google",
}: Props) {
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signInWithGoogle);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID?.trim() ?? "";

  useEffect(() => {
    if (!clientId || !ready) return;
    const g = globalThis.google;
    if (!g) return;

    g.accounts.id.initialize({
      client_id: clientId,
      callback: async (resp: GISCredentialResponse) => {
        if (!resp?.credential) return;
        setError(null);
        setLoading(true);
        try {
          await signIn(resp.credential);
          router.push(next);
          router.refresh();
        } catch (e) {
          setError(isApiError(e) ? e.error : "Google sign-in failed");
        } finally {
          setLoading(false);
        }
      },
    });

    if (buttonRef.current) {
      g.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        type: "standard",
        shape: "pill",
        text: label === "Sign up with Google" ? "signup_with" : "continue_with",
        logo_alignment: "left",
      });
    }
  }, [clientId, ready, label, next, router, signIn]);

  if (!clientId) {
    return (
      <button
        type="button"
        disabled
        title="NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID is not set"
        className="w-full py-3 rounded-full font-semibold text-sm opacity-60 cursor-not-allowed"
        style={{
          backgroundColor: "#FFFFFF",
          color: "#1A1A1A",
          border: "1.5px solid #ECECEC",
        }}
      >
        Google sign-in not configured
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
      />
      {error && (
        <div
          className="text-sm px-4 py-2.5 rounded-lg"
          style={{
            backgroundColor: "rgba(220, 38, 38, 0.08)",
            color: "#B91C1C",
            border: "1px solid rgba(220, 38, 38, 0.25)",
          }}
        >
          {error}
        </div>
      )}
      {loading && (
        <p className="text-xs text-center" style={{ color: "#4A4A4A" }}>
          Signing you in…
        </p>
      )}
      <div ref={buttonRef} className="flex justify-center" />
    </div>
  );
}
