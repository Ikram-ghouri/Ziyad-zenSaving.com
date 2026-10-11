import type { Metadata } from "next";
import { getPosts } from "@/lib/data";
import { Pagination, PostGrid, parsePage } from "@/components/post-card";

type Props = { searchParams: Promise<{ q?: string; page?: string }> };

export const metadata: Metadata = {
  title: "Search",
  // Search result pages should never be indexed.
  robots: { index: false, follow: true },
};

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = (params.q || "").trim().slice(0, 100);
  const page = parsePage(params.page);
  const list = await getPosts({ search: query || undefined, page, perPage: 12 });
  return (
    <>
      <section className="page-hero">
        <span className="eyebrow">Search the journal</span>
        <h1>{query ? `Results for “${query}”` : "Explore every story"}</h1>
        <p>
          {list.total} {list.total === 1 ? "article" : "articles"} found.
        </p>
      </section>
      <div className="content-wrap">
        <PostGrid posts={list.items} />
        {list.items.length === 0 && (
          <div className="empty">
            No articles match that search. Try a broader topic.
          </div>
        )}
        <Pagination
          page={page}
          totalPages={list.total_pages}
          basePath="/search"
          query={query ? { q: query } : {}}
        />
      </div>
    </>
  );
}
