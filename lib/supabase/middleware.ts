import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Customer site: /checkout requires a signed-in customer. Everything else
// is public (menu browsing, landing, order tracking).
const CUSTOMER_LOGIN = "/customer-login";

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const pathname = request.nextUrl.pathname;
  const isCheckoutPath =
    pathname === "/checkout" || pathname.startsWith("/checkout/");

  // Env not configured: basic gate on /checkout only.
  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl === "your_supabase_project_url" ||
    supabaseAnonKey === "your_supabase_anon_key"
  ) {
    if (isCheckoutPath) {
      const url = request.nextUrl.clone();
      url.pathname = CUSTOMER_LOGIN;
      url.searchParams.set("next", "/checkout");
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  if (!isCheckoutPath) {
    return supabaseResponse;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isCustomer = false;
  if (user) {
    const { data } = await supabase
      .from("customer_profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    isCustomer = !!data;
  }

  if (!user || !isCustomer) {
    const url = request.nextUrl.clone();
    url.pathname = CUSTOMER_LOGIN;
    url.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
