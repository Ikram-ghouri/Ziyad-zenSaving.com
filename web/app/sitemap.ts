import type { MetadataRoute } from "next";
import { getEditorialCatalog, siteUrl } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await getEditorialCatalog();
  const paths = [
    "",
    "categories",
    "about",
    "contact",
    "privacy-policy",
    "affiliate-disclosure",
    "terms",
  ];
  const urls = paths.map((path) => `${siteUrl}/${path}`);
  urls.push(...data.posts.map((post) => `${siteUrl}/blog/${post.slug}`));
  return urls.map((url) => ({
    url,
    lastModified: new Date(),
    changeFrequency: "weekly",
  }));
}
