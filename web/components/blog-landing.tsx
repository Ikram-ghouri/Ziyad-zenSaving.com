import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { getEditorialCatalog } from "@/lib/data";
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
    title: "Subscription box guide",
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
  const { posts } = await getEditorialCatalog();
  const categories = [...new Set(posts.map((post) => post.category))];

  return (
    <>
      <section className="blog-showcase">
        <div className="blog-showcase-inner">
          <span>Thoughtful ideas start here</span>
          <h1>
            Good finds. <em>Better choices.</em>
          </h1>
          <p>
            Read practical guides, thoughtful reviews and useful ideas for
            making confident choices in everyday life.
          </p>
          <Link href="#stories">
            Explore latest stories <ArrowRight size={18} />
          </Link>
          <div className="blog-dots" aria-hidden="true">
            <i />
            <i />
          </div>
        </div>
      </section>

      {posts[0] && (
        <section className="blog-featured content-wrap">
          <header className="blog-section-title">
            <span>Editor&apos;s selection</span>
            <h2>
              Start with our <em>featured reads</em>
            </h2>
            <p>
              In-depth advice for making confident choices, understanding the
              details and finding ideas that work in everyday life.
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
                  you can apply to your next decision.
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
              : ["Buying guides", "Reviews", "Practical ideas"]
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
