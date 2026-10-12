import Link from "next/link";
import { ExternalLink, Tag } from "lucide-react";
import { formatDate, safeUrl, type Coupon } from "@/lib/types";

/**
 * Offer row. Coupon codes are never shown on the site: every offer is a
 * "Get Deal" link to the affiliate URL (WordPress /out/{id}, so click
 * tracking keeps working).
 */
export function CouponCard({
  coupon,
  showStore = false,
}: {
  coupon: Coupon;
  showStore?: boolean;
}) {
  const url = safeUrl(coupon.go_url);

  return (
    <article className={`coupon-card${coupon.is_expired ? " expired" : ""}`}>
      {showStore && coupon.store ? (
        <Link href={`/store/${coupon.store.slug}`} className="coupon-store">
          {coupon.store.logo ? (
            // eslint-disable-next-line @next/next/no-img-element -- store logos come from WordPress
            <img src={coupon.store.logo} alt={`${coupon.store.name} logo`} loading="lazy" />
          ) : (
            <strong>{coupon.store.name}</strong>
          )}
          <small>{coupon.discount}</small>
        </Link>
      ) : (
        <div className="coupon-badge">
          <Tag size={16} />
          <span>{coupon.discount}</span>
        </div>
      )}
      <div className="coupon-body">
        <span className="coupon-type">
          Deal{showStore && coupon.store ? ` · ${coupon.store.name}` : ""}
        </span>
        <h3>{coupon.title}</h3>
        {coupon.description && <p>{coupon.description}</p>}
        <div className="coupon-meta">
          {coupon.expires && (
            <span>
              {coupon.is_expired ? "Expired" : "Expires"} {formatDate(coupon.expires)}
            </span>
          )}
          {coupon.used > 0 && <span>{coupon.used} used</span>}
          {coupon.verified && <span className="verified">Verified</span>}
        </div>
      </div>
      <div className="coupon-action">
        {url && (
          <a
            className="coupon-button deal"
            href={url}
            target="_blank"
            rel="noopener noreferrer sponsored nofollow"
          >
            Get Deal <ExternalLink size={15} />
          </a>
        )}
      </div>
    </article>
  );
}
