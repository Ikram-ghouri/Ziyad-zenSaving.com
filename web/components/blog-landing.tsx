import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { CouponCard } from "@/components/interactive";
import { demo, getCatalog } from "@/lib/data";
import type { Post } from "@/lib/types";

const channels = [
  {
    title: "Latest product reviews",
    category: "Reviews",
    intro: "Clear opinions that help you compare before you buy.",
  },
  {
    title: "Expert buying guides",
    category: "Buying guides",
    intro: "Useful research and practical advice for confident choices.",
  },
  {
    title: "Subscription box savings",
    category: "Subscription boxes",
    intro: "Know what is worth subscribing to before you commit.",
  },
];

function StoryCard({ post }: { post: Post }) {
  return (
    <Link className="blog-story-card" href={`/blog/${post.slug}`}>
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
  );
}

export default async function BlogLanding() {
  const { posts, stores, coupons } = await getCatalog();
  const categories = [...new Set(posts.map((post) => post.category))];
  const topOffers = [...coupons]
    .filter((coupon) => !coupon.is_expired)
    .sort((a, b) => b.percent_success - a.percent_success || b.used - a.used)
    .slice(0, 3);

  return (
    <>
      {demo && (
        <div className="demo-banner">
          Preview mode · Offers shown here are sample content
        </div>
      )}
      <section className="blog-showcase">
        <div className="blog-showcase-inner">
          <span>Smarter savings start here</span>
          <h1>
            Good finds. <em>Better choices.</em>
          </h1>
          <p>
            Discover current offers, trusted stores and practical guidance for
            spending thoughtfully and saving on the things you already need.
          </p>
          <Link href="#top-offers">
            Explore today&apos;s offers <ArrowRight size={18} />
          </Link>
          <div className="blog-dots" aria-hidden="true">
            <i />
            <i />
          </div>
        </div>
      </section>

      <section className="blog-store-strip content-wrap">
        <header className="blog-section-title">
          <span>Popular right now</span>
          <h2>
            Explore our <em>featured stores</em>
          </h2>
        </header>
        <div className="blog-store-row">
          {stores.slice(0, 8).map((store) => (
            <Link href={`/store/${store.slug}`} key={store.id}>
              <b>{store.name.slice(0, 2).toUpperCase()}</b>
              <span>{store.name}</span>
            </Link>
          ))}
        </div>
        <Link className="blog-outline-link" href="/stores">
          View all stores <ArrowRight size={16} />
        </Link>
      </section>

      {topOffers.length > 0 && (
        <section className="blog-deals" id="top-offers">
          <div className="content-wrap">
            <header className="blog-section-title">
              <span>Handpicked savings</span>
              <h2>
                Today&apos;s <em>top offers</em>
              </h2>
              <p>
                Start with popular offers, then open a store to compare every
                available code and deal.
              </p>
            </header>
            <div className="coupon-grid">
              {topOffers.map((coupon) => (
                <CouponCard key={coupon.id} coupon={coupon} demo={demo} />
              ))}
            </div>
            <Link className="blog-outline-link" href="/deals">
              Explore all deals <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}

      {posts[0] && (
        <section className="blog-featured content-wrap">
          <header className="blog-section-title">
            <span>Editor&apos;s selection</span>
            <h2>
              Start with our <em>featured reads</em>
            </h2>
            <p>
              In-depth advice for making confident choices, avoiding common
              checkout mistakes and getting more from every budget.
            </p>
          </header>
          <div className="blog-editorial-grid">
            <Link className="blog-lead-story" href={`/blog/${posts[0].slug}`}>
              <span>{posts[0].category}</span>
              <div>
                <small>Featured guide · 7 min read</small>
                <h2>{posts[0].title}</h2>
                <p>
                  {posts[0].excerpt} We break the process into practical steps
                  you can use before your next purchase.
                </p>
                <b>
                  Continue reading <ArrowRight size={17} />
                </b>
              </div>
            </Link>
            <div className="blog-side-stories">
              {posts.slice(1, 3).map((post) => (
                <StoryCard post={post} key={`featured-${post.id}`} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="blog-hubs">
        <div className="content-wrap">
          <header className="blog-section-title light">
            <span>Featured hubs</span>
            <h2>
              Explore our <em>top categories</em>
            </h2>
          </header>
          <div className="blog-hub-grid">
            {(categories.length
              ? categories
              : ["Buying guides", "Reviews", "Saving tips"]
            )
              .slice(0, 3)
              .map((category, index) => (
                <Link
                  href={`/search?q=${encodeURIComponent(category)}`}
                  key={category}
                >
                  <b>0{index + 1}</b>
                  <span>{category}</span>
                  <ArrowRight />
                </Link>
              ))}
          </div>
        </div>
      </section>

      <section className="content-wrap blog-channels" id="stories">
        {channels.map((channel) => {
          const matching = posts.filter(
            (post) =>
              post.category.toLowerCase() === channel.category.toLowerCase(),
          );
          const stories = matching.length ? matching : posts;
          return (
            <section className="blog-channel" key={channel.category}>
              <div className="blog-channel-head">
                <div>
                  <span>{channel.category}</span>
                  <h2>{channel.title}</h2>
                  <p>{channel.intro}</p>
                </div>
                <Link
                  href={`/search?q=${encodeURIComponent(channel.category)}`}
                >
                  View all <ArrowRight size={16} />
                </Link>
              </div>
              <div className="blog-story-grid">
                {stories.slice(0, 3).map((post) => (
                  <StoryCard
                    post={post}
                    key={`${channel.category}-${post.id}`}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </section>
    </>
  );
}
