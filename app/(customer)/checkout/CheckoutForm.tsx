"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/lib/hooks/useCart";
import { useCheckoutStore } from "@/lib/stores/checkout.store";
import { checkoutSchema } from "@/lib/utils/validators";
import type { GoCustomerProfile } from "@/lib/api/dto";

let stripePromise: Promise<Stripe | null> | null = null;
function getStripePromise(): Promise<Stripe | null> {
  if (stripePromise) return stripePromise;
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key || !key.startsWith("pk_")) return Promise.resolve(null);
  stripePromise = loadStripe(key);
  return stripePromise;
}

type OrderType = "pickup" | "delivery";

export default function CheckoutForm({
  profile,
}: {
  profile: GoCustomerProfile;
}) {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.getSubtotal());
  const storeOrderType = useCart((s) => s.orderType);
  const setStoreOrderType = useCart((s) => s.setOrderType);
  const createIntent = useCheckoutStore((s) => s.createIntent);

  const [orderType, setOrderType] = useState<OrderType>(storeOrderType);
  const [form, setForm] = useState({
    customerName: profile.full_name ?? "",
    customerPhone: profile.phone ?? "",
    customerEmail: profile.email ?? "",
    deliveryAddress: profile.default_address ?? "",
    deliveryCity: "",
    deliveryState: "",
    deliveryZip: "",
    deliveryNotes: "",
    specialInstructions: "",
  });
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deliveryFee, setDeliveryFee] = useState(0);

  const handleChange =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const switchOrderType = (t: OrderType) => {
    setOrderType(t);
    setStoreOrderType(t);
    // Invalidate the current intent so the user re-confirms with the right total.
    setClientSecret(null);
    setOrderNumber(null);
  };

  const total = useMemo(
    () => Math.round((subtotal + deliveryFee) * 100) / 100,
    [subtotal, deliveryFee]
  );

  const handleCreateIntent = async () => {
    setError(null);

    const parsed = checkoutSchema.safeParse({
      ...form,
      orderType,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please fill the form.");
      return;
    }

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setCreating(true);
    try {
      const intent = await createIntent({
        order_type: parsed.data.orderType,
        customer_name: parsed.data.customerName,
        customer_phone: parsed.data.customerPhone,
        customer_email: parsed.data.customerEmail,
        delivery_address: parsed.data.deliveryAddress,
        delivery_city: parsed.data.deliveryCity,
        delivery_state: parsed.data.deliveryState,
        delivery_zip: parsed.data.deliveryZip,
        delivery_notes: parsed.data.deliveryNotes,
        special_instructions: parsed.data.specialInstructions,
        items: items.map((i) => ({
          menu_item_id: i.menuItemId,
          quantity: i.quantity,
          selected_size: i.selectedSize ? { name: i.selectedSize.name } : null,
          selected_extras: i.selectedExtras.map((e) => ({ name: e.name })),
          special_instructions: i.specialInstructions,
        })),
      });
      if (!intent) {
        const err = useCheckoutStore.getState().error;
        setError(err ?? "Could not start checkout.");
        return;
      }
      setClientSecret(intent.client_secret);
      setOrderNumber(intent.order_number);
      setDeliveryFee(Number(intent.total) - subtotal);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setCreating(false);
    }
  };

  const stripePromise = getStripePromise();
  const stripeReady = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith(
    "pk_"
  );

  if (items.length === 0 && !orderNumber) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: "#FFF7EC" }}>
        <p className="font-semibold" style={{ color: "#1A1A1A" }}>
          Your cart is empty
        </p>
        <p className="text-sm mt-1" style={{ color: "#4A4A4A" }}>
          Add some food from the menu before checking out.
        </p>
        <Button onClick={() => router.push("/menu")} className="mt-4">
          Browse menu
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order type */}
      <section>
        <h2
          className="text-xs uppercase tracking-[0.2em] font-semibold mb-3"
          style={{ color: "#FF5A3C" }}
        >
          How would you like it?
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {(["pickup", "delivery"] as OrderType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => switchOrderType(t)}
              className="px-4 py-3 rounded-xl font-semibold text-sm transition-all capitalize"
              style={{
                border: orderType === t ? "2px solid #FF5A3C" : "1.5px solid #ECECEC",
                backgroundColor: orderType === t ? "#FFF1ED" : "#FFFFFF",
                color: "#1A1A1A",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <Label>Your name</Label>
          <Input value={form.customerName} onChange={handleChange("customerName")} className="mt-1.5" />
        </div>
        <div>
          <Label>Phone</Label>
          <Input
            type="tel"
            value={form.customerPhone}
            onChange={handleChange("customerPhone")}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={form.customerEmail}
            onChange={handleChange("customerEmail")}
            className="mt-1.5"
          />
        </div>
      </section>

      {orderType === "delivery" && (
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <Label>Street address</Label>
            <Input
              value={form.deliveryAddress}
              onChange={handleChange("deliveryAddress")}
              className="mt-1.5"
              placeholder="123 Main St, Apt 4B"
            />
          </div>
          <div>
            <Label>City</Label>
            <Input
              value={form.deliveryCity}
              onChange={handleChange("deliveryCity")}
              className="mt-1.5"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>State</Label>
              <Input
                value={form.deliveryState}
                onChange={handleChange("deliveryState")}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>ZIP</Label>
              <Input
                value={form.deliveryZip}
                onChange={handleChange("deliveryZip")}
                className="mt-1.5"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <Label>Delivery notes (optional)</Label>
            <Textarea
              value={form.deliveryNotes}
              onChange={handleChange("deliveryNotes")}
              rows={2}
              placeholder="Gate code, buzzer, etc."
              className="mt-1.5"
            />
          </div>
        </section>
      )}

      <section>
        <Label>Special instructions (optional)</Label>
        <Textarea
          value={form.specialInstructions}
          onChange={handleChange("specialInstructions")}
          rows={2}
          placeholder="Allergies, preferences…"
          className="mt-1.5"
        />
      </section>

      {/* Totals preview */}
      <section
        className="rounded-xl p-4 space-y-1"
        style={{ backgroundColor: "#FFF7EC" }}
      >
        <div className="flex justify-between text-sm" style={{ color: "#4A4A4A" }}>
          <span>Subtotal</span>
          <span className="tabular-nums">${subtotal.toFixed(2)}</span>
        </div>
        {orderType === "delivery" && (
          <div className="flex justify-between text-sm" style={{ color: "#4A4A4A" }}>
            <span>Delivery</span>
            <span className="tabular-nums">
              {clientSecret ? `$${deliveryFee.toFixed(2)}` : "calculated below"}
            </span>
          </div>
        )}
        <div
          className="flex justify-between pt-1 font-bold"
          style={{ color: "#1A1A1A" }}
        >
          <span>Total</span>
          <span className="tabular-nums">
            {clientSecret ? `$${total.toFixed(2)}` : "—"}
          </span>
        </div>
      </section>

      {error && (
        <div
          className="rounded-lg px-4 py-2.5 text-sm"
          style={{
            backgroundColor: "rgba(220,38,38,0.08)",
            color: "#B91C1C",
            border: "1px solid rgba(220,38,38,0.25)",
          }}
        >
          {error}
        </div>
      )}

      {!stripeReady ? (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{
            backgroundColor: "#FEF3C7",
            color: "#92400E",
            border: "1px solid #FDE68A",
          }}
        >
          Stripe is not configured yet. Add <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>
          and <code>STRIPE_SECRET_KEY</code> (test mode) to <code>.env.local</code>,
          then restart the dev server.
        </div>
      ) : !clientSecret ? (
        <Button
          onClick={handleCreateIntent}
          disabled={creating}
          className="w-full rounded-full font-bold"
          style={{
            background: "linear-gradient(135deg, #FFB627 0%, #FF5A3C 100%)",
            color: "#FFFFFF",
            height: 48,
          }}
        >
          {creating ? "Preparing payment…" : `Continue to payment`}
        </Button>
      ) : (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: { theme: "stripe" },
          }}
        >
          <PaymentStep orderNumber={orderNumber!} />
        </Elements>
      )}
    </div>
  );
}

function PaymentStep({ orderNumber }: { orderNumber: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Make sure we warm up — no-op.
  }, []);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setError(null);
    setProcessing(true);

    const { error: payErr } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmed?order=${encodeURIComponent(orderNumber)}`,
      },
    });

    if (payErr) {
      setError(payErr.message ?? "Payment failed.");
      toast.error(payErr.message ?? "Payment failed.");
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <PaymentElement />

      {error && (
        <div
          className="rounded-lg px-4 py-2.5 text-sm"
          style={{
            backgroundColor: "rgba(220,38,38,0.08)",
            color: "#B91C1C",
            border: "1px solid rgba(220,38,38,0.25)",
          }}
        >
          {error}
        </div>
      )}

      <Button
        onClick={handlePay}
        disabled={processing || !stripe || !elements}
        className="w-full rounded-full font-bold"
        style={{
          background: "linear-gradient(135deg, #FFB627 0%, #FF5A3C 100%)",
          color: "#FFFFFF",
          height: 48,
        }}
      >
        {processing ? "Processing…" : "Pay now"}
      </Button>
    </div>
  );
}
