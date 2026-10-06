import type { MetadataRoute } from "next";
import { getCatalog, siteUrl } from "@/lib/data";
import { audiences } from "@/lib/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await getCatalog();
  const paths = [
    "",
    "stores",
    "deals",
    "discounts",
    "categories",
    "about",
    "contact",
    "privacy-policy",
    "affiliate-disclosure",
    "terms",
  ];
  const urls = paths.map((path) => `${siteUrl}/${path}`);
  urls.push(
    ...data.stores.map((store) => `${siteUrl}/store/${store.slug}`),
    ...data.posts.map((post) => `${siteUrl}/blog/${post.slug}`),
    ...data.categories.map(
      (category) =>
        `${siteUrl}/coupon-category/${encodeURIComponent(category.toLowerCase().replaceAll(" ", "-"))}`,
    ),
    ...audiences.map((audience) => `${siteUrl}/discounts/${audience}`),
  );
  return urls.map((url) => ({
    url,
    lastModified: new Date(),
    changeFrequency: "weekly",
  }));
}
