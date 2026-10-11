import { cache } from "react";
import { mockPages, mockPosts } from "@/mocks/catalog";
import type {
  Page,
  Post,
  PostList,
  RedirectRule,
  SitemapData,
  Term,
} from "./types";

/** Demo mode serves bundled sample content. Live mode never falls back to it. */
export const demo = process.env.USE_MOCK_DATA !== "false";
export const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Zen Saving";
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export class WordPressError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

const REVALIDATE_SECONDS = 600;

function apiBase() {
  const base = process.env.WP_API_URL;
  if (!base) throw new Error("WP_API_URL is required when USE_MOCK_DATA=false");
  return base.replace(/\/$/, "");
}

export async function wp<T>(path: string, tags: string[] = []): Promise<T> {
  const res = await fetch(`${apiBase()}/${path}`, {
    next: { revalidate: REVALIDATE_SECONDS, tags: ["wordpress", ...tags] },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    throw new WordPressError(
      `WordPress request failed: ${path} (${res.status})`,
      res.status,
    );
  }
  return res.json() as Promise<T>;
}

/** Returns null for a 404, rethrows anything else so errors are never hidden. */
async function wpOrNull<T>(path: string, tags: string[]): Promise<T | null> {
  try {
    return await wp<T>(path, tags);
  } catch (error) {
    if (error instanceof WordPressError && error.status === 404) return null;
    throw error;
  }
}

export type PostQuery = {
  page?: number;
  perPage?: number;
  category?: string;
  tag?: string;
  search?: string;
  exclude?: string;
};

function filterMockPosts(query: PostQuery): PostList {
  const perPage = query.perPage ?? 12;
  const page = Math.max(1, query.page ?? 1);
  const search = query.search?.toLowerCase();
  const all = mockPosts.filter(
    (post) =>
      (!query.category ||
        post.categories.some((c) => c.slug === query.category)) &&
      (!query.tag || post.tags.some((t) => t.slug === query.tag)) &&
      (!query.exclude || post.slug !== query.exclude) &&
      (!search ||
        `${post.title} ${post.excerpt} ${post.category}`
          .toLowerCase()
          .includes(search)),
  );
  return {
    items: all.slice((page - 1) * perPage, page * perPage).map((post) => ({
      ...post,
      content: undefined,
    })),
    page,
    per_page: perPage,
    total: all.length,
    total_pages: Math.max(1, Math.ceil(all.length / perPage)),
  };
}

export const getPosts = cache(
  async (query: PostQuery = {}): Promise<PostList> => {
    if (demo) return filterMockPosts(query);
    const params = new URLSearchParams();
    params.set("page", String(Math.max(1, query.page ?? 1)));
    params.set("per_page", String(query.perPage ?? 12));
    if (query.category) params.set("category", query.category);
    if (query.tag) params.set("tag", query.tag);
    if (query.search) params.set("search", query.search.slice(0, 100));
    if (query.exclude) params.set("exclude", query.exclude);
    return wp<PostList>(`posts?${params}`, ["posts"]);
  },
);

export const getPost = cache(async (slug: string): Promise<Post | null> => {
  if (demo) return mockPosts.find((post) => post.slug === slug) ?? null;
  return wpOrNull<Post>(`posts/${encodeURIComponent(slug)}`, [
    "posts",
    `post:${slug}`,
  ]);
});

export const getPostCategories = cache(async (): Promise<Term[]> => {
  if (demo) {
    const map = new Map<string, Term>();
    for (const post of mockPosts)
      for (const category of post.categories) map.set(category.slug, category);
    return [...map.values()];
  }
  return wp<Term[]>("post-categories", ["categories"]);
});

export const getPostCategory = cache(
  async (slug: string): Promise<Term | null> => {
    if (demo)
      return (
        (await getPostCategories()).find((term) => term.slug === slug) ?? null
      );
    return wpOrNull<Term>(`post-categories/${encodeURIComponent(slug)}`, [
      "categories",
    ]);
  },
);

export const getPage = cache(async (slug: string): Promise<Page | null> => {
  if (demo) return mockPages.find((page) => page.slug === slug) ?? null;
  return wpOrNull<Page>(`pages/${encodeURIComponent(slug)}`, ["pages"]);
});

export const getSitemap = cache(async (): Promise<SitemapData> => {
  if (demo)
    return {
      posts: mockPosts.map((post) => ({
        slug: post.slug,
        modified: post.modified,
        noindex: false,
      })),
      pages: mockPages.map((page) => ({
        slug: page.slug,
        modified: page.modified,
        noindex: false,
      })),
      categories: await getPostCategories(),
    };
  return wp<SitemapData>("sitemap", ["posts", "pages", "categories"]);
});

/** Redirect rules, fetched without the Next data cache so proxy.ts can use them. */
export async function fetchRedirects(): Promise<RedirectRule[]> {
  if (demo) return [];
  const res = await fetch(`${apiBase()}/redirects`, {
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new WordPressError("Redirects unavailable", res.status);
  const data = (await res.json()) as unknown;
  return Array.isArray(data) ? (data as RedirectRule[]) : [];
}
