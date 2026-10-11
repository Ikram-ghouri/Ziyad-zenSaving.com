import type { Catalog, Store } from "@/lib/types";

const names = [
  "Adidas",
  "Amazon",
  "ASOS",
  "Best Buy",
  "Booking.com",
  "Etsy",
  "H&M",
  "iHerb",
  "Nike",
  "Sephora",
  "Target",
  "Walmart",
];
const categories = [
  "Electronics",
  "Beauty",
  "Fashion",
  "Home & Living",
  "Health",
  "Travel",
];
const stores: Store[] = names.map((name, index) => ({
  id: index + 1,
  slug: name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-$/, ""),
  name,
  category: categories[index % categories.length],
  description: `Explore ${name} and review the current terms before making a purchase.`,
  rating: 4.5,
  audiences: index % 2 ? ["student"] : ["teacher", "military"],
}));

export const mockCatalog: Catalog = {
  stores,
  categories,
  coupons: stores.flatMap((store, index) =>
    [0, 1].map((variant) => ({
      id: index * 2 + variant + 1,
      slug: `${store.slug}-offer-${variant + 1}`,
      title: variant
        ? "Free shipping on your next order"
        : "Selected styles promotion",
      description: "Illustrative fixture retained for backward compatibility.",
      type: variant ? ("sale" as const) : ("code" as const),
      code: variant ? undefined : "ZENDEMO",
      discount: variant ? "FREE SHIPPING" : "PROMOTION",
      expires: index === 0 ? "2026-10-08T23:59:59Z" : "2027-12-31T23:59:59Z",
      is_expired: index === 11 && variant === 1,
      free_shipping: Boolean(variant),
      exclusive: index % 3 === 0,
      used: 125 + index * 37,
      percent_success: 94,
      store,
      categories: [store.category],
      go_url: `https://www.${store.slug.replace("-", "")}.com`,
      verified: false,
    })),
  ),
  posts: [
    {
      id: 1,
      slug: "a-smarter-daily-routine",
      title: "Small routines that make busy days feel lighter",
      excerpt:
        "A practical way to plan your week without filling every minute.",
      content:
        "Start with the few outcomes that matter most, leave room for changes and review what worked at the end of the week. A useful routine should reduce decisions rather than create another demanding checklist.",
      category: "Buying guides",
      date: "2026-10-01",
    },
    {
      id: 2,
      slug: "how-to-read-a-product-review",
      title: "How to read a product review critically",
      excerpt:
        "The details that separate useful evidence from confident marketing.",
      content:
        "Look for clear testing conditions, long-term observations and limits that match your own needs. Strong reviews explain who a product suits, where it falls short and which claims can be checked independently.",
      category: "Reviews",
      date: "2026-10-02",
    },
    {
      id: 3,
      slug: "subscription-box-checklist",
      title: "Is that subscription box worth it?",
      excerpt: "A practical checklist before you subscribe.",
      content:
        "Compare the contents with what you actually use. Check renewal pricing, delivery frequency and cancellation terms before starting a subscription.",
      category: "Subscription boxes",
      date: "2026-10-03",
    },
  ],
};
