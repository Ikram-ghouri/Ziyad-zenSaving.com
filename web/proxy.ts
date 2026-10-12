import { NextRequest, NextResponse } from "next/server";
import { fetchRedirects } from "@/lib/data";
import { matchRedirect, type RedirectRule } from "@/lib/types";

/**
 * Permanent redirects from the WordPress plugin (old post permalinks, page slugs,
 * legacy coupon URLs). Fetched at runtime and cached in memory, so publishing a
 * post or changing the "Legacy coupon URL target" setting needs no redeploy.
 */
const TTL_MS = 5 * 60 * 1000;
let cache: { rules: RedirectRule[]; expires: number } | null = null;
let inflight: Promise<RedirectRule[]> | null = null;

async function rules(): Promise<RedirectRule[]> {
  if (cache && cache.expires > Date.now()) return cache.rules;
  inflight ??= fetchRedirects()
    .then((fresh) => {
      cache = { rules: fresh, expires: Date.now() + TTL_MS };
      return fresh;
    })
    .catch(() => {
      // Keep serving the last good rules; retry in a minute.
      const stale = cache?.rules ?? [];
      cache = { rules: stale, expires: Date.now() + 60 * 1000 };
      return stale;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/**
 * Routes this frontend owns. A stale or misconfigured redirect list from WordPress
 * (e.g. served from a page cache) must never send these elsewhere.
 */
const OWN_ROUTES = /^\/(?:$|stores$|store\/[^/]+$|coupon-category\/[^/]+$|categories$|blog(?:\/[^/]+)?$|search$)/;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rule = OWN_ROUTES.test(pathname.replace(/\/+$/, "") || "/") ? undefined : matchRedirect(pathname, await rules());
  if (!rule) {
    // Replaces Next's built-in trailing-slash redirect (disabled in next.config.ts).
    if (pathname.length > 1 && pathname.endsWith("/")) {
      // Plain URL: NextURL would re-append the slash it was created with.
      const url = new URL(request.url);
      url.pathname = pathname.replace(/\/+$/, "");
      return NextResponse.redirect(url, 308);
    }
    return NextResponse.next();
  }
  const destination = new URL(rule.destination, request.url);
  if (destination.pathname === request.nextUrl.pathname) return NextResponse.next();
  return NextResponse.redirect(destination, rule.permanent ? 301 : 302);
}

export const config = {
  // Skip Next internals, API routes and files with an extension.
  matcher: ["/((?!_next/|api/|.*\\.[a-zA-Z0-9]+$).*)"],
};
