"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Copy, ExternalLink, Tag } from "lucide-react";
import { formatDate, safeUrl, type Coupon } from "@/lib/types";

/**
 * Coupon row. "Get Code" reveals and copies the code, then opens the
 * affiliate link (WordPress /out/{id}, so click tracking keeps working).
 * "Get Deal" opens the affiliate link directly.
 */
export function CouponCard({
  coupon,
  showStore = false,
}: {
  coupon: Coupon;
  showStore?: boolean;
}) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const url = safeUrl(coupon.go_url);
  const isCode = coupon.type === "code" && coupon.code;

  async function copy() {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function getCode() {
    setRevealed(true);
    void copy();
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

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
          {isCode ? "Code" : "Deal"}
          {showStore && coupon.store ? ` · ${coupon.store.name}` : ""}
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
        {isCode ? (
          revealed ? (
            <button type="button" className="coupon-code-box" onClick={copy}>
              <code>{coupon.code}</code>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span className="sr-only">{copied ? "Copied" : "Copy code"}</span>
            </button>
          ) : (
            <button type="button" className="coupon-button" onClick={getCode}>
              <span className="peek" aria-hidden="true">
                {coupon.code.slice(-3)}
              </span>
              Get Code
            </button>
          )
        ) : url ? (
          <a
            className="coupon-button deal"
            href={url}
            target="_blank"
            rel="noopener noreferrer sponsored nofollow"
          >
            Get Deal <ExternalLink size={15} />
          </a>
        ) : null}
        {revealed && url && (
          <a
            className="coupon-visit"
            href={url}
            target="_blank"
            rel="noopener noreferrer sponsored nofollow"
          >
            Go to store <ExternalLink size={13} />
          </a>
        )}
      </div>
    </article>
  );
}
