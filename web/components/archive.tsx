import { notFound } from "next/navigation";
import { getPosts } from "@/lib/data";
import type { Term } from "@/lib/types";
import { Pagination, PostGrid } from "@/components/post-card";

/** Shared category / tag archive page. */
export async function TermArchive({
  kind,
  term,
  page,
}: {
  kind: "category" | "tag";
  term: Term;
  page: number;
}) {
  const list = await getPosts({ [kind]: term.slug, page, perPage: 12 });
  if (page > 1 && list.items.length === 0) notFound();
  return (
    <>
      <section className="page-hero">
        <span className="eyebrow">{kind === "category" ? "Category" : "Tag"}</span>
        <h1>{kind === "tag" ? `#${term.name}` : term.name}</h1>
        <p>
          {term.description ||
            `${list.total} ${list.total === 1 ? "article" : "articles"} about ${term.name.toLowerCase()}.`}
        </p>
      </section>
      <div className="content-wrap">
        <PostGrid posts={list.items} />
        {list.items.length === 0 && (
          <div className="empty">No articles here yet.</div>
        )}
        <Pagination
          page={page}
          totalPages={list.total_pages}
          basePath={`/${kind}/${term.slug}`}
        />
      </div>
    </>
  );
}
