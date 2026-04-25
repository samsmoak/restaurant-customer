import { Playfair_Display, Cormorant_Garamond } from "next/font/google";
import type { Metadata } from "next";
import Navbar from "@/components/customer/Navbar";
import RestaurantProvider from "@/components/customer/RestaurantProvider";
import { RESTAURANT_ID } from "@/lib/config";
import type { GoRestaurant } from "@/lib/api/dto";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
});

// ---------------------------------------------------------------------------
// Dynamic metadata — fetches restaurant data server-side so <title> and OG
// tags reflect the actual restaurant name and logo without waiting for JS.
// Revalidates every 5 minutes; falls back to generic copy on any error.
// ---------------------------------------------------------------------------
export async function generateMetadata(): Promise<Metadata> {
  if (!RESTAURANT_ID) {
    return { title: "Store Not Available" };
  }

  try {
    const base =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ??
      "http://localhost:8080";
    const res = await fetch(
      `${base}/api/r/${encodeURIComponent(RESTAURANT_ID)}/restaurant`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) throw new Error("fetch failed");
    const data: GoRestaurant = await res.json();

    return {
      title: {
        template: `%s | ${data.name}`,
        default: data.name,
      },
      description:
        data.description ??
        `Order online from ${data.name} — delivery & pickup.`,
      openGraph: {
        title: data.name,
        description:
          data.description ??
          `Order online from ${data.name} — delivery & pickup.`,
        ...(data.logo_url ? { images: [{ url: data.logo_url }] } : {}),
      },
      ...(data.logo_url
        ? {
            icons: {
              icon: data.logo_url,
              apple: data.logo_url,
            },
          }
        : {}),
    };
  } catch {
    return {
      title: {
        template: "%s | Order Online",
        default: "Order Online",
      },
      description: "Order online for delivery or pickup.",
    };
  }
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------
export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Hard guard: if the env var is missing the entire deployment is broken.
  // Render a static server-side error rather than letting tenantId() throw
  // somewhere deep in a client component.
  if (!RESTAURANT_ID) {
    return (
      <div
        className={`${playfair.variable} ${cormorant.variable} min-h-screen flex flex-col items-center justify-center px-6 text-center`}
        style={{ backgroundColor: "#FFFFFF", color: "#1A1A1A" }}
      >
        <h1
          className="text-3xl font-bold mb-3"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          This store is not available
        </h1>
        <p className="text-base max-w-sm" style={{ color: "#4A4A4A" }}>
          The store configuration is missing. Please contact support.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`${playfair.variable} ${cormorant.variable} min-h-screen`}
      style={{ backgroundColor: "#FFFFFF", color: "#1A1A1A" }}
    >
      {/* RestaurantProvider initialises the Zustand store on mount and shows
          a "store not available" error page if the backend fetch fails. */}
      <RestaurantProvider>
        <Navbar />
        {children}
      </RestaurantProvider>
    </div>
  );
}
