import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Lightbulb,
} from "lucide-react";
import { notFound } from "next/navigation";
import { getCatalog } from "@/lib/data";

export default async function Post({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { posts } = await getCatalog();
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();
  const related = posts.filter((item) => item.slug !== post.slug).slice(0, 3);

  return (
    <>
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
          <a href="#plan">Plan before browsing</a>
          <a href="#compare">Compare the real total</a>
          <a href="#check">Check every condition</a>
          <a href="#decide">Make the final decision</a>
        </aside>
        <article className="prose editorial-prose">
          <p className="article-intro">{post.content}</p>
          <div className="article-callout">
            <Lightbulb />
            <div>
              <strong>The useful rule</strong>
              <p>
                A saving only counts when it reduces the cost of something you
                already intended to buy.
              </p>
            </div>
          </div>
          <h2 id="plan">Plan before you start browsing</h2>
          <p>
            Begin with the outcome you need and a comfortable spending limit. A
            short list keeps attractive promotions from turning into extra
            purchases. Note the size, features or delivery date that matter,
            then treat everything else as optional.
          </p>
          <p>
            When a retailer advertises a large percentage reduction, compare the
            sale price with similar products elsewhere. The original price alone
            does not tell you whether the offer is competitive.
          </p>
          <h2 id="compare">Compare the real total</h2>
          <p>
            Look beyond the number shown on the product page. Shipping, taxes,
            minimum order thresholds and membership fees can change which offer
            is best. Add every required cost before comparing two stores or two
            coupon codes.
          </p>
          <ul className="article-checklist">
            <li>
              <CheckCircle2 />
              Check delivery charges and arrival dates.
            </li>
            <li>
              <CheckCircle2 />
              Compare percentage discounts with fixed-value codes.
            </li>
            <li>
              <CheckCircle2 />
              Include subscription or membership requirements.
            </li>
            <li>
              <CheckCircle2 />
              Confirm the return window and any return shipping fee.
            </li>
          </ul>
          <h2 id="check">Check every offer condition</h2>
          <p>
            Coupon terms often exclude selected brands, new releases, sale items
            or particular regions. Read the current retailer terms and enter the
            code before committing to payment. If the total does not change as
            expected, remove the code and reassess the order.
          </p>
          <blockquote>
            Pause at checkout and ask: would I still buy this at today&apos;s
            final price without the countdown or promotional banner?
          </blockquote>
          <h2 id="decide">Make the final decision calmly</h2>
          <p>
            Give yourself a brief pause for non-essential purchases. Recheck the
            product, quantity, address and final total. A clear decision is more
            valuable than rushing to catch an offer that does not fit your
            original plan.
          </p>
          <div className="article-summary">
            <strong>Before you buy</strong>
            <ol>
              <li>Confirm the purchase was already planned.</li>
              <li>Compare the complete delivered price.</li>
              <li>Read exclusions and expiry information.</li>
              <li>Check returns and recurring charges.</li>
              <li>Save the order confirmation and terms.</li>
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
                <p>Practical ideas for your next shopping decision.</p>
              </div>
              <Link href="/blog">
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
