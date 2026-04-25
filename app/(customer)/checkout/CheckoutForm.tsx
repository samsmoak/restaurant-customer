"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import AddressAutocomplete from "@/components/customer/AddressAutocomplete";
import { useCart } from "@/lib/hooks/useCart";
import { useCheckoutStore } from "@/lib/stores/checkout.store";
import { useRestaurantStore } from "@/lib/stores/restaurant.store";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useAddressStore } from "@/lib/stores/addresses.store";
import { checkoutSchema } from "@/lib/utils/validators";
import { paymentMethodsApi } from "@/lib/api/endpoints";
import type { GoCustomerProfile, GoPaymentMethod, GoSavedAddress } from "@/lib/api/dto";

// ---------------------------------------------------------------------------
// Stripe singleton
// ---------------------------------------------------------------------------

let stripePromise: Promise<Stripe | null> | null = null;
function getStripe(): Promise<Stripe | null> {
  if (stripePromise) return stripePromise;
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key?.startsWith("pk_")) return Promise.resolve(null);
  stripePromise = loadStripe(key);
  return stripePromise;
}

type OrderType = "pickup" | "delivery";

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

function CLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#4A4A4A" }}>
      {children}
    </label>
  );
}

function CInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
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
        ...props.style,
      }}
      onFocus={(e) => { e.currentTarget.style.borderColor = "#0F2B4D"; props.onFocus?.(e); }}
      onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; props.onBlur?.(e); }}
    />
  );
}

function CTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
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
        resize: "none",
        transition: "border-color 0.15s",
        ...props.style,
      }}
      onFocus={(e) => { e.currentTarget.style.borderColor = "#0F2B4D"; props.onFocus?.(e); }}
      onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; props.onBlur?.(e); }}
    />
  );
}

function PrimaryBtn({
  children,
  disabled,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full font-semibold text-sm tracking-wide transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ backgroundColor: "#0F2B4D", color: "#FFFFFF", borderRadius: 4, height: 46 }}
    >
      {children}
    </button>
  );
}

function InlineError({ msg }: { msg: string }) {
  return (
    <div
      className="text-sm p-3"
      style={{ backgroundColor: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA", borderRadius: 4 }}
    >
      {msg}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Accordion section wrapper
// ---------------------------------------------------------------------------

function AccordionSection({
  number,
  title,
  step,
  currentStep,
  summary,
  onEdit,
  children,
}: {
  number: string;
  title: string;
  step: number;
  currentStep: number;
  summary?: string;
  onEdit?: () => void;
  children: React.ReactNode;
}) {
  const isActive = currentStep === step;
  const isDone = currentStep > step;
  const isLocked = currentStep < step;

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 8,
      }}
    >
      {/* Section header */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: isActive ? "1px solid #E5E7EB" : "none" }}
      >
        <p
          className="text-sm font-bold tracking-[0.12em] uppercase"
          style={{ color: isLocked ? "#9CA3AF" : "#1E1E1E" }}
        >
          {number}. {title}
        </p>
        <div className="flex items-center gap-4">
          {isDone && summary && !isActive && (
            <span className="text-xs text-right" style={{ color: "#4A4A4A" }}>
              {summary}
            </span>
          )}
          {isDone && onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="text-xs font-semibold uppercase tracking-wide transition-opacity hover:opacity-70"
              style={{ color: "#0F2B4D" }}
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Expanded content */}
      {isActive && <div className="px-6 pb-6 pt-4 space-y-4">{children}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function CheckoutForm({ profile }: { profile: GoCustomerProfile }) {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.getSubtotal());
  const storeOrderType = useCart((s) => s.orderType);
  const setStoreOrderType = useCart((s) => s.setOrderType);
  const isOpen = useRestaurantStore((s) => s.isOpen);
  const restaurantLoading = useRestaurantStore((s) => s.loading);
  const nextStatusChange = useRestaurantStore((s) => s.nextStatusChange);
  const restaurant = useRestaurantStore((s) => s.restaurant);
  const token = useAuthStore((s) => s.token);
  const savedAddresses = useAddressStore((s) => s.addresses);
  const fetchAddresses = useAddressStore((s) => s.fetchAddresses);
  const saveAddress = useAddressStore((s) => s.saveAddress);

  const [step, setStep] = useState(1);
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
  const [shippingError, setShippingError] = useState<string | null>(null);

  // Saved addresses — ID selection + save-new-address option
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">("new");
  const [saveNewAddress, setSaveNewAddress] = useState(false);
  const [newAddressLabel, setNewAddressLabel] = useState("");

  useEffect(() => { void fetchAddresses(token); }, [token, fetchAddresses]);

  // Default-select the first saved address once they load
  useEffect(() => {
    if (savedAddresses.length > 0 && selectedAddressId === "new") {
      const first = savedAddresses[0];
      setSelectedAddressId(first.id);
      setForm((prev) => ({
        ...prev,
        deliveryAddress: first.address,
        deliveryCity: first.city,
        deliveryState: first.state,
        deliveryZip: first.zip,
      }));
    }
  // Run only when savedAddresses first populates
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedAddresses.length]);

  const handleChange =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const switchOrderType = (t: OrderType) => {
    setOrderType(t);
    setStoreOrderType(t);
  };

  const selectSavedAddress = (addr: GoSavedAddress) => {
    setSelectedAddressId(addr.id);
    setForm((prev) => ({
      ...prev,
      deliveryAddress: addr.address,
      deliveryCity: addr.city,
      deliveryState: addr.state,
      deliveryZip: addr.zip,
    }));
  };

  const selectNewAddress = () => {
    setSelectedAddressId("new");
    setForm((prev) => ({
      ...prev,
      deliveryAddress: "",
      deliveryCity: "",
      deliveryState: "",
      deliveryZip: "",
    }));
  };

  const estimatedDeliveryFee = useMemo(
    () => (orderType === "delivery" ? (restaurant?.delivery_fee ?? 0) : 0),
    [orderType, restaurant]
  );

  const total = useMemo(
    () => Math.round((subtotal + estimatedDeliveryFee) * 100) / 100,
    [subtotal, estimatedDeliveryFee]
  );

  const handleContinueToPayment = () => {
    setShippingError(null);
    const parsed = checkoutSchema.safeParse({ ...form, orderType });
    if (!parsed.success) {
      setShippingError(parsed.error.issues[0]?.message ?? "Please fill all required fields.");
      return;
    }
    if (items.length === 0) { setShippingError("Your cart is empty."); return; }
    setStep(2);
    if (saveNewAddress && selectedAddressId === "new" && form.deliveryAddress) {
      saveAddress({
        label: newAddressLabel.trim() || "Address",
        address: form.deliveryAddress,
        city: form.deliveryCity,
        state: form.deliveryState,
        zip: form.deliveryZip,
      }).then(() => {
        setSaveNewAddress(false);
        setNewAddressLabel("");
      }).catch(() => {});
    }
  };

  const editShipping = () => setStep(1);
  const stripeReady = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith("pk_");

  const shippingSummary =
    orderType === "pickup"
      ? "Store pickup"
      : form.deliveryAddress
      ? `${form.deliveryAddress}${form.deliveryCity ? `, ${form.deliveryCity}` : ""}`
      : undefined;

  if (items.length === 0 && step === 1) {
    return (
      <div
        className="p-8 text-center"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 8 }}
      >
        <p className="font-semibold text-sm" style={{ color: "#1E1E1E" }}>Your cart is empty</p>
        <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
          Add some food from the menu before checking out.
        </p>
        <button
          onClick={() => router.push("/menu")}
          className="mt-4 px-5 py-2 font-semibold text-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#0F2B4D", color: "#FFFFFF", borderRadius: 4 }}
        >
          Browse menu
        </button>
      </div>
    );
  }

  return (
    <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-8 lg:items-start">
      {/* ── Left: accordion steps ─────────────────────────────────── */}
      <div className="space-y-3 mb-8 lg:mb-0">

        {/* ── Step 1: Shipping ── */}
        <AccordionSection
          number="01"
          title="Shipping"
          step={1}
          currentStep={step}
          summary={shippingSummary}
          onEdit={editShipping}
        >
          {/* Closed warning */}
          {!restaurantLoading && !isOpen && (
            <div
              className="text-sm p-3"
              style={{ backgroundColor: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA", borderRadius: 4 }}
            >
              <strong>We&apos;re currently closed</strong>
              {nextStatusChange ? ` — ${nextStatusChange}.` : "."}
              {" "}Orders are not accepted right now.
            </div>
          )}

          {/* Order type */}
          <div className="space-y-2">
            {(["delivery", "pickup"] as OrderType[]).map((t) => (
              <label
                key={t}
                className="flex items-center gap-3 p-3 cursor-pointer transition-colors"
                style={{
                  border: orderType === t ? "1px solid #0F2B4D" : "1px solid #E5E7EB",
                  borderRadius: 4,
                  backgroundColor: orderType === t ? "#F0F4FA" : "#FFFFFF",
                }}
              >
                <input
                  type="radio"
                  name="orderType"
                  value={t}
                  checked={orderType === t}
                  onChange={() => switchOrderType(t)}
                  style={{ accentColor: "#0F2B4D" }}
                />
                <p className="text-sm font-semibold capitalize" style={{ color: "#1E1E1E" }}>
                  {t === "delivery" ? "Standard delivery" : "Store pickup"}
                </p>
              </label>
            ))}
          </div>

          {/* Delivery address */}
          {orderType === "delivery" && (
            <div className="space-y-3">
              {/* Saved addresses */}
              {savedAddresses.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#4A4A4A" }}>
                    Saved addresses
                  </p>
                  {savedAddresses.map((addr) => (
                    <label
                      key={addr.id}
                      className="flex items-start gap-3 p-3 cursor-pointer transition-colors"
                      style={{
                        border: selectedAddressId === addr.id ? "1px solid #0F2B4D" : "1px solid #E5E7EB",
                        borderRadius: 4,
                        backgroundColor: selectedAddressId === addr.id ? "#F0F4FA" : "#FFFFFF",
                      }}
                    >
                      <input
                        type="radio"
                        name="savedAddress"
                        checked={selectedAddressId === addr.id}
                        onChange={() => selectSavedAddress(addr)}
                        style={{ accentColor: "#0F2B4D", marginTop: 2 }}
                      />
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "#1E1E1E" }}>{addr.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
                          {addr.address}, {addr.city}, {addr.state} {addr.zip}
                        </p>
                      </div>
                    </label>
                  ))}
                  <label
                    className="flex items-center gap-3 p-3 cursor-pointer transition-colors"
                    style={{
                      border: selectedAddressId === "new" ? "1px solid #0F2B4D" : "1px solid #E5E7EB",
                      borderRadius: 4,
                      backgroundColor: selectedAddressId === "new" ? "#F0F4FA" : "#FFFFFF",
                    }}
                  >
                    <input
                      type="radio"
                      name="savedAddress"
                      checked={selectedAddressId === "new"}
                      onChange={selectNewAddress}
                      style={{ accentColor: "#0F2B4D" }}
                    />
                    <p className="text-sm font-semibold" style={{ color: "#0F2B4D" }}>+ Add new address</p>
                  </label>
                </div>
              )}

              {/* Address form — shown when "new" is selected or no saved addresses */}
              {selectedAddressId === "new" && (
                <>
                  <div>
                    <CLabel>Street address</CLabel>
                    <AddressAutocomplete
                      value={form.deliveryAddress}
                      onChange={(raw) =>
                        setForm((prev) => ({
                          ...prev,
                          deliveryAddress: raw,
                          deliveryCity: "",
                          deliveryState: "",
                          deliveryZip: "",
                        }))
                      }
                      onSelect={({ street, city, state, zip }) =>
                        setForm((prev) => ({
                          ...prev,
                          deliveryAddress: street,
                          deliveryCity: city,
                          deliveryState: state,
                          deliveryZip: zip,
                        }))
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <CLabel>City</CLabel>
                      <CInput value={form.deliveryCity} onChange={handleChange("deliveryCity")} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <CLabel>State</CLabel>
                        <CInput value={form.deliveryState} onChange={handleChange("deliveryState")} />
                      </div>
                      <div>
                        <CLabel>ZIP</CLabel>
                        <CInput value={form.deliveryZip} onChange={handleChange("deliveryZip")} />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Save address option — only when entering a new address */}
              {selectedAddressId === "new" && form.deliveryAddress && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveNewAddress}
                      onChange={(e) => setSaveNewAddress(e.target.checked)}
                      style={{ accentColor: "#0F2B4D", width: 14, height: 14 }}
                    />
                    <span className="text-sm" style={{ color: "#4A4A4A" }}>Save address for future orders</span>
                  </label>
                  {saveNewAddress && (
                    <CInput
                      placeholder='Label (e.g. "Home", "Work")'
                      value={newAddressLabel}
                      onChange={(e) => setNewAddressLabel(e.target.value)}
                    />
                  )}
                </div>
              )}

              <div>
                <CLabel>Delivery notes (optional)</CLabel>
                <CTextarea
                  value={form.deliveryNotes}
                  onChange={handleChange("deliveryNotes")}
                  rows={2}
                  placeholder="Gate code, buzzer, leave at door…"
                />
              </div>
            </div>
          )}

          {/* Contact */}
          <div className="space-y-3">
            <div>
              <CLabel>Full name</CLabel>
              <CInput value={form.customerName} onChange={handleChange("customerName")} autoComplete="name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <CLabel>Phone</CLabel>
                <CInput type="tel" value={form.customerPhone} onChange={handleChange("customerPhone")} autoComplete="tel" />
              </div>
              <div>
                <CLabel>Email</CLabel>
                <CInput type="email" value={form.customerEmail} onChange={handleChange("customerEmail")} autoComplete="email" />
              </div>
            </div>
          </div>

          {/* Special instructions */}
          <div>
            <CLabel>Special instructions (optional)</CLabel>
            <CTextarea
              value={form.specialInstructions}
              onChange={handleChange("specialInstructions")}
              rows={2}
              placeholder="Allergies, preferences…"
            />
          </div>

          {shippingError && <InlineError msg={shippingError} />}

          {!stripeReady && (
            <div
              className="text-sm p-3"
              style={{ backgroundColor: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A", borderRadius: 4 }}
            >
              Stripe is not configured. Add <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to <code>.env.local</code>.
            </div>
          )}

          <PrimaryBtn
            onClick={handleContinueToPayment}
            disabled={!stripeReady || (!restaurantLoading && !isOpen)}
          >
            Continue to payment
          </PrimaryBtn>
        </AccordionSection>

        {/* ── Step 2: Payment — always mounted inside Elements ── */}
        <Elements
          stripe={getStripe()}
          options={{
            appearance: {
              theme: "stripe",
              variables: {
                colorPrimary: "#0F2B4D",
                colorBackground: "#FFFFFF",
                colorText: "#1E1E1E",
                colorDanger: "#DC2626",
                fontFamily: "system-ui, -apple-system, sans-serif",
                borderRadius: "4px",
              },
            },
          }}
        >
          <PaymentStep
            step={step}
            form={form}
            orderType={orderType}
            items={items}
            subtotal={subtotal}
            deliveryFee={estimatedDeliveryFee}
            total={total}
          />
        </Elements>
      </div>

      {/* ── Right: Order summary sidebar ─────────────────────────── */}
      <OrderSummary
        items={items}
        subtotal={subtotal}
        deliveryFee={orderType === "delivery" ? estimatedDeliveryFee : null}
        total={total}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2 — must be inside <Elements>
// ---------------------------------------------------------------------------

type StepItem = {
  cartId: string;
  menuItemId: string;
  name: string;
  quantity: number;
  itemTotal: number;
  selectedSize?: { name: string } | null;
  selectedExtras: { name: string; price: number }[];
  specialInstructions?: string;
};

function PaymentStep({
  step,
  form,
  orderType,
  items,
  subtotal,
  deliveryFee,
  total,
}: {
  step: number;
  form: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryCity: string;
    deliveryState: string;
    deliveryZip: string;
    deliveryNotes: string;
    specialInstructions: string;
  };
  orderType: OrderType;
  items: StepItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const clearCart = useCart((s) => s.clearCart);
  const createIntent = useCheckoutStore((s) => s.createIntent);

  const [payError, setPayError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Saved payment methods
  const [savedCards, setSavedCards] = useState<GoPaymentMethod[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null); // null = new card
  const [saveNewCard, setSaveNewCard] = useState(false);

  useEffect(() => {
    paymentMethodsApi.list()
      .then((data) => {
        const cards = data?.payment_methods ?? [];
        setSavedCards(cards);
        setSelectedCardId(cards.length > 0 ? cards[0].id : null);
      })
      .catch(() => setSavedCards([]))
      .finally(() => setLoadingCards(false));
  }, []);

  const selectedCard = savedCards.find((c) => c.id === selectedCardId) ?? null;

  const handlePlaceOrder = async () => {
    if (!stripe || !elements) return;
    setPayError(null);
    setProcessing(true);

    // 1. Create the order + Stripe PaymentIntent
    const intent = await createIntent({
      order_type: orderType,
      customer_name: form.customerName,
      customer_phone: form.customerPhone,
      customer_email: form.customerEmail || undefined,
      delivery_address: form.deliveryAddress || undefined,
      delivery_city: form.deliveryCity || undefined,
      delivery_state: form.deliveryState || undefined,
      delivery_zip: form.deliveryZip || undefined,
      delivery_notes: form.deliveryNotes || undefined,
      special_instructions: form.specialInstructions || undefined,
      payment_method_id: selectedCardId ?? undefined,
      save_payment_method: selectedCardId === null && saveNewCard,
      items: items.map((i) => ({
        menu_item_id: i.menuItemId,
        quantity: i.quantity,
        selected_size: i.selectedSize ? { name: i.selectedSize.name } : null,
        selected_extras: i.selectedExtras.map((e) => ({ name: e.name })),
        special_instructions: i.specialInstructions,
      })),
    });

    if (!intent) {
      setPayError(useCheckoutStore.getState().error ?? "Could not place order.");
      setProcessing(false);
      return;
    }

    // 2. Confirm payment with Stripe
    let confirmResult;
    if (selectedCardId) {
      // Saved card — confirm by ID
      confirmResult = await stripe.confirmCardPayment(intent.client_secret, {
        payment_method: selectedCardId,
      });
    } else {
      // New card — read from the mounted CardElement
      const cardEl = elements.getElement(CardElement);
      if (!cardEl) {
        setPayError("Card element not ready. Please refresh and try again.");
        setProcessing(false);
        return;
      }
      confirmResult = await stripe.confirmCardPayment(intent.client_secret, {
        payment_method: {
          card: cardEl,
          billing_details: {
            name: form.customerName,
            email: form.customerEmail || undefined,
          },
        },
      });
    }

    if (confirmResult.error) {
      setPayError(confirmResult.error.message ?? "Payment failed.");
      toast.error(confirmResult.error.message ?? "Payment failed.");
      setProcessing(false);
    } else if (
      confirmResult.paymentIntent?.status === "succeeded" ||
      confirmResult.paymentIntent?.status === "processing"
    ) {
      clearCart();
      router.push(`/order-confirmed?order=${encodeURIComponent(intent.order_number)}`);
    }
  };

  return (
    <AccordionSection
      number="02"
      title="Payment"
      step={2}
      currentStep={step}
    >
      {loadingCards ? (
        <p className="text-sm" style={{ color: "#6B7280" }}>Loading payment methods…</p>
      ) : (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#4A4A4A" }}>
            Payment method
          </p>

          {savedCards.map((card) => (
            <label
              key={card.id}
              className="flex items-center gap-3 p-3 cursor-pointer transition-colors"
              style={{
                border: selectedCardId === card.id ? "1px solid #0F2B4D" : "1px solid #E5E7EB",
                borderRadius: 4,
                backgroundColor: selectedCardId === card.id ? "#F0F4FA" : "#FFFFFF",
              }}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={card.id}
                checked={selectedCardId === card.id}
                onChange={() => setSelectedCardId(card.id)}
                style={{ accentColor: "#0F2B4D" }}
              />
              <div>
                <p className="text-sm font-semibold" style={{ color: "#1E1E1E" }}>
                  {capitalize(card.brand)} ending {card.last4}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
                  Expires {String(card.exp_month).padStart(2, "0")}/{String(card.exp_year).slice(-2)}
                </p>
              </div>
            </label>
          ))}

          {/* New card option */}
          <label
            className="flex items-center gap-3 p-3 cursor-pointer transition-colors"
            style={{
              border: selectedCardId === null ? "1px solid #0F2B4D" : "1px solid #E5E7EB",
              borderRadius: 4,
              backgroundColor: selectedCardId === null ? "#F0F4FA" : "#FFFFFF",
            }}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="new"
              checked={selectedCardId === null}
              onChange={() => setSelectedCardId(null)}
              style={{ accentColor: "#0F2B4D" }}
            />
            <p className="text-sm font-semibold" style={{ color: "#0F2B4D" }}>+ New card</p>
          </label>
        </div>
      )}

      {/* Card details — shown inline when new card is selected */}
      {selectedCardId === null && !loadingCards && (
        <div className="space-y-2">
          <CLabel>Card details</CLabel>
          <div
            style={{ border: "1px solid #E5E7EB", borderRadius: 4, padding: "0.75rem 0.875rem", backgroundColor: "#FFFFFF" }}
          >
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "14px",
                    color: "#1E1E1E",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    fontSmoothing: "antialiased",
                    "::placeholder": { color: "#6B7280" },
                    iconColor: "#6B7280",
                  },
                  invalid: { color: "#DC2626", iconColor: "#DC2626" },
                },
                hidePostalCode: false,
              }}
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={saveNewCard}
              onChange={(e) => setSaveNewCard(e.target.checked)}
              style={{ accentColor: "#0F2B4D", width: 14, height: 14 }}
            />
            <span className="text-sm" style={{ color: "#4A4A4A" }}>Save card for future orders</span>
          </label>
        </div>
      )}

      {/* Saved card reminder */}
      {selectedCard && (
        <div
          className="text-sm p-3"
          style={{ backgroundColor: "#F0F4FA", border: "1px solid #D1D9E6", borderRadius: 4, color: "#1E1E1E" }}
        >
          Paying with {capitalize(selectedCard.brand)} ending {selectedCard.last4}
        </div>
      )}

      {payError && <InlineError msg={payError} />}

      <PrimaryBtn
        onClick={handlePlaceOrder}
        disabled={processing || !stripe || !elements || loadingCards}
      >
        {processing ? "Processing…" : `Order and review — $${total.toFixed(2)}`}
      </PrimaryBtn>
    </AccordionSection>
  );
}

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

// ---------------------------------------------------------------------------
// Order summary sidebar
// ---------------------------------------------------------------------------

function OrderSummary({
  items,
  subtotal,
  deliveryFee,
  total,
}: {
  items: StepItem[];
  subtotal: number;
  deliveryFee: number | null;
  total: number;
}) {
  return (
    <div
      className="sticky top-28"
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 8,
        padding: "1.5rem",
      }}
    >
      <p
        className="text-xs font-bold uppercase tracking-[0.2em] mb-5"
        style={{ color: "#4A4A4A" }}
      >
        Order summary
      </p>

      {/* Item list */}
      <div className="space-y-3 mb-4">
        {items.map((it) => (
          <div key={it.cartId} className="flex justify-between gap-3 text-sm">
            <span className="truncate" style={{ color: "#4A4A4A" }}>
              {it.quantity}× {it.name}
              {it.selectedSize ? ` (${it.selectedSize.name})` : ""}
              {it.selectedExtras.length > 0
                ? ` + ${it.selectedExtras.map((e) => e.name).join(", ")}`
                : ""}
            </span>
            <span className="tabular-nums shrink-0 font-medium" style={{ color: "#1E1E1E" }}>
              ${it.itemTotal.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t pt-4 space-y-2" style={{ borderColor: "#E5E7EB" }}>
        <div className="flex justify-between text-sm" style={{ color: "#4A4A4A" }}>
          <span>Subtotal</span>
          <span className="tabular-nums">${subtotal.toFixed(2)}</span>
        </div>
        {deliveryFee !== null && (
          <div className="flex justify-between text-sm" style={{ color: "#4A4A4A" }}>
            <span>Delivery (est.)</span>
            <span className="tabular-nums">${deliveryFee.toFixed(2)}</span>
          </div>
        )}
        <div
          className="flex justify-between font-bold pt-2"
          style={{ color: "#1E1E1E", borderTop: "1px solid #E5E7EB" }}
        >
          <span>Estimated total</span>
          <span className="tabular-nums">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
