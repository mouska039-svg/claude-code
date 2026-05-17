import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

const rateLimitMap = new Map<string, TokenBucket>();

const RATE_LIMIT = 60;
const WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = rateLimitMap.get(ip);

  if (!bucket) {
    rateLimitMap.set(ip, { tokens: RATE_LIMIT - 1, lastRefill: now });
    return false;
  }

  const elapsed = now - bucket.lastRefill;
  if (elapsed >= WINDOW_MS) {
    bucket.tokens = RATE_LIMIT - 1;
    bucket.lastRefill = now;
    return false;
  }

  if (bucket.tokens <= 0) {
    return true;
  }

  bucket.tokens -= 1;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
    }
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (pathname.startsWith("/dashboard") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (
    user &&
    (pathname === "/sign-in" ||
      pathname === "/sign-up" ||
      pathname === "/forgot-password")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
