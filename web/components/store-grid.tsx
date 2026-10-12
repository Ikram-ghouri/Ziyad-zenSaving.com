import Link from "next/link";
import type { StoreSummary } from "@/lib/types";

export function StoreLogo({
  name,
  logo,
  size = "md",
}: {
  name: string;
  logo: string;
  size?: "md" | "lg";
}) {
  if (!logo) {
    return (
      <span className={`store-logo store-logo-fallback ${size}`} aria-hidden="true">
        {name.trim().charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- store logos come from WordPress uploads
    <img
      className={`store-logo ${size}`}
      src={logo}
      alt={`${name} logo`}
      loading="lazy"
      decoding="async"
    />
  );
}

export function StoreGrid({ stores }: { stores: StoreSummary[] }) {
  return (
    <ul className="store-grid">
      {stores.map((store) => (
        <li key={store.id}>
          <Link href={`/store/${store.slug}`} className="store-card">
            <StoreLogo name={store.name} logo={store.logo} />
            <strong>{store.name}</strong>
            {store.count > 0 && (
              <small>
                {store.count} {store.count === 1 ? "offer" : "offers"}
              </small>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
