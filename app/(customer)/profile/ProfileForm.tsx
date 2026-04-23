"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useProfileStore } from "@/lib/stores/profile.store";
import { isApiError } from "@/lib/api/client";
import type { GoCustomerProfile } from "@/lib/api/dto";

export default function ProfileForm({ profile }: { profile: GoCustomerProfile }) {
  const updateProfile = useProfileStore((s) => s.update);
  const [form, setForm] = useState({
    full_name: profile.full_name ?? "",
    phone: profile.phone ?? "",
    default_address: profile.default_address ?? "",
  });
  const [loading, setLoading] = useState(false);

  const update =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        default_address: form.default_address.trim(),
      });
      toast.success("Saved!");
    } catch (err) {
      toast.error(isApiError(err) ? err.error : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Row: name + phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FloatField label="Full name" htmlFor="full_name">
            <input
              id="full_name"
              type="text"
              value={form.full_name}
              onChange={update("full_name")}
              autoComplete="name"
              placeholder=" "
              className="peer field-input"
            />
          </FloatField>

          <FloatField label="Phone" htmlFor="phone">
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={update("phone")}
              autoComplete="tel"
              placeholder=" "
              className="peer field-input"
            />
          </FloatField>
        </div>

        {/* Email — read only */}
        <FloatField label="Email" htmlFor="email" hint="Can't be changed">
          <input
            id="email"
            type="email"
            value={profile.email}
            disabled
            placeholder=" "
            className="peer field-input"
            style={{ opacity: 0.45, cursor: "not-allowed" }}
          />
        </FloatField>

        {/* Delivery address */}
        <FloatField label="Default delivery address" htmlFor="default_address">
          <textarea
            id="default_address"
            value={form.default_address}
            onChange={update("default_address")}
            autoComplete="street-address"
            placeholder=" "
            rows={3}
            className="peer field-input"
            style={{ resize: "none" }}
          />
        </FloatField>
      </div>

      {/* Save */}
      <div className="flex justify-end mt-8">
        <button
          type="submit"
          disabled={loading}
          className="px-7 py-2.5 rounded-full text-sm font-semibold transition-all disabled:opacity-50 hover:scale-[1.03] hover:shadow-lg"
          style={{
            background: "linear-gradient(135deg, #FFB627 0%, #FF5A3C 100%)",
            color: "#FFFFFF",
            boxShadow: "0 4px 14px rgba(255, 90, 60, 0.28)",
          }}
        >
          {loading ? "Saving…" : "Save changes"}
        </button>
      </div>

      <style jsx>{`
        .field-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1.5px solid #e5e7eb;
          border-radius: 0;
          padding: 0.6rem 0 0.5rem;
          font-size: 0.9rem;
          color: #1a1a1a;
          outline: none;
          transition: border-color 0.2s;
          font-family: inherit;
        }
        .field-input:focus {
          border-color: #ff5a3c;
        }
        .field-input::placeholder {
          color: transparent;
        }
      `}</style>
    </form>
  );
}

function FloatField({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative pt-5">
      <label
        htmlFor={htmlFor}
        className="absolute top-0 left-0 text-xs font-semibold tracking-wide uppercase"
        style={{ color: "#9CA3AF" }}
      >
        {label}
        {hint && (
          <span className="ml-2 normal-case tracking-normal font-normal">
            — {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}
