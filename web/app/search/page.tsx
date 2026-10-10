import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { getEditorialCatalog } from "@/lib/data";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = ((await searchParams).q || "").trim();
  const normalized = query.toLowerCase();
  const { posts } = await getEditorialCatalog();
  const results = normalized
    ? posts.filter((post) =>
        `${post.title} ${post.excerpt} ${post.category} ${post.content}`
          .toLowerCase()
          .includes(normalized),
      )
    : posts;
  return (
    <>
      <section className="page-hero">
        <span className="eyebrow">Search the journal</span>
        <h1>{query ? `Results for “${query}”` : "Explore every story"}</h1>
        <p>
          {results.length} {results.length === 1 ? "article" : "articles"}{" "}
          found.
        </p>
      </section>
      <div className="content-wrap">
        <div className="blog-story-grid">
          {results.map((post) => (
            <Link
              className="blog-story-card"
              href={`/blog/${post.slug}`}
              key={post.id}
            >
              <span>{post.category}</span>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <div className="blog-card-meta">
                <time>
                  {new Date(post.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
                <i>
                  <Clock size={13} /> 5 min read
                </i>
              </div>
              <small>
                Read article <ArrowRight size={15} />
              </small>
            </Link>
          ))}
        </div>
        {results.length === 0 && (
          <div className="empty">
            No articles match that search. Try a broader topic.
          </div>
        )}
      </div>
    </>
  );
}
