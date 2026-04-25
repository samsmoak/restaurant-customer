"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AddressParts = {
  street: string;
  city: string;
  state: string;
  zip: string;
};

type Suggestion = {
  placeId: string;
  mainText: string;
  secondaryText: string;
};

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
  addressComponents?: Array<{
    types: string[];
    longText: string;
    shortText: string;
  }>;
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type Props = {
  value: string;
  onChange: (raw: string) => void;
  onSelect: (parts: AddressParts) => void;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
const PLACES_BASE = "https://places.googleapis.com/v1";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AddressAutocomplete({ value, onChange, onSelect }: Props) {
  // Fall back to a plain input if the API key is not configured.
  if (!API_KEY) {
    return (
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5"
        placeholder="123 Main St, Apt 4B"
        autoComplete="street-address"
      />
    );
  }

  return <Picker value={value} onChange={onChange} onSelect={onSelect} />;
}

// Separated so hooks only run when the API key is present.
function Picker({ value, onChange, onSelect }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Session token groups autocomplete + details calls into one billing unit.
  const sessionToken = useRef<string>(crypto.randomUUID());
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced autocomplete: fire 250ms after the user stops typing.
  useEffect(() => {
    setConfirmed(false);
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setFetching(true);
      try {
        const res = await fetch(`${PLACES_BASE}/places:autocomplete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": API_KEY,
          },
          body: JSON.stringify({
            input: trimmed,
            sessionToken: sessionToken.current,
            includedRegionCodes: ["us"],
          }),
        });
        if (!res.ok) return;
        const data: AutocompleteResponse = await res.json();
        const parsed: Suggestion[] = (data.suggestions ?? [])
          .slice(0, 5)
          .flatMap((s) => {
            const pp = s.placePrediction;
            if (!pp?.placeId) return [];
            return [
              {
                placeId: pp.placeId,
                mainText: pp.structuredFormat?.mainText?.text ?? "",
                secondaryText: pp.structuredFormat?.secondaryText?.text ?? "",
              },
            ];
          });
        setSuggestions(parsed);
        setOpen(parsed.length > 0);
      } catch {
        // Network blip — user can type the address manually.
      } finally {
        setFetching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [value]);

  const handleSelect = async (suggestion: Suggestion) => {
    // Immediately close the dropdown and show the chosen text.
    setOpen(false);
    setSuggestions([]);
    onChange(suggestion.mainText);

    try {
      const res = await fetch(
        `${PLACES_BASE}/places/${encodeURIComponent(suggestion.placeId)}`,
        {
          headers: {
            "X-Goog-Api-Key": API_KEY,
            "X-Goog-FieldMask": "addressComponents",
          },
        }
      );
      if (!res.ok) return;
      const data: PlaceDetailsResponse = await res.json();
      const parts = parseAddressComponents(data.addressComponents ?? []);
      onSelect(parts);
      setConfirmed(true);
    } catch {
      // Details call failed — city/state/zip stay empty for manual entry.
    } finally {
      // Regenerate session token after a completed selection.
      sessionToken.current = crypto.randomUUID();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      setSuggestions([]);
    }
  };

  const handleBlur = () => {
    blurTimer.current = setTimeout(() => {
      setOpen(false);
    }, 150);
  };

  const handleMouseDownSuggestion = () => {
    // Cancel the blur close so the click on a row registers first.
    if (blurTimer.current) clearTimeout(blurTimer.current);
  };

  return (
    <div className="relative mt-1.5">
      {/* Input */}
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true);
          }}
          placeholder="123 Main St, Apt 4B"
          autoComplete="off"
          className="pr-8"
          aria-autocomplete="list"
          aria-expanded={open}
        />
        {fetching && (
          <Loader2
            size={14}
            className="animate-spin absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "#9CA3AF" }}
          />
        )}
      </div>

      {/* Confirmed indicator */}
      {confirmed && !open && (
        <p className="mt-1 text-xs font-medium" style={{ color: "#10B981" }}>
          ✓ Address confirmed
        </p>
      )}

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 z-50 mt-1 rounded-lg overflow-hidden"
          style={{
            backgroundColor: "#FFFFFF",
            border: "1.5px solid #ECECEC",
            boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
          }}
        >
          {suggestions.map((s) => (
            <li
              key={s.placeId}
              role="option"
              aria-selected={false}
              onMouseDown={handleMouseDownSuggestion}
              onClick={() => void handleSelect(s)}
              className="flex items-start gap-2.5 px-3 py-2.5 cursor-pointer transition-colors hover:bg-orange-50"
            >
              <MapPin
                size={14}
                className="mt-0.5 shrink-0"
                style={{ color: "#FF5A3C" }}
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight truncate" style={{ color: "#1A1A1A" }}>
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseAddressComponents(
  components: NonNullable<PlaceDetailsResponse["addressComponents"]>
) {
  const get = (type: string, field: "longText" | "shortText" = "longText") =>
    components.find((c) => c.types.includes(type))?.[field] ?? "";

  const streetNumber = get("street_number");
  const route = get("route");
  const street = [streetNumber, route].filter(Boolean).join(" ");

  return {
    street,
    city: get("locality"),
    state: get("administrative_area_level_1", "shortText"),
    zip: get("postal_code"),
  };
}
