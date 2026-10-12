import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCouponCategory, siteUrl } from "@/lib/data";
import { wpMetadata } from "@/lib/seo";
import { CouponCard } from "@/components/coupon-card";
import { Pagination, parsePage } from "@/components/post-card";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const page = parsePage((await searchParams).page);
  const category = await getCouponCategory((await params).slug, page);
  if (!category) return { title: "Category not found" };
  const meta = wpMetadata(category.seo, `/coupon-category/${category.slug}`);
  return page > 1 ? { ...meta, robots: { index: false, follow: true } } : meta;
}

export default async function CouponCategoryPage({ params, searchParams }: Props) {
  const page = parsePage((await searchParams).page);
  const category = await getCouponCategory((await params).slug, page);
  if (!category) notFound();

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Categories", item: `${siteUrl}/categories` },
      { "@type": "ListItem", position: 3, name: category.name, item: `${siteUrl}/coupon-category/${category.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbs).replace(/</g, "\\u003c"),
        }}
      />
      <section className="page-hero">
        <span className="eyebrow">
          <Link href="/categories">Categories</Link>
          {category.parent ? ` / ${category.parent}` : ""}
        </span>
        <h1>{category.name} coupons &amp; deals</h1>
        <p>
          {category.description ||
            `${category.total} active ${category.name.toLowerCase()} offers from our stores.`}
        </p>
      </section>
      <div className="content-wrap">
        {category.coupons.length > 0 ? (
          <div className="coupon-list">
            {category.coupons.map((coupon) => (
              <CouponCard coupon={coupon} key={coupon.id} showStore />
            ))}
          </div>
        ) : (
          <div className="empty">
            No active offers in this category right now. Browse{" "}
            <Link href="/stores">all stores</Link>.
          </div>
        )}
        <Pagination
          page={page}
          totalPages={category.total_pages}
          basePath={`/coupon-category/${category.slug}`}
        />
      </div>
    </>
  );
}
