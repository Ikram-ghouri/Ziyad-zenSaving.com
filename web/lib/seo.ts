import type { Metadata } from "next";

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
  keywords: string[];
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
