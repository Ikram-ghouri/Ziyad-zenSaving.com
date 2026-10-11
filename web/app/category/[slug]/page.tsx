import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostCategory } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { TermArchive } from "@/components/archive";
import { parsePage } from "@/components/post-card";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = parsePage((await searchParams).page);
  const term = await getPostCategory(slug);
  if (!term) return { title: "Category not found" };
  const path = `/category/${term.slug}`;
  return pageMetadata({
    title: page > 1 ? `${term.name} – page ${page}` : term.name,
    description:
      term.description || `Zen Saving articles about ${term.name.toLowerCase()}.`,
    path: page > 1 ? `${path}?page=${page}` : path,
  });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const term = await getPostCategory(slug);
  if (!term) notFound();
  return (
    <TermArchive kind="category" term={term} page={parsePage((await searchParams).page)} />
  );
}
