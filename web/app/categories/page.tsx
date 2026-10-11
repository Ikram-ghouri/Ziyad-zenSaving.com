import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getEditorialCatalog } from "@/lib/data";
import { pageMetadata, seoKeywords } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Article Categories",
  description:
    "Browse Zen Saving articles by topic, including buying guides, reviews and practical everyday ideas.",
  path: "/categories",
  keywords: seoKeywords.blog,
});

export default async function Categories() {
  const { posts, categories } = await getEditorialCatalog();
  const topics = categories.length
    ? categories
    : [...new Set(posts.map((post) => post.category))];
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
        {topics.map((category, index) => (
          <Link
            key={category}
            href={`/search?q=${encodeURIComponent(category)}`}
          >
            <b>{String(index + 1).padStart(2, "0")}</b>
            <span>{category}</span>
            <ArrowRight />
          </Link>
        ))}
      </div>
    </>
  );
}
