import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCouponCategories, getPostCategories } from "@/lib/data";
import { pageMetadata, seoKeywords } from "@/lib/seo";
import type { CouponCategory, Term } from "@/lib/types";

export const metadata = pageMetadata({
  title: "Categories – Coupons by Category & Blog Topics",
  description:
    "Browse coupon codes and deals by shopping category, or read our guides and reviews by topic.",
  path: "/categories",
  keywords: seoKeywords.blog,
});

export default async function Categories() {
  // Each list is optional so one failing endpoint doesn't hide the other.
  const [shop, topics] = await Promise.all([
    getCouponCategories().catch((): CouponCategory[] => []),
    getPostCategories().catch((): Term[] => []),
  ]);
  const featured = shop.filter((c) => c.image).sort((a, b) => b.count - a.count);
  const rest = shop
    .filter((c) => !c.image)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <section className="page-hero">
        <span className="eyebrow">Explore by category</span>
        <h1>Shop by category</h1>
        <p>
          {shop.length} shopping categories with coupons and deals, plus our
          guides and reviews by topic.
        </p>
      </section>
      <div className="content-wrap">
        {featured.length > 0 && (
          <ul className="category-grid">
            {featured.map((c) => (
              <li key={c.id}>
                <Link href={`/coupon-category/${c.slug}`} className="category-tile">
                  {/* eslint-disable-next-line @next/next/no-img-element -- category images come from WordPress */}
                  <img src={c.image} alt="" loading="lazy" />
                  <span>
                    <strong>{c.name}</strong>
                    <small>{c.count} offers</small>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {rest.length > 0 && (
          <>
            <h2 className="section-heading">All categories</h2>
            <ul className="category-list">
              {rest.map((c) => (
                <li key={c.id}>
                  <Link href={`/coupon-category/${c.slug}`}>
                    {c.name}
                    {c.parent && <em> · {c.parent}</em>}
                    <small>{c.count}</small>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
        {topics.length > 0 && (
          <>
            <h2 className="section-heading">Blog topics</h2>
            <div className="blog-hub-grid">
              {topics.map((topic, index) => (
                <Link key={topic.id} href={`/category/${topic.slug}`}>
                  <b>{String(index + 1).padStart(2, "0")}</b>
                  <span>
                    {topic.name} <small>({topic.count})</small>
                  </span>
                  <ArrowRight />
                </Link>
              ))}
            </div>
          </>
        )}
        {shop.length === 0 && topics.length === 0 && (
          <div className="empty">No categories yet.</div>
        )}
      </div>
    </>
  );
}
