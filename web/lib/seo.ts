import type { Metadata } from "next";
import type { Seo } from "./types";

export const seoKeywords = {
  home: [
    "practical guides",
    "honest reviews",
    "buying guides",
    "everyday ideas",
    "thoughtful living",
    "smart choices",
  ],
  blog: [
    "practical life tips",
    "shopping guides",
    "product reviews",
    "thoughtful shopping advice",
    "everyday decision guides",
  ],
};

export function pageMetadata({
  title,
  description,
  path,
  keywords,
  noindex = false,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noindex?: boolean;
}): Metadata {
  return {
    title,
    description,
    keywords,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: "website" },
    robots: noindex ? { index: false, follow: true } : undefined,
  };
}

/** Metadata from the WordPress (Yoast) SEO payload. */
export function wpMetadata(
  seo: Seo,
  path: string,
  type: "article" | "website" = "website",
  extra: { publishedTime?: string; modifiedTime?: string } = {},
): Metadata {
  const images = seo.og_image ? [{ url: seo.og_image }] : undefined;
  return {
    // Yoast titles already contain the site name, so skip the layout's "| Zen Saving" template.
    title: { absolute: seo.title },
    description: seo.description,
    // Canonical always points at the new frontend URL. A Yoast canonical that
    // still uses the old WordPress permalink would point Google at a redirect.
    alternates: { canonical: path },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: path,
      type,
      images,
      ...(type === "article" ? extra : {}),
    },
    twitter: { card: images ? "summary_large_image" : "summary" },
    robots: seo.noindex ? { index: false, follow: true } : undefined,
  };
}
