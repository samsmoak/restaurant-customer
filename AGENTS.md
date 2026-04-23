<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Data layer (two backends coexist)

This project has two parallel data layers:

- **Go backend (active going forward)**: `lib/api/` + `lib/stores/*.store.ts`.
  - Typed client + DTOs + endpoints: [lib/api/client.ts](lib/api/client.ts), [lib/api/dto.ts](lib/api/dto.ts), [lib/api/endpoints.ts](lib/api/endpoints.ts).
  - Zustand stores, one file per store: `cart.store.ts`, `auth.store.ts`, `menu.store.ts`, `orders.store.ts`, `restaurant.store.ts`, `profile.store.ts`, `checkout.store.ts`.
  - Env: `NEXT_PUBLIC_API_URL` points at the Go backend. `NEXT_PUBLIC_RESTAURANT_ID` pins this deployment 1:1 to a restaurant (its ObjectID hex). All tenant-scoped calls go through `tenantPath("/…")` which expands to `/api/r/:restaurant_id/…`.
  - Auth token is stored under localStorage key `rs_auth_token`.

- **Supabase (legacy, still wired)**: `lib/supabase/*` + `lib/hooks/*.supabase.ts`.
  - The original hooks (`useCart`, `useMenu`, `useOrders`, `useRestaurantStatus`) were copied to `*.supabase.ts` before the refactor. Any page still importing from `./useMenu` etc. is currently reading from Supabase.

### Rules for changes

- New data calls: use the store. Never add a new Supabase query outside the `.supabase.ts` files.
- Moving a page from Supabase → Go: swap the import from `lib/hooks/*.ts` (or `*.supabase.ts`) to the matching `lib/stores/*.store.ts`. One page at a time. Verify in-browser before moving to the next.
- Checkout submits via the `checkout.store.ts` → Go `/api/r/:slug/checkout/create-intent` and receives both `client_secret` and `clientSecret` (the camelCase alias lets existing Stripe Elements code keep working).
- Per-order tracking uses the WebSocket at `/ws/orders/:order_number` — handled inside `orders.store.ts`'s `trackOrder`.
