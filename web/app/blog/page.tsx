import type { Metadata } from "next";
import { getPosts } from "@/lib/data";
import { pageMetadata, seoKeywords } from "@/lib/seo";
import { Pagination, PostGrid, parsePage } from "@/components/post-card";

type Props = { searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const page = parsePage((await searchParams).page);
  return pageMetadata({
    title: page > 1 ? `All articles – page ${page}` : "All articles",
    description:
      "Every Zen Saving guide, review and practical idea, newest first.",
    path: page > 1 ? `/blog?page=${page}` : "/blog",
    keywords: seoKeywords.blog,
  });
}

export default async function BlogIndex({ searchParams }: Props) {
  const page = parsePage((await searchParams).page);
  const list = await getPosts({ page, perPage: 12 });
  return (
    <>
      <section className="page-hero">
        <span className="eyebrow">The journal</span>
        <h1>All articles</h1>
        <p>
          {list.total} {list.total === 1 ? "article" : "articles"}, newest
          first.
        </p>
      </section>
      <div className="content-wrap">
        <PostGrid posts={list.items} />
        {list.items.length === 0 && (
          <div className="empty">No articles on this page.</div>
        )}
        <Pagination page={page} totalPages={list.total_pages} basePath="/blog" />
      </div>
    </>
  );
}
