import { Playfair_Display, Cormorant_Garamond } from "next/font/google";
import type { Metadata } from "next";
import Navbar from "@/components/customer/Navbar";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Ember & Forge",
    default: "Ember & Forge — Premium Dining Experience",
  },
  description:
    "Fresh ingredients. Bold flavors. Delivered to your door or ready for pickup.",
};

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${playfair.variable} ${cormorant.variable} min-h-screen`}
      style={{ backgroundColor: "#FFFFFF", color: "#1A1A1A" }}
    >
      <Navbar />
      {children}
    </div>
  );
}
