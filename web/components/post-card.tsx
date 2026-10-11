import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { formatDate, type Post } from "@/lib/types";

export function PostCard({ post }: { post: Post }) {
  return (
    <Link className="blog-story-card" href={`/blog/${post.slug}`}>
      {post.featured_image && (
        <Image
          className="blog-card-image"
          src={post.featured_image.url}
          alt={post.featured_image.alt || post.title}
          width={post.featured_image.width || 800}
          height={post.featured_image.height || 450}
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      )}
      <span>{post.category}</span>
      <h3>{post.title}</h3>
      <p>{post.excerpt}</p>
      <div className="blog-card-meta">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <i>
          <Clock size={13} /> {post.reading_time_minutes} min read
        </i>
      </div>
      <small>
        Read article <ArrowRight size={15} />
      </small>
    </Link>
  );
}

export function PostGrid({ posts }: { posts: Post[] }) {
  return (
    <div className="blog-story-grid">
      {posts.map((post) => (
        <PostCard post={post} key={post.id} />
      ))}
    </div>
  );
}

export function Pagination({
  page,
  totalPages,
  basePath,
  query = {},
}: {
  page: number;
  totalPages: number;
  basePath: string;
  query?: Record<string, string>;
}) {
  if (totalPages <= 1) return null;
  const href = (n: number) => {
    const params = new URLSearchParams(query);
    if (n > 1) params.set("page", String(n));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  return (
    <nav className="pagination" aria-label="Pagination">
      {page > 1 && (
        <Link href={href(page - 1)} rel="prev">
          ← Newer
        </Link>
      )}
      <span>
        Page {page} of {totalPages}
      </span>
      {page < totalPages && (
        <Link href={href(page + 1)} rel="next">
          Older →
        </Link>
      )}
    </nav>
  );
}

export function parsePage(value: string | undefined): number {
  const n = Number.parseInt(value || "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}
