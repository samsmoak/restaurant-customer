"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, MapPin, Plus } from "lucide-react";
import { useProfileStore } from "@/lib/stores/profile.store";
import { useAddressStore } from "@/lib/stores/addresses.store";
import { useAuthStore } from "@/lib/stores/auth.store";
import { isApiError } from "@/lib/api/client";
import AddressAutocomplete from "@/components/customer/AddressAutocomplete";
import type { GoCustomerProfile } from "@/lib/api/dto";

export default function ProfileForm({ profile }: { profile: GoCustomerProfile }) {
  const updateProfile = useProfileStore((s) => s.update);
  const token = useAuthStore((s) => s.token);
  const savedAddresses = useAddressStore((s) => s.addresses);
  const fetchAddresses = useAddressStore((s) => s.fetchAddresses);
  const saveAddress = useAddressStore((s) => s.saveAddress);
  const deleteAddress = useAddressStore((s) => s.deleteAddress);

  const [form, setForm] = useState({
    full_name: profile.full_name ?? "",
    phone: profile.phone ?? "",
    default_address: profile.default_address ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newAddressStreet, setNewAddressStreet] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");
  const [newZip, setNewZip] = useState("");
  const [addingAddress, setAddingAddress] = useState(false);
  const [addingSaving, setAddingSaving] = useState(false);

  useEffect(() => { void fetchAddresses(token); }, [token, fetchAddresses]);

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
      toast.success("Profile saved!");
    } catch (err) {
      toast.error(isApiError(err) ? err.error : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    const street = newAddressStreet.trim();
    if (!street) return;
    setAddingSaving(true);
    try {
      await saveAddress({
        label: newLabel.trim() || "Address",
        address: street,
        city: newCity.trim(),
        state: newState.trim(),
        zip: newZip.trim(),
      });
      setNewLabel(""); setNewAddressStreet(""); setNewCity(""); setNewState(""); setNewZip("");
      setAddingAddress(false);
      toast.success("Address saved!");
    } catch {
      toast.error("Could not save address.");
    } finally {
      setAddingSaving(false);
    }
  };

  const handleDeleteAddress = (id: string) => {
    deleteAddress(id).catch(() => toast.error("Could not delete address."));
  };

  const cancelAdding = () => {
    setAddingAddress(false);
    setNewLabel(""); setNewAddressStreet(""); setNewCity(""); setNewState(""); setNewZip("");
  };

  return (
    <div className="space-y-6">
      {/* Personal information */}
      <Card title="Personal information">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full name">
                <CInput
                  type="text"
                  value={form.full_name}
                  onChange={update("full_name")}
                  autoComplete="name"
                  placeholder="Jane Smith"
                />
              </Field>
              <Field label="Phone">
                <CInput
                  type="tel"
                  value={form.phone}
                  onChange={update("phone")}
                  autoComplete="tel"
                  placeholder="+1 555 000 0000"
                />
              </Field>
            </div>

            <Field label="Email" hint="Cannot be changed">
              <CInput
                type="email"
                value={profile.email}
                disabled
                style={{ opacity: 0.5, cursor: "not-allowed" }}
              />
            </Field>
          </div>

          <div className="flex justify-end mt-5">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#0F2B4D", color: "#FFFFFF", borderRadius: 6 }}
            >
              {loading ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </Card>

      {/* Saved addresses */}
      <Card title="Saved addresses">
        {savedAddresses.length === 0 && !addingAddress && (
          <p className="text-sm mb-4" style={{ color: "#6B7280" }}>
            No saved addresses yet.
          </p>
        )}

        <div className="space-y-2 mb-4">
          {savedAddresses.map((a) => (
            <div
              key={a.id}
              className="flex items-start gap-3 p-3"
              style={{ border: "1px solid #E5E7EB", borderRadius: 4, backgroundColor: "#F5F7FA" }}
            >
              <MapPin size={14} className="mt-0.5 shrink-0" style={{ color: "#0F2B4D" }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: "#1E1E1E" }}>{a.label}</p>
                <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
                  {a.address}{a.city ? `, ${a.city}` : ""}{a.state ? `, ${a.state}` : ""}{a.zip ? ` ${a.zip}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteAddress(a.id)}
                className="shrink-0 transition-opacity hover:opacity-60"
                style={{ color: "#6B7280" }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        {addingAddress ? (
          <div
            className="p-4 space-y-3"
            style={{ border: "1px solid #E5E7EB", borderRadius: 4, backgroundColor: "#F5F7FA" }}
          >
            <Field label="Label (e.g. Home, Work)">
              <CInput
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Home"
              />
            </Field>
            <Field label="Street address">
              <AddressAutocomplete
                value={newAddressStreet}
                onChange={(raw) => {
                  setNewAddressStreet(raw);
                  setNewCity(""); setNewState(""); setNewZip("");
                }}
                onSelect={({ street, city, state, zip }) => {
                  setNewAddressStreet(street);
                  setNewCity(city); setNewState(state); setNewZip(zip);
                }}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City">
                <CInput value={newCity} onChange={(e) => setNewCity(e.target.value)} placeholder="Brooklyn" />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="State">
                  <CInput value={newState} onChange={(e) => setNewState(e.target.value)} placeholder="NY" />
                </Field>
                <Field label="ZIP">
                  <CInput value={newZip} onChange={(e) => setNewZip(e.target.value)} placeholder="11201" />
                </Field>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={cancelAdding}
                className="px-4 py-1.5 text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: "#6B7280" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddAddress}
                disabled={!newAddressStreet.trim() || addingSaving}
                className="px-4 py-1.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#0F2B4D", color: "#FFFFFF", borderRadius: 6 }}
              >
                {addingSaving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAddingAddress(true)}
            className="flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70"
            style={{ color: "#0F2B4D" }}
          >
            <Plus size={14} />
            Add address
          </button>
        )}
      </Card>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="p-6"
      style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 8 }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-[0.15em] mb-5"
        style={{ color: "#4A4A4A" }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
        style={{ color: "#4A4A4A" }}
      >
        {label}
        {hint && (
          <span className="ml-1.5 normal-case tracking-normal font-normal" style={{ color: "#6B7280" }}>
            — {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

function CInput({
  style: extraStyle,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        border: "1px solid #E5E7EB",
        borderRadius: 4,
        padding: "0.625rem 0.875rem",
        backgroundColor: "#FFFFFF",
        color: "#1E1E1E",
        fontSize: "0.875rem",
        outline: "none",
        fontFamily: "inherit",
        transition: "border-color 0.15s",
        ...extraStyle,
      }}
      onFocus={(e) => { e.currentTarget.style.borderColor = "#0F2B4D"; props.onFocus?.(e); }}
      onBlur={(e) => { if (!props.disabled) e.currentTarget.style.borderColor = "#E5E7EB"; props.onBlur?.(e); }}
    />
  );
}
