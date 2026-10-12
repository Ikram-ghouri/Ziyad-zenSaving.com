import Link from "next/link";
import type { Metadata } from "next";
import { Search } from "lucide-react";
import { getStores } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { storeLetters } from "@/lib/types";
import { Pagination, parsePage } from "@/components/post-card";
import { StoreGrid } from "@/components/store-grid";

type Props = {
  searchParams: Promise<{ page?: string; letter?: string; q?: string }>;
};

function readParams(params: { page?: string; letter?: string; q?: string }) {
  const letter = storeLetters.includes(
    (params.letter || "").toLowerCase() as (typeof storeLetters)[number],
  )
    ? (params.letter || "").toLowerCase()
    : "";
  const q = (params.q || "").trim().slice(0, 100);
  return { letter, q, page: parsePage(params.page) };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { letter, q, page } = readParams(await searchParams);
  const filtered = Boolean(letter || q || page > 1);
  return pageMetadata({
    title: letter
      ? `Stores starting with ${letter.toUpperCase()}`
      : "All Stores – Coupons & Promo Codes",
    description:
      "Browse every store on Zen Saving and find their latest coupon codes, promo codes and deals.",
    path: "/stores",
    // Only the main directory is indexed; filtered and paginated views are not.
    noindex: filtered,
  });
}

export default async function StoresPage({ searchParams }: Props) {
  const { letter, q, page } = readParams(await searchParams);
  const list = await getStores({ page, letter: letter || undefined, search: q || undefined, perPage: 60 });
  const query: Record<string, string> = {};
  if (letter) query.letter = letter;
  if (q) query.q = q;

  return (
    <>
      <section className="page-hero">
        <span className="eyebrow">Store directory</span>
        <h1>{letter ? `Stores · ${letter.toUpperCase()}` : "All stores"}</h1>
        <p>
          {list.total.toLocaleString("en-US")} {list.total === 1 ? "store" : "stores"}
          {q ? ` matching “${q}”` : ""}. Pick a store to see its coupons and deals.
        </p>
        <form action="/stores" className="store-search">
          <Search size={18} />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search stores, e.g. Nike"
            aria-label="Search stores"
          />
          <button type="submit">Search</button>
        </form>
      </section>
      <div className="content-wrap">
        <div className="letter-nav" role="navigation" aria-label="Stores by letter">
          <Link href="/stores" className={!letter && !q ? "active" : ""}>
            All
          </Link>
          {storeLetters.map((l) => (
            <Link
              key={l}
              href={`/stores?letter=${l}`}
              className={letter === l ? "active" : ""}
            >
              {l === "0-9" ? "#" : l.toUpperCase()}
            </Link>
          ))}
        </div>
        <StoreGrid stores={list.items} />
        {list.items.length === 0 && (
          <div className="empty">No stores found. Try another letter or search.</div>
        )}
        <Pagination
          page={page}
          totalPages={list.total_pages}
          basePath="/stores"
          query={query}
        />
      </div>
    </>
  );
}
