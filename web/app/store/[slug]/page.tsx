import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getStore, siteName, siteUrl } from "@/lib/data";
import { wpMetadata } from "@/lib/seo";
import { safeUrl } from "@/lib/types";
import { CouponCard } from "@/components/coupon-card";
import { StoreLogo } from "@/components/store-grid";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const store = await getStore((await params).slug);
  if (!store) return { title: "Store not found" };
  return wpMetadata(store.seo, `/store/${store.slug}`);
}

export default async function StorePage({ params }: Props) {
  const store = await getStore((await params).slug);
  if (!store) notFound();

  const visit = safeUrl(store.aff_url) || safeUrl(store.url);
  const url = `${siteUrl}/store/${store.slug}`;
  const structured = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Stores", item: `${siteUrl}/stores` },
        { "@type": "ListItem", position: 3, name: store.name, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${store.name} coupons`,
      itemListElement: store.coupons.map((coupon, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Offer",
          name: coupon.title,
          description: coupon.description || undefined,
          validThrough: coupon.expires || undefined,
          seller: { "@type": "Organization", name: store.name },
        },
      })),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structured).replace(/</g, "\\u003c"),
        }}
      />
      <section className="shop-hero">
        <div className="shop-hero-inner">
          <StoreLogo name={store.name} logo={store.logo} size="lg" />
          <div>
            <div className="breadcrumbs" role="navigation" aria-label="Breadcrumb">
              <Link href="/">Home</Link> / <Link href="/stores">Stores</Link> /{" "}
              <span>{store.name}</span>
            </div>
            <h1>{store.seo.title || `${store.name} Coupons & Promo Codes`}</h1>
            <p>
              {store.coupons.length} active{" "}
              {store.coupons.length === 1 ? "offer" : "offers"} from {store.name},
              checked by the {siteName} team.
            </p>
            {visit && (
              <a
                className="primary-link"
                href={visit}
                target="_blank"
                rel="noopener noreferrer sponsored nofollow"
              >
                Visit {store.name} <ExternalLink size={15} />
              </a>
            )}
          </div>
        </div>
      </section>
      <div className="content-wrap store-layout">
        <section aria-labelledby="active-offers">
          <h2 id="active-offers">Active {store.name} coupons</h2>
          {store.coupons.length > 0 ? (
            <div className="coupon-list">
              {store.coupons.map((coupon) => (
                <CouponCard coupon={coupon} key={coupon.id} />
              ))}
            </div>
          ) : (
            <div className="empty">
              No active offers right now. Check back soon or browse{" "}
              <Link href="/stores">other stores</Link>.
            </div>
          )}
          {store.expired_coupons.length > 0 && (
            <details className="expired-coupons">
              <summary>
                Recently expired ({store.expired_coupons.length})
              </summary>
              <div className="coupon-list">
                {store.expired_coupons.map((coupon) => (
                  <CouponCard coupon={coupon} key={coupon.id} />
                ))}
              </div>
            </details>
          )}
        </section>
        {store.description && (
          <aside className="store-about">
            <h2>About {store.name}</h2>
            {store.description.split(/\n+/).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </aside>
        )}
      </div>
    </>
  );
}
