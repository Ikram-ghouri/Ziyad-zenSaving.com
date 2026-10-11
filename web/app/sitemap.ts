import type { MetadataRoute } from "next";
import { getSitemap, siteUrl } from "@/lib/data";
import { pageSlugs } from "@/lib/types";

export const revalidate = 900;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await getSitemap();
  const routeBySlug = Object.fromEntries(
    Object.entries(pageSlugs).map(([route, slug]) => [slug, route]),
  ) as Record<string, string>;
  const newest = data.posts[0]?.modified;

  const entries: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: newest, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/blog`, lastModified: newest, changeFrequency: "daily" },
    { url: `${siteUrl}/categories`, changeFrequency: "weekly" },
  ];
  for (const post of data.posts) {
    if (post.noindex) continue;
    entries.push({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: post.modified,
      changeFrequency: "weekly",
    });
  }
  for (const category of data.categories) {
    entries.push({
      url: `${siteUrl}/category/${category.slug}`,
      changeFrequency: "weekly",
    });
  }
  for (const page of data.pages) {
    const route = routeBySlug[page.slug];
    if (!route || page.noindex) continue;
    entries.push({
      url: `${siteUrl}/${route}`,
      lastModified: page.modified,
      changeFrequency: "monthly",
    });
  }
  return entries;
}
