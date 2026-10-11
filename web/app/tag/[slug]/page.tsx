import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPosts } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import type { Term } from "@/lib/types";
import { TermArchive } from "@/components/archive";
import { parsePage } from "@/components/post-card";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

/** Tags have no dedicated endpoint; the term is read from a tagged post. */
async function findTag(slug: string): Promise<Term | null> {
  const list = await getPosts({ tag: slug, perPage: 1 });
  const tag = list.items[0]?.tags.find((t) => t.slug === slug);
  return tag ? { ...tag, count: list.total } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const term = await findTag((await params).slug);
  if (!term) return { title: "Tag not found" };
  return pageMetadata({
    title: `#${term.name}`,
    description: `Zen Saving articles tagged ${term.name}.`,
    path: `/tag/${term.slug}`,
    // Thin tag archives are kept out of the index; categories carry the SEO weight.
    noindex: true,
  });
}

export default async function TagPage({ params, searchParams }: Props) {
  const term = await findTag((await params).slug);
  if (!term) notFound();
  return (
    <TermArchive kind="tag" term={term} page={parsePage((await searchParams).page)} />
  );
}
