"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";

type AddressParts = { street: string; city: string; state: string; zip: string };
type Suggestion = { placeId: string; mainText: string; secondaryText: string };
type AutocompleteResponse = {
  suggestions?: Array<{
    placePrediction?: {
      placeId?: string;
      structuredFormat?: {
        mainText?: { text?: string };
        secondaryText?: { text?: string };
      };
    };
  }>;
};
type PlaceDetailsResponse = {
  addressComponents?: Array<{ types: string[]; longText: string; shortText: string }>;
};

type Props = {
  value: string;
  onChange: (raw: string) => void;
  onSelect: (parts: AddressParts) => void;
};

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
const PLACES_BASE = "https://places.googleapis.com/v1";

const INPUT_STYLE: React.CSSProperties = {
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
};

export default function AddressAutocomplete({ value, onChange, onSelect }: Props) {
  if (!API_KEY) {
    return (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="123 Main St, Apt 4B"
        autoComplete="street-address"
        style={INPUT_STYLE}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#0F2B4D")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
      />
    );
  }
  return <Picker value={value} onChange={onChange} onSelect={onSelect} />;
}

function Picker({ value, onChange, onSelect }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const sessionToken = useRef<string>(crypto.randomUUID());
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setConfirmed(false);
    const trimmed = value.trim();
    if (trimmed.length < 2) { setSuggestions([]); setOpen(false); return; }

    const timer = setTimeout(async () => {
      setFetching(true);
      try {
        const res = await fetch(`${PLACES_BASE}/places:autocomplete`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Goog-Api-Key": API_KEY },
          body: JSON.stringify({ input: trimmed, sessionToken: sessionToken.current, includedRegionCodes: ["us"] }),
        });
        if (!res.ok) return;
        const data: AutocompleteResponse = await res.json();
        const parsed: Suggestion[] = (data.suggestions ?? []).slice(0, 5).flatMap((s) => {
          const pp = s.placePrediction;
          if (!pp?.placeId) return [];
          return [{ placeId: pp.placeId, mainText: pp.structuredFormat?.mainText?.text ?? "", secondaryText: pp.structuredFormat?.secondaryText?.text ?? "" }];
        });
        setSuggestions(parsed);
        setOpen(parsed.length > 0);
      } catch { /* network blip */ } finally { setFetching(false); }
    }, 250);

    return () => clearTimeout(timer);
  }, [value]);

  const handleSelect = async (s: Suggestion) => {
    setOpen(false); setSuggestions([]); onChange(s.mainText);
    try {
      const res = await fetch(`${PLACES_BASE}/places/${encodeURIComponent(s.placeId)}`, {
        headers: { "X-Goog-Api-Key": API_KEY, "X-Goog-FieldMask": "addressComponents" },
      });
      if (!res.ok) return;
      const data: PlaceDetailsResponse = await res.json();
      onSelect(parseAddressComponents(data.addressComponents ?? []));
      setConfirmed(true);
    } catch { /* details failed — manual entry */ } finally {
      sessionToken.current = crypto.randomUUID();
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Escape") { setOpen(false); setSuggestions([]); } }}
          onBlur={() => { blurTimer.current = setTimeout(() => setOpen(false), 150); }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#0F2B4D";
            if (suggestions.length > 0) setOpen(true);
          }}
          placeholder="123 Main St, Apt 4B"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
          style={{ ...INPUT_STYLE, paddingRight: "2rem" }}
        />
        {fetching && (
          <Loader2
            size={13}
            className="animate-spin absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "#6B7280" }}
          />
        )}
      </div>

      {confirmed && !open && (
        <p className="mt-1 text-xs font-medium" style={{ color: "#166534" }}>
          ✓ Address confirmed
        </p>
      )}

      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 z-50 mt-1 overflow-hidden"
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: 4,
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          }}
        >
          {suggestions.map((s) => (
            <li
              key={s.placeId}
              role="option"
              aria-selected={false}
              onMouseDown={() => { if (blurTimer.current) clearTimeout(blurTimer.current); }}
              onClick={() => void handleSelect(s)}
              className="flex items-start gap-2.5 px-3 py-2.5 cursor-pointer transition-colors hover:bg-gray-50"
            >
              <MapPin size={13} className="mt-0.5 shrink-0" style={{ color: "#0F2B4D" }} />
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight truncate" style={{ color: "#1E1E1E" }}>
                  {s.mainText}
                </p>
                {s.secondaryText && (
                  <p className="text-xs mt-0.5 truncate" style={{ color: "#6B7280" }}>
                    {s.secondaryText}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function parseAddressComponents(components: NonNullable<PlaceDetailsResponse["addressComponents"]>) {
  const get = (type: string, field: "longText" | "shortText" = "longText") =>
    components.find((c) => c.types.includes(type))?.[field] ?? "";
  return {
    street: [get("street_number"), get("route")].filter(Boolean).join(" "),
    city: get("locality"),
    state: get("administrative_area_level_1", "shortText"),
    zip: get("postal_code"),
  };
}
