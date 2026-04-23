"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth.store";
import { isApiError } from "@/lib/api/client";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import {
  customerLoginSchema,
  type CustomerLoginFormData,
} from "@/lib/utils/validators";

export default function CustomerLoginForm() {
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
  const oauthError = searchParams.get("error");

  const login = useAuthStore((s) => s.login);

  const [form, setForm] = useState<CustomerLoginFormData>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(oauthError);

  const update =
    <K extends keyof CustomerLoginFormData>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = customerLoginSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setLoading(true);
    try {
      await login({ email: parsed.data.email, password: parsed.data.password });
      router.push(next);
      router.refresh();
    } catch (e) {
      setError(isApiError(e) ? e.error : "An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
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
      )}

      <GoogleAuthButton next={next} />

      <OrDivider />

      <Field label="Email">
        <input
          type="email"
          value={form.email}
          onChange={update("email")}
          required
          autoComplete="email"
          className="light-input"
          placeholder="you@email.com"
        />
      </Field>

      <Field label="Password">
        <input
          type="password"
          value={form.password}
          onChange={update("password")}
          required
          autoComplete="current-password"
          className="light-input"
          placeholder="••••••••"
        />
      </Field>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-full font-bold text-sm transition-all disabled:opacity-50 hover:scale-[1.02]"
        style={{
          background: "linear-gradient(135deg, #FFB627 0%, #FF5A3C 100%)",
          color: "#FFFFFF",
          boxShadow: "0 8px 20px rgba(255, 90, 60, 0.3)",
        }}
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-xs text-center" style={{ color: "#4A4A4A" }}>
        New here?{" "}
        <Link
          href={`/join/customer?next=${encodeURIComponent(next)}`}
          className="underline font-semibold"
          style={{ color: "#FF5A3C" }}
        >
          Create an account
        </Link>
      </p>

      <style jsx>{`
        .light-input {
          width: 100%;
          padding: 0.7rem 1rem;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          outline: none;
          background-color: #ffffff;
          color: #1a1a1a;
          border: 1.5px solid #ececec;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .light-input:focus {
          border-color: #ff5a3c;
          box-shadow: 0 0 0 3px rgba(255, 90, 60, 0.12);
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
        style={{ color: "#1A1A1A" }}
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
      <div className="flex-1 h-px" style={{ background: "#ECECEC" }} />
      <span
        className="text-xs font-semibold tracking-[0.2em]"
        style={{ color: "#9CA3AF" }}
      >
        OR
      </span>
      <div className="flex-1 h-px" style={{ background: "#ECECEC" }} />
    </div>
  );
}
