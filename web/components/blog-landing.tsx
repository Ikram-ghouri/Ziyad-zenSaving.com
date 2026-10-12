import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPostCategories, getPosts, getSite, wpOrigins } from "@/lib/data";
import { toInternalHref, type SiteInfo } from "@/lib/types";
import { PostCard } from "@/components/post-card";
import { HeroCarousel } from "@/components/hero-carousel";
import { StoreGrid } from "@/components/store-grid";

const intros: Record<string, string> = {
  reviews: "Clear opinions that help you compare before you buy.",
  "buying-guides": "Useful research and practical advice for confident choices.",
  "subscription-boxes": "Know what is worth subscribing to before you commit.",
};

export default async function BlogLanding() {
  const [latest, categories, site] = await Promise.all([
    getPosts({ perPage: 9 }),
    getPostCategories(),
    // Branding/banners are optional: if they fail, the blog still renders.
    getSite().catch((): SiteInfo | null => null),
  ]);
  const origins = wpOrigins();
  const slides = (site?.slider.slides ?? []).map((slide) => ({
    ...slide,
    href: toInternalHref(slide.href, origins),
  }));
  const posts = latest.items;
  const channels = categories.filter((c) => c.count > 0).slice(0, 3);
  const channelPosts = await Promise.all(
    channels.map((category) =>
      getPosts({ category: category.slug, perPage: 3 }),
    ),
  );

  return (
    <>
      {slides.length > 0 ? (
        <div className="content-wrap hero-wrap">
          <h1 className="sr-only">
            {site?.name || "Zen Saving"} – coupons, promo codes and saving guides
          </h1>
          <HeroCarousel slides={slides} intervalMs={site?.slider.autoplay_ms || 3000} />
        </div>
      ) : (
        <section className="blog-showcase">
          <div className="blog-showcase-inner">
            <span>Thoughtful ideas start here</span>
            <h1>
              Good finds. <em>Better choices.</em>
            </h1>
            <p>
              Coupons, promo codes and practical guides for making confident
              choices in everyday life.
            </p>
            <Link href="/stores">
              Browse all stores <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      )}

      {site && site.popular_stores.length > 0 && (
        <section className="content-wrap popular-stores">
          <div className="blog-channel-head">
            <div>
              <span>Popular stores</span>
              <h2>Top stores with coupons today</h2>
              <p>
                {site.store_count.toLocaleString("en-US")} stores and counting.
              </p>
            </div>
            <Link href="/stores">
              View all stores <ArrowRight size={16} />
            </Link>
          </div>
          <StoreGrid stores={site.popular_stores} />
        </section>
      )}

      {posts[0] && (
        <section className="blog-featured content-wrap">
          <header className="blog-section-title">
            <span>Editor&apos;s selection</span>
            <h2>
              Start with our <em>featured reads</em>
            </h2>
          </header>
          <div className="blog-editorial-grid">
            <Link
              className={`blog-lead-story${posts[0].featured_image ? " has-image" : ""}`}
              href={`/blog/${posts[0].slug}`}
              style={
                posts[0].featured_image
                  ? { backgroundImage: `url(${JSON.stringify(posts[0].featured_image.url)})` }
                  : undefined
              }
            >
              <span>{posts[0].category}</span>
              <div>
                <small>
                  Featured · {posts[0].reading_time_minutes} min read
                </small>
                <h2>{posts[0].title}</h2>
                <p>{posts[0].excerpt}</p>
                <b>
                  Continue reading <ArrowRight size={17} />
                </b>
              </div>
            </Link>
            <div className="blog-side-stories">
              {posts.slice(1, 3).map((post) => (
                <PostCard post={post} key={`featured-${post.id}`} />
              ))}
            </div>
          </div>
        </section>
      )}

      {categories.length > 0 && (
        <section className="blog-hubs">
          <div className="content-wrap">
            <header className="blog-section-title light">
              <span>Featured hubs</span>
              <h2>
                Explore our <em>top categories</em>
              </h2>
            </header>
            <div className="blog-hub-grid">
              {categories.slice(0, 3).map((category, index) => (
                <Link href={`/category/${category.slug}`} key={category.id}>
                  <b>0{index + 1}</b>
                  <span>{category.name}</span>
                  <ArrowRight />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="content-wrap blog-channels" id="stories">
        {channels.length === 0 && posts.length > 0 && (
          <section className="blog-channel">
            <div className="blog-channel-head">
              <div>
                <span>Latest</span>
                <h2>Latest stories</h2>
              </div>
              <Link href="/blog">
                View all <ArrowRight size={16} />
              </Link>
            </div>
            <div className="blog-story-grid">
              {posts.slice(0, 6).map((post) => (
                <PostCard post={post} key={`latest-${post.id}`} />
              ))}
            </div>
          </section>
        )}
        {channels.map((category, index) => (
          <section className="blog-channel" key={category.id}>
            <div className="blog-channel-head">
              <div>
                <span>{category.name}</span>
                <h2>Latest {category.name.toLowerCase()}</h2>
                <p>
                  {category.description ||
                    intros[category.slug] ||
                    `Our newest articles about ${category.name.toLowerCase()}.`}
                </p>
              </div>
              <Link href={`/category/${category.slug}`}>
                View all <ArrowRight size={16} />
              </Link>
            </div>
            <div className="blog-story-grid">
              {channelPosts[index].items.map((post) => (
                <PostCard post={post} key={`${category.slug}-${post.id}`} />
              ))}
            </div>
          </section>
        ))}
        {posts.length === 0 && (
          <div className="empty">No articles have been published yet.</div>
        )}
      </section>
    </>
  );
}
