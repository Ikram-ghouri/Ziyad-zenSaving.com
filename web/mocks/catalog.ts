import type { Page, Post, Seo, Term } from "@/lib/types";

/**
 * Sample content for local demo mode (USE_MOCK_DATA=true) only.
 * The live site never falls back to this data.
 */

const reviews: Term = {
  id: 2,
  slug: "reviews",
  name: "Reviews",
  description: "Honest product and service reviews.",
  count: 2,
};
const guides: Term = {
  id: 3,
  slug: "buying-guides",
  name: "Buying guides",
  description: "Research and advice before you buy.",
  count: 1,
};
const savingTag: Term = {
  id: 10,
  slug: "saving-tips",
  name: "Saving tips",
  description: "",
  count: 2,
};

const seo = (title: string, description: string): Seo => ({
  title,
  description,
  canonical: "",
  og_image: "",
  noindex: false,
});

function post(
  id: number,
  slug: string,
  title: string,
  excerpt: string,
  categories: Term[],
  date: string,
  content: string,
): Post {
  return {
    id,
    slug,
    title,
    excerpt,
    content,
    date,
    modified: date,
    link: `/${slug}/`,
    featured_image: null,
    author: { name: "Zen Saving editors", slug: "editors" },
    category: categories[0]?.name ?? "Guides",
    categories,
    tags: [savingTag],
    reading_time_minutes: 4,
    seo: seo(title, excerpt),
  };
}

export const mockPosts: Post[] = [
  post(
    1,
    "how-to-read-a-product-review",
    "How to read a product review critically",
    "The details that separate useful evidence from confident marketing.",
    [reviews],
    "2026-10-02T09:00:00Z",
    "<p>Look for clear testing conditions, long-term observations and limits that match your own needs.</p><h2>What good reviews include</h2><ul><li>Who the product suits</li><li>Where it falls short</li><li>Claims you can check independently</li></ul>",
  ),
  post(
    2,
    "subscription-box-checklist",
    "Is that subscription box worth it?",
    "A practical checklist before you subscribe.",
    [guides],
    "2026-10-03T09:00:00Z",
    "<p>Compare the contents with what you actually use.</p><h2>Before you subscribe</h2><p>Check renewal pricing, delivery frequency and cancellation terms.</p>",
  ),
  post(
    3,
    "sample-headphones-review",
    "Sample review: everyday wireless headphones",
    "A demo article showing how reviews render on the new site.",
    [reviews],
    "2026-10-04T09:00:00Z",
    "<p>This is sample content for demo mode.</p><blockquote>Replace with real WordPress posts by setting USE_MOCK_DATA=false.</blockquote>",
  ),
];

function page(slug: string, title: string, content: string): Page {
  return {
    id: slug.length,
    slug,
    title,
    excerpt: "",
    content,
    date: "2026-10-01T00:00:00Z",
    modified: "2026-10-01T00:00:00Z",
    seo: seo(title, ""),
  };
}

export const mockPages: Page[] = [
  page("about-us", "About Zen Saving", "<p>Demo About page. The live site shows the WordPress “About Us” page.</p>"),
  page("contact-us", "Contact us", "<p>Demo Contact page.</p>"),
  page("privacy-policy", "Privacy policy", "<p>Demo Privacy policy.</p>"),
  page("term-and-conditions", "Terms and conditions", "<p>Demo Terms page.</p>"),
  page("affiliate-disclosure-policy", "Affiliate disclosure", "<p>Demo Affiliate disclosure.</p>"),
  page("faq", "FAQ", "<p>Demo FAQ.</p>"),
  page("community-guidelines", "Community guidelines", "<p>Demo Community guidelines.</p>"),
  page("careers", "Careers", "<p>Demo Careers page.</p>"),
];
