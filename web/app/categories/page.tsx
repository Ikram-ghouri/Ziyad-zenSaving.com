import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPostCategories } from "@/lib/data";
import { pageMetadata, seoKeywords } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Article Categories",
  description:
    "Browse Zen Saving articles by topic, including buying guides, reviews and practical everyday ideas.",
  path: "/categories",
  keywords: seoKeywords.blog,
});

export default async function Categories() {
  const categories = await getPostCategories();
  return (
    <>
      <section className="page-hero">
        <span className="eyebrow">Explore by topic</span>
        <h1>Ideas for every decision</h1>
        <p>
          Browse practical guides, reviews and thoughtful advice organized
          around the subjects you care about.
        </p>
      </section>
      <div className="content-wrap blog-hub-grid">
        {categories.map((category, index) => (
          <Link key={category.id} href={`/category/${category.slug}`}>
            <b>{String(index + 1).padStart(2, "0")}</b>
            <span>
              {category.name} <small>({category.count})</small>
            </span>
            <ArrowRight />
          </Link>
        ))}
        {categories.length === 0 && (
          <div className="empty">No categories yet.</div>
        )}
      </div>
    </>
  );
}
