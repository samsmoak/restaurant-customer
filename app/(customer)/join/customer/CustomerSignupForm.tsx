"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth.store";
import { authApi } from "@/lib/api/endpoints";
import { isApiError } from "@/lib/api/client";
import { toast } from "sonner";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import {
  customerSignupSchema,
  type CustomerSignupFormData,
} from "@/lib/utils/validators";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function looksLikeEmailExists(err: unknown): boolean {
  if (!isApiError(err)) return false;
  if (err.status === 409) return true;
  const msg = err.error.toLowerCase();
  return (
    msg.includes("already") ||
    msg.includes("exists") ||
    msg.includes("registered") ||
    msg.includes("duplicate")
  );
}

export default function CustomerSignupForm() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/menu";

  const signup = useAuthStore((s) => s.signup);

  const [form, setForm] = useState<CustomerSignupFormData>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailExists, setEmailExists] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [registeredAs, setRegisteredAs] = useState<"admin" | "customer" | null>(
    null
  );

  const emailInputRef = useRef<HTMLInputElement>(null);
  // Tracks the most recent in-flight check so older results can be discarded.
  const checkSeqRef = useRef(0);

  const update =
    <K extends keyof CustomerSignupFormData>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
      if (key === "email" && emailExists) {
        setEmailExists(false);
        setRegisteredAs(null);
      }
    };

  // Debounced background check while the user types. Mirrors the admin
  // onboarding wizard — 350ms after the last keystroke, call the anonymous
  // email-available endpoint and branch on `registered_as`.
  useEffect(() => {
    const trimmed = form.email.trim();
    const seq = ++checkSeqRef.current;
    const timer = window.setTimeout(async () => {
      if (seq !== checkSeqRef.current) return;
      if (!trimmed || !EMAIL_RE.test(trimmed)) {
        setEmailExists(false);
        setRegisteredAs(null);
        setEmailChecking(false);
        return;
      }
      setEmailChecking(true);
      try {
        const res = await authApi.checkEmailAvailable(trimmed);
        if (seq !== checkSeqRef.current) return;
        setEmailExists(!res.available);
        setRegisteredAs(res.registered_as ?? null);
      } catch {
        // Endpoint missing or network blip — submit-time 409 catch is the safety net.
      } finally {
        if (seq === checkSeqRef.current) setEmailChecking(false);
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [form.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = customerSignupSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setLoading(true);
    try {
      // Pre-flight: cheap, anonymous, no password sent. Best-effort — a missing
      // endpoint or network blip falls through to the real signup call.
      try {
        const res = await authApi.checkEmailAvailable(parsed.data.email);
        if (!res.available) {
          setEmailExists(true);
          setRegisteredAs(res.registered_as ?? null);
          setLoading(false);
          emailInputRef.current?.focus();
          return;
        }
      } catch {
        /* swallow — handled by submit-time 409 catch below */
      }

      await signup({
        full_name: parsed.data.fullName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        password: parsed.data.password,
      });
      toast.success("Welcome to Ember & Forge!");
      router.push(next);
      router.refresh();
    } catch (e) {
      if (looksLikeEmailExists(e)) {
        setEmailExists(true);
        // Backend 409 doesn't carry registered_as — leave as whatever the
        // debounced check last set (null is fine: the fallback copy covers it).
        emailInputRef.current?.focus();
      } else {
        setError(isApiError(e) ? e.error : "An unexpected error occurred");
      }
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {emailExists ? (
        <div
          className="text-sm px-4 py-3 rounded-lg"
          style={{
            backgroundColor: "rgba(220, 38, 38, 0.08)",
            color: "#B91C1C",
            border: "1px solid rgba(220, 38, 38, 0.25)",
          }}
        >
          {registeredAs === "admin" ? (
            <p className="font-medium">
              This email is registered as a restaurant admin account. Please
              use a different email to order as a customer.
            </p>
          ) : (
            <p className="font-medium">
              An account with this email already exists.{" "}
              <Link
                href={`/customer-login?next=${encodeURIComponent(next)}`}
                className="underline font-semibold"
                style={{ color: "#B91C1C" }}
              >
                Sign in instead →
              </Link>
            </p>
          )}
        </div>
      ) : error ? (
        <div
          className="text-sm px-4 py-3 rounded-lg"
          style={{
            backgroundColor: "rgba(220, 38, 38, 0.08)",
            color: "#B91C1C",
            border: "1px solid rgba(220, 38, 38, 0.25)",
          }}
        >
          {error}
        </div>
      ) : null}

      <GoogleAuthButton next={next} label="Sign up with Google" />

      <OrDivider />

      <Field label="Full name">
        <input
          type="text"
          value={form.fullName}
          onChange={update("fullName")}
          required
          autoComplete="name"
          className="light-input"
          placeholder="Alex Rivera"
        />
      </Field>

      <Field label="Email">
        <div className="relative">
          <input
            ref={emailInputRef}
            type="email"
            value={form.email}
            onChange={update("email")}
            required
            autoComplete="email"
            className="light-input"
            placeholder="you@email.com"
            aria-invalid={emailExists}
            style={emailExists ? { borderColor: "#DC2626" } : undefined}
          />
          {emailChecking && (
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: "#9CA3AF" }}
              aria-hidden
            >
              Checking…
            </span>
          )}
        </div>
      </Field>

      <Field label="Phone">
        <input
          type="tel"
          value={form.phone}
          onChange={update("phone")}
          required
          autoComplete="tel"
          className="light-input"
          placeholder="(555) 123-4567"
        />
      </Field>

      <Field label="Password (8+ chars)">
        <input
          type="password"
          value={form.password}
          onChange={update("password")}
          required
          autoComplete="new-password"
          minLength={8}
          className="light-input"
          placeholder="••••••••"
        />
      </Field>

      <button
        type="submit"
        disabled={loading || emailExists}
        className="w-full py-3 rounded-lg font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
        style={{
          backgroundColor: "#0F2B4D",
          color: "#FFFFFF",
        }}
      >
        {loading ? "Creating account..." : "Create account"}
      </button>

      <p className="text-xs text-center" style={{ color: "#4A4A4A" }}>
        Already have an account?{" "}
        <Link
          href={`/customer-login?next=${encodeURIComponent(next)}`}
          className="underline font-semibold"
          style={{ color: "#0F2B4D" }}
        >
          Sign in
        </Link>
      </p>

      <style jsx>{`
        .light-input {
          width: 100%;
          padding: 0.7rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          outline: none;
          background-color: #ffffff;
          color: #1a1a1a;
          border: 1px solid #e5e7eb;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .light-input:focus {
          border-color: #0f2b4d;
          box-shadow: 0 0 0 3px rgba(15, 43, 77, 0.1);
        }
        .light-input::placeholder {
          color: #9ca3af;
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="block text-sm font-semibold mb-1.5"
        style={{ color: "#374151" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function OrDivider() {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px" style={{ background: "#E5E7EB" }} />
      <span
        className="text-xs font-semibold tracking-[0.2em]"
        style={{ color: "#9CA3AF" }}
      >
        OR
      </span>
      <div className="flex-1 h-px" style={{ background: "#E5E7EB" }} />
    </div>
  );
}
