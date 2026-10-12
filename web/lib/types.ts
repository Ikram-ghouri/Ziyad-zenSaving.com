export type Term = {
  id: number;
  slug: string;
  name: string;
  description: string;
  count: number;
};

export type FeaturedImage = {
  url: string;
  width: number;
  height: number;
  alt: string;
};

export type Seo = {
  title: string;
  description: string;
  canonical: string;
  og_image: string;
  noindex: boolean;
};

export type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  /** Rendered HTML. Only present on single-post responses (or include_content=true). */
  content?: string;
  date: string;
  modified: string;
  link: string;
  featured_image: FeaturedImage | null;
  author: { name: string; slug: string };
  /** First category name, kept for backward compatibility. */
  category: string;
  categories: Term[];
  tags: Term[];
  reading_time_minutes: number;
  seo: Seo;
};

export type PostList = {
  items: Post[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
};

export type Page = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  modified: string;
  seo: Seo;
};

export type SitemapEntry = { slug: string; modified: string; noindex: boolean };

export type SitemapData = {
  posts: SitemapEntry[];
  pages: SitemapEntry[];
  categories: Term[];
  stores?: { slug: string }[];
  coupon_categories?: { slug: string }[];
};

/** Shop (coupon) category, e.g. Fashion, Electronics. */
export type CouponCategory = {
  id: number;
  slug: string;
  name: string;
  parent: string;
  count: number;
  icon: string;
  image: string;
};

export type CouponCategoryDetail = CouponCategory & {
  description: string;
  coupons: Coupon[];
  page: number;
  total: number;
  total_pages: number;
  seo: Seo;
};

/** Lean store used in directories and grids. */
export type StoreSummary = {
  id: number;
  slug: string;
  name: string;
  logo: string;
  count: number;
};

export type StoreList = {
  items: StoreSummary[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
};

export type Coupon = {
  id: number;
  slug: string;
  title: string;
  description: string;
  content?: string;
  type: "code" | "sale" | "print";
  code: string;
  discount: string;
  expires: string;
  is_expired: boolean;
  free_shipping: boolean;
  exclusive: boolean;
  used: number;
  percent_success: number;
  go_url: string;
  verified?: boolean;
  /** Present when coupons are listed outside their store page (e.g. category pages). */
  store?: { slug: string; name: string; logo: string };
};

export type StoreDetail = {
  id: number;
  slug: string;
  name: string;
  logo: string;
  description: string;
  rating: number;
  url: string;
  aff_url: string;
  coupon_count: number;
  coupons: Coupon[];
  expired_coupons: Coupon[];
  seo: Seo;
};

export type Slide = {
  image: FeaturedImage;
  title: string;
  description: string;
  /** Internal path ("/store/x") or external URL; empty when the slide has no link. */
  href: string;
};

export type SiteInfo = {
  name: string;
  description: string;
  logo: string;
  slider: { autoplay_ms: number; slides: Slide[] };
  popular_stores: StoreSummary[];
  store_count: number;
};

export const storeLetters = [
  ..."abcdefghijklmnopqrstuvwxyz".split(""),
  "0-9",
] as const;

/** Normalises old absolute WordPress links (e.g. https://zensaving.com/store/x/) to frontend paths. */
export function toInternalHref(href: string, wpOrigins: string[] = []): string {
  if (!href || href === "#") return "";
  for (const origin of wpOrigins) {
    if (origin && href.startsWith(origin)) {
      const path = href.slice(origin.length) || "/";
      return path.length > 1 ? path.replace(/\/+$/, "") : path;
    }
  }
  if (href.startsWith("/")) return href.length > 1 ? href.replace(/\/+$/, "") : href;
  return safeUrl(href) ?? "";
}

export type RedirectRule = {
  source: string;
  destination: string;
  permanent: boolean;
};

/**
 * Frontend route -> WordPress page slug. Must stay in sync with
 * ZS_Headless_Bridge::page_route_map() in the plugin.
 */
export const pageSlugs = {
  about: "about-us",
  contact: "contact-us",
  terms: "term-and-conditions",
  "affiliate-disclosure": "affiliate-disclosure-policy",
  "privacy-policy": "privacy-policy",
  faq: "faq",
  "community-guidelines": "community-guidelines",
  careers: "careers",
} as const;

export type StaticRoute = keyof typeof pageSlugs;

export const label = (value: string) =>
  value
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");

export function safeUrl(value: string) {
  try {
    const u = new URL(value);
    return ["https:", "http:"].includes(u.protocol) ? u.href : undefined;
  } catch {
    return undefined;
  }
}

export function formatDate(
  value: string,
  month: "short" | "long" = "short",
): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month,
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Finds the redirect for a pathname. Supports exact sources and
 * trailing `:slug*` wildcards (the only pattern the plugin emits).
 */
export function matchRedirect(
  pathname: string,
  rules: RedirectRule[],
): RedirectRule | undefined {
  const path =
    pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  for (const rule of rules) {
    const source = rule.source.replace(/\/+$/, "");
    if (source.endsWith("/:slug*")) {
      const prefix = source.slice(0, -"/:slug*".length);
      if (path === prefix || path.startsWith(`${prefix}/`)) return rule;
    } else if (source === path) {
      return rule;
    }
  }
  return undefined;
}
