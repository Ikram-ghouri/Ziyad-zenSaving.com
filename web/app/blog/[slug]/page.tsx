import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Lightbulb,
} from "lucide-react";
import { notFound } from "next/navigation";
import { getEditorialCatalog, siteName, siteUrl } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { posts } = await getEditorialCatalog();
  const post = posts.find((item) => item.slug === slug);
  if (!post) return { title: "Article" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function Post({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { posts } = await getEditorialCatalog();
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();
  const related = posts.filter((item) => item.slug !== post.slug).slice(0, 3);
  const articleData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { "@type": "Organization", name: `${siteName} editors` },
    publisher: { "@type": "Organization", name: siteName },
    mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleData).replace(/</g, "\\u003c"),
        }}
      />
      <section className="page-hero article-hero">
        <span className="eyebrow">{post.category}</span>
        <h1>{post.title}</h1>
        <p>{post.excerpt}</p>
        <div className="article-meta">
          <span>
            <CalendarDays size={15} />
            {new Date(post.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span>
            <Clock size={15} />6 minute read
          </span>
          <span>By Zen Saving editors</span>
        </div>
      </section>
      <div className="article-shell content-wrap">
        <aside className="article-toc">
          <strong>In this guide</strong>
          <a href="#plan">Start with the question</a>
          <a href="#compare">Compare the evidence</a>
          <a href="#check">Check the details</a>
          <a href="#decide">Choose with confidence</a>
        </aside>
        <article className="prose editorial-prose">
          <p className="article-intro">{post.content}</p>
          <div className="article-callout">
            <Lightbulb />
            <div>
              <strong>The useful rule</strong>
              <p>
                The best choice is the one that fits your needs after the noise
                and urgency have been removed.
              </p>
            </div>
          </div>
          <h2 id="plan">Start with the question you need to answer</h2>
          <p>
            Begin with the outcome you need. Write down the few qualities that
            would make an option useful, comfortable or worthwhile in your
            everyday life. Treat everything else as optional until it proves
            relevant.
          </p>
          <p>
            Clear criteria make research easier. They help you separate a
            meaningful improvement from a feature that only sounds impressive in
            a headline.
          </p>
          <h2 id="compare">Compare the evidence, not just the claims</h2>
          <p>
            Look for details that can be checked: materials, dimensions,
            maintenance, long-term cost, independent testing and how an option
            performs in normal use. Give more weight to evidence that matches
            your situation.
          </p>
          <ul className="article-checklist">
            <li>
              <CheckCircle2 />
              Compare the features that affect your actual use.
            </li>
            <li>
              <CheckCircle2 />
              Separate essential qualities from convenient extras.
            </li>
            <li>
              <CheckCircle2 />
              Include setup, upkeep and recurring requirements.
            </li>
            <li>
              <CheckCircle2 />
              Check warranties, support and return conditions.
            </li>
          </ul>
          <h2 id="check">Check the details before you decide</h2>
          <p>
            Specifications, policies and availability can change. Confirm the
            current details with the original source, especially when size,
            compatibility, safety or ongoing costs affect the decision.
          </p>
          <blockquote>
            Pause and ask: does this option solve the original problem, or did
            the presentation change what I thought I needed?
          </blockquote>
          <h2 id="decide">Choose with confidence</h2>
          <p>
            Give yourself a brief pause before committing. Revisit your original
            criteria and choose the option that meets them with the fewest
            compromises. A calm decision is more useful than one driven by
            novelty or urgency.
          </p>
          <div className="article-summary">
            <strong>Before you choose</strong>
            <ol>
              <li>Restate the result you need.</li>
              <li>Compare the qualities that matter most.</li>
              <li>Verify important claims with primary sources.</li>
              <li>Consider maintenance and long-term effort.</li>
              <li>Take a pause, then make the decision.</li>
            </ol>
          </div>
        </article>
      </div>
      {related.length > 0 && (
        <section className="related-reading">
          <div className="content-wrap">
            <header className="blog-channel-head">
              <div>
                <span>Continue reading</span>
                <h2>More useful guides</h2>
                <p>Practical ideas for your next decision.</p>
              </div>
              <Link href="/#stories">
                Browse all articles <ArrowRight size={16} />
              </Link>
            </header>
            <div className="blog-story-grid">
              {related.map((item) => (
                <Link
                  className="blog-story-card"
                  href={`/blog/${item.slug}`}
                  key={item.id}
                >
                  <span>{item.category}</span>
                  <h3>{item.title}</h3>
                  <p>{item.excerpt}</p>
                  <small>
                    Read article <ArrowRight size={15} />
                  </small>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
