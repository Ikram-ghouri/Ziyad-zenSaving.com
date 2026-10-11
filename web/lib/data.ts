import { cache } from "react";
import { mockCatalog } from "@/mocks/catalog";
import type { Catalog, EditorialCatalog } from "./types";
export const demo = process.env.USE_MOCK_DATA !== "false";
export const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Zen Saving";
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export async function wp<T>(path: string): Promise<T> {
  if (!process.env.WP_API_URL)
    throw new Error("WP_API_URL is required in live mode");
  const res = await fetch(
    `${process.env.WP_API_URL.replace(/\/$/, "")}/${path}`,
    {
      next: { revalidate: 600, tags: ["wordpress"] },
      signal: AbortSignal.timeout(15000),
    },
  );
  if (!res.ok) throw new Error(`WordPress request failed (${res.status})`);
  return res.json();
}
export const getCatalog = cache(async (): Promise<Catalog> => {
  if (demo) return mockCatalog;
  try {
    const [stores, coupons, posts, categories] = await Promise.all([
      wp<Catalog["stores"] | { items: Catalog["stores"] }>(
        "stores?per_page=100",
      ),
      wp<Catalog["coupons"] | { items: Catalog["coupons"] }>(
        "coupons?per_page=100&active_only=false",
      ),
      wp<Catalog["posts"] | { items: Catalog["posts"] }>("posts?per_page=100"),
      wp<(string | { name: string })[]>("categories"),
    ]);
    const items = <T>(v: T[] | { items: T[] }) =>
      Array.isArray(v) ? v : v.items;
    return {
      stores: items(stores),
      coupons: items(coupons),
      posts: items(posts),
      categories: categories.map((c) => (typeof c === "string" ? c : c.name)),
    };
  } catch (error) {
    console.warn(
      "WordPress catalog unavailable; using bundled fallback content.",
      error instanceof Error ? error.message : error,
    );
    return mockCatalog;
  }
});
export const getEditorialCatalog = cache(
  async (): Promise<EditorialCatalog> => {
    if (demo)
      return {
        posts: mockCatalog.posts,
        categories: [
          ...new Set(mockCatalog.posts.map((post) => post.category)),
        ],
      };
    try {
      const [posts, categories] = await Promise.all([
        wp<Catalog["posts"] | { items: Catalog["posts"] }>(
          "posts?per_page=100",
        ),
        wp<(string | { name: string })[]>("categories"),
      ]);
      return {
        posts: Array.isArray(posts) ? posts : posts.items,
        categories: categories.map((category) =>
          typeof category === "string" ? category : category.name,
        ),
      };
    } catch (error) {
      console.warn(
        "WordPress editorial content unavailable; using bundled fallback content.",
        error instanceof Error ? error.message : error,
      );
      return {
        posts: mockCatalog.posts,
        categories: [
          ...new Set(mockCatalog.posts.map((post) => post.category)),
        ],
      };
    }
  },
);
export const getPage = cache(
  async (
    slug: string,
  ): Promise<{ title: string; excerpt: string; content: string } | null> => {
    if (demo) return null;
    try {
      return await wp<{ title: string; excerpt: string; content: string }>(
        `pages/${encodeURIComponent(slug)}`,
      );
    } catch {
      return null;
    }
  },
);
