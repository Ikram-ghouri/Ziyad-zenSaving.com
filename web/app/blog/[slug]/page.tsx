import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CalendarDays, Clock, User } from "lucide-react";
import { notFound } from "next/navigation";
import { getPost, getPosts, siteName, siteUrl } from "@/lib/data";
import { sanitizeContent, withHeadingIds } from "@/lib/html";
import { wpMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/types";
import { PostGrid } from "@/components/post-card";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Article not found" };
  return wpMetadata(post.seo, `/blog/${post.slug}`, "article", {
    publishedTime: post.date,
    modifiedTime: post.modified,
  });
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const primary = post.categories[0];
  const related = (
    await getPosts({
      category: primary?.slug,
      exclude: post.slug,
      perPage: 4,
    })
  ).items
    .filter((item) => item.slug !== post.slug)
    .slice(0, 3);

  const { html, toc } = withHeadingIds(sanitizeContent(post.content || ""));
  const url = `${siteUrl}/blog/${post.slug}`;
  const articleData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seo.description || post.excerpt,
    datePublished: post.date,
    dateModified: post.modified,
    image: post.featured_image?.url || undefined,
    author: { "@type": "Person", name: post.author.name || `${siteName} editors` },
    publisher: { "@type": "Organization", name: siteName, url: siteUrl },
    mainEntityOfPage: url,
    articleSection: primary?.name,
    keywords: post.tags.map((tag) => tag.name).join(", ") || undefined,
  };
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      ...(primary
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: primary.name,
              item: `${siteUrl}/category/${primary.slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: primary ? 3 : 2,
        name: post.title,
        item: url,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([articleData, breadcrumbs]).replace(
            /</g,
            "\\u003c",
          ),
        }}
      />
      <section className="page-hero article-hero">
        {primary ? (
          <Link className="eyebrow" href={`/category/${primary.slug}`}>
            {primary.name}
          </Link>
        ) : (
          <span className="eyebrow">{post.category}</span>
        )}
        <h1>{post.title}</h1>
        {post.excerpt && <p>{post.excerpt}</p>}
        <div className="article-meta">
          <span>
            <CalendarDays size={15} />
            <time dateTime={post.date}>{formatDate(post.date, "long")}</time>
          </span>
          {post.modified && post.modified.slice(0, 10) !== post.date.slice(0, 10) && (
            <span>
              Updated{" "}
              <time dateTime={post.modified}>
                {formatDate(post.modified, "long")}
              </time>
            </span>
          )}
          <span>
            <Clock size={15} />
            {post.reading_time_minutes} minute read
          </span>
          {post.author.name && (
            <span>
              <User size={15} />
              By {post.author.name}
            </span>
          )}
        </div>
      </section>
      {post.featured_image && (
        <div className="content-wrap article-cover">
          <Image
            src={post.featured_image.url}
            alt={post.featured_image.alt || post.title}
            width={post.featured_image.width || 1200}
            height={post.featured_image.height || 675}
            sizes="(max-width: 1100px) 100vw, 1100px"
            priority
          />
        </div>
      )}
      <div className="article-shell content-wrap">
        {toc.length > 1 && (
          <aside className="article-toc">
            <strong>In this article</strong>
            {toc.map((item) => (
              <a href={`#${item.id}`} key={item.id}>
                {item.text}
              </a>
            ))}
          </aside>
        )}
        <article
          className="prose editorial-prose"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
      {post.tags.length > 0 && (
        <div className="content-wrap article-tags">
          {post.tags.map((tag) => (
            <Link href={`/tag/${tag.slug}`} key={tag.id}>
              #{tag.name}
            </Link>
          ))}
        </div>
      )}
      {related.length > 0 && (
        <section className="related-reading">
          <div className="content-wrap">
            <header className="blog-channel-head">
              <div>
                <span>Continue reading</span>
                <h2>More {primary ? primary.name.toLowerCase() : "articles"}</h2>
              </div>
              <Link href={primary ? `/category/${primary.slug}` : "/blog"}>
                Browse all <ArrowRight size={16} />
              </Link>
            </header>
            <PostGrid posts={related} />
          </div>
        </section>
      )}
    </>
  );
}
