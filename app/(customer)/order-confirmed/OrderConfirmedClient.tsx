"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/hooks/useCart";

// Mount-only client component that clears the cart once the user lands
// on the confirmation page. Renders nothing.
export default function OrderConfirmedClient() {
  const clearCart = useCart((s) => s.clearCart);
  useEffect(() => {
    clearCart();
  }, [clearCart]);
  return null;
}
