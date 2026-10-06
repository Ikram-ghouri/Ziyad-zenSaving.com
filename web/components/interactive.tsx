"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  Bookmark,
  Check,
  Copy,
  Leaf,
  Menu,
  Search,
  X,
} from "lucide-react";
import type { Coupon, Store } from "@/lib/types";
import { filterCoupons, safeUrl } from "@/lib/types";

export function SearchBox({ large = false }: { large?: boolean }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Store[]>([]);
  useEffect(() => {
    if (q.length < 2) {
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(
      () =>
        fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        })
          .then((r) => r.json())
          .then((d) => setResults(d.stores || []))
          .catch(() => setResults([])),
      180,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q]);
  return (
    <div className={`search-wrap ${large ? "large" : ""}`}>
      <form action="/search" className="search">
        <Search size={20} />
        <input
          aria-label="Search stores and coupons"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={
            large
              ? "Search 5,000+ stores and offers"
              : "Search stores & coupons"
          }
        />
        <button aria-label="Search" type="submit">
          {large ? "Search" : <Search size={17} />}
        </button>
      </form>
      {q.length > 1 && results.length > 0 && (
        <div className="suggestions">
          {results.slice(0, 5).map((s) => (
            <Link key={s.id} href={`/store/${s.slug}`} onClick={() => setQ("")}>
              <span>
                <strong>{s.name}</strong>
                <small>{s.category}</small>
              </span>
              <ArrowUpRight size={15} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Header({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const links = [
    ["All stores", "/stores"],
    ["Top deals", "/deals"],
    ["Special discounts", "/discounts"],
    ["Categories", "/categories"],
    ["Saved offers", "/saved"],
  ];
  const isActive = (href: string) =>
    pathname === href ||
    (href === "/stores" && pathname.startsWith("/store/")) ||
    (href === "/categories" &&
      (pathname.startsWith("/coupon-category/") ||
        pathname.startsWith("/coupon-tag/"))) ||
    (href === "/discounts" && pathname.startsWith("/discounts/")) ||
    (href === "/blog" && pathname.startsWith("/blog/"));
  return (
    <header>
      <div className="header-inner">
        <Link href="/" className="brand" aria-label={`${name} home`}>
          <span className="brand-icon">
            <Leaf size={23} />
          </span>
          <span className="brand-name">
            {name}
            <span className="brand-dot">.</span>
          </span>
        </Link>
        <nav className={open ? "open" : ""} aria-label="Main navigation">
          {links.map(([t, h]) => {
            const active = isActive(h);
            return (
              <Link
                className={active ? "active" : ""}
                aria-current={active ? "page" : undefined}
                key={h}
                href={h}
                onClick={() => setOpen(false)}
              >
                {t}
              </Link>
            );
          })}
        </nav>
        <SearchBox />
        <button
          className="mobile-menu"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <Link
          className={`submit-link ${pathname === "/submit-coupon" ? "active" : ""}`}
          aria-current={pathname === "/submit-coupon" ? "page" : undefined}
          href="/submit-coupon"
        >
          Share a coupon <ArrowUpRight size={16} />
        </Link>
      </div>
    </header>
  );
}

export function CouponCard({
  coupon: c,
  demo,
}: {
  coupon: Coupon;
  demo: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(
      () =>
        setSaved(
          JSON.parse(localStorage.getItem("zs-saved") || "[]").includes(c.id),
        ),
      0,
    );
    return () => window.clearTimeout(timer);
  }, [c.id]);
  const save = () => {
    const ids: number[] = JSON.parse(localStorage.getItem("zs-saved") || "[]");
    localStorage.setItem(
      "zs-saved",
      JSON.stringify(saved ? ids.filter((id) => id !== c.id) : [...ids, c.id]),
    );
    setSaved(!saved);
    window.dispatchEvent(new Event("zs-saved"));
  };
  const use = () => {
    if (c.type === "code") dialog.current?.showModal();
    if (!demo && safeUrl(c.go_url)) {
      window.open(c.go_url, "_blank", "noopener,noreferrer");
      fetch(`/api/coupons/${c.id}/use`, { method: "POST" }).catch(() => {});
    }
  };
  const vote = async (direction: string) => {
    if (demo) {
      setMessage("Demo feedback recorded for this session.");
      return;
    }
    try {
      const r = await fetch(`/api/coupons/${c.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      });
      setMessage(
        r.ok
          ? "Thanks for your feedback."
          : "Feedback could not be saved. Please try again.",
      );
    } catch {
      setMessage("Feedback could not be saved.");
    }
  };
  const expiry = c.expires
    ? new Date(c.expires).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No expiry";
  return (
    <article className={`coupon ${c.exclusive ? "recommended" : ""}`}>
      {c.exclusive && <div className="recommend-ribbon">Recommended</div>}
      <div className="coupon-top">
        <Link href={`/store/${c.store.slug}`} className="mini-logo">
          {c.store.name.slice(0, 2).toUpperCase()}
        </Link>
        <div className="store-name">
          <Link href={`/store/${c.store.slug}`}>{c.store.name}</Link>
          <small>{c.categories[0]}</small>
        </div>
        <button
          className="save"
          aria-label={saved ? "Unsave offer" : "Save offer"}
          aria-pressed={saved}
          onClick={save}
        >
          <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="badges">
        <span>{c.type === "code" ? "PROMO CODE" : "ONLINE DEAL"}</span>
        {c.free_shipping && <span className="shipping">FREE SHIPPING</span>}
      </div>
      <strong className="discount">{c.discount}</strong>
      <h3>{c.title}</h3>
      <p className="coupon-description">{c.description}</p>
      <div className="coupon-proof">
        <span>
          <BadgeCheck size={15} />
          {demo
            ? "Sample offer"
            : c.verified
              ? "Verified offer"
              : "Retailer terms apply"}
        </span>
        <span>{c.percent_success}% success</span>
      </div>
      <button
        className={`get-code ${c.type === "code" ? "code-button" : ""}`}
        disabled={c.is_expired}
        onClick={use}
      >
        <span className="cta-label">
          {c.is_expired
            ? "Expired"
            : c.type === "code"
              ? "View code"
              : "View deal"}
        </span>
        <span className="code-peek">
          {c.type === "code" ? "•••" : <ArrowUpRight size={18} />}
        </span>
      </button>
      <div className="coupon-footer-meta">
        <span>{c.used.toLocaleString()} shoppers used this</span>
        <span>{c.expires ? `Ends ${expiry}` : expiry}</span>
      </div>
      <dialog
        ref={dialog}
        className="modal"
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current?.close();
        }}
      >
        <button
          className="modal-close"
          aria-label="Close coupon"
          onClick={() => dialog.current?.close()}
        >
          <X />
        </button>
        <div className="modal-store">
          <span className="mini-logo">
            {c.store.name.slice(0, 2).toUpperCase()}
          </span>
          <span>
            <small>Offer from</small>
            <strong>{c.store.name}</strong>
          </span>
        </div>
        <h2>{c.title}</h2>
        <p>
          {demo
            ? "Demo code for testing the frontend."
            : "Copy this code and apply it at checkout."}
        </p>
        <div className="code-copy">
          <code>{c.code || "No code provided"}</code>
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(c.code || "");
                setCopied(true);
              } catch {
                setMessage("Select and copy the code manually.");
              }
            }}
          >
            {copied ? <Check /> : <Copy />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p>{c.description}</p>
        <p>Did this offer work for you?</p>
        <div className="feedback">
          <button onClick={() => vote("up")}>Yes, it worked</button>
          <button onClick={() => vote("down")}>Did not work</button>
        </div>
        <p role="status">{message}</p>
      </dialog>
    </article>
  );
}

export function CouponList({
  coupons,
  demo,
  savedOnly = false,
}: {
  coupons: Coupon[];
  demo: boolean;
  savedOnly?: boolean;
}) {
  const [filter, setFilter] = useState("All");
  const [ids, setIds] = useState<number[]>([]);
  useEffect(() => {
    const sync = () =>
      setIds(JSON.parse(localStorage.getItem("zs-saved") || "[]"));
    const timer = window.setTimeout(sync, 0);
    window.addEventListener("zs-saved", sync);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("zs-saved", sync);
    };
  }, []);
  const list = filterCoupons(coupons, filter).filter(
    (c) => !savedOnly || ids.includes(c.id),
  );
  return (
    <>
      <div className="offer-toolbar">
        <div className="tabs">
          {["All", "Codes", "Deals", "Free shipping"].map((t) => (
            <button
              key={t}
              aria-pressed={filter === t}
              className={filter === t ? "active" : ""}
              onClick={() => setFilter(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <span>{list.length} offers</span>
      </div>
      <div className="coupon-grid">
        {list.map((c) => (
          <CouponCard key={c.id} coupon={c} demo={demo} />
        ))}
      </div>
      {!list.length && (
        <div className="empty">
          No offers here yet. Try another filter or save an offer from a store.
        </div>
      )}
    </>
  );
}

export function StoreIndex({ stores }: { stores: Store[] }) {
  const [q, setQ] = useState("");
  const [letter, setLetter] = useState("All");
  const results = stores
    .filter(
      (s) =>
        s.name.toLowerCase().includes(q.toLowerCase()) &&
        (letter === "All" || s.name.toUpperCase().startsWith(letter)),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  return (
    <>
      <div className="directory-search">
        <Search />
        <input
          className="field"
          aria-label="Filter stores"
          placeholder="Find your favorite store..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="alphabet">
        {["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].map((l) => (
          <button
            key={l}
            className={letter === l ? "active" : ""}
            onClick={() => setLetter(l)}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="store-grid">
        {results.map((s) => (
          <Link className="store-tile" href={`/store/${s.slug}`} key={s.id}>
            <span className="store-tile-logo">
              {s.name.slice(0, 2).toUpperCase()}
            </span>
            <strong>{s.name}</strong>
            <span>
              {s.category} <ArrowUpRight size={15} />
            </span>
          </Link>
        ))}
      </div>
      {!results.length && <p className="empty">No stores match your search.</p>}
    </>
  );
}

export function SubmissionForm() {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="submission"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          const data = Object.fromEntries(new FormData(e.currentTarget));
          const r = await fetch("/api/submit-coupon", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          const result = await r.json();
          setStatus(result.message);
        } catch {
          setStatus("Unable to submit. Please try again later.");
        } finally {
          setBusy(false);
        }
      }}
    >
      {[
        ["store", "Store name"],
        ["title", "Offer title"],
        ["code", "Coupon code (optional)"],
        ["url", "Offer URL"],
        ["email", "Your email"],
      ].map(([name, text]) => (
        <label key={name}>
          {text}
          <input
            name={name}
            type={name === "email" ? "email" : name === "url" ? "url" : "text"}
            required={name !== "code"}
            maxLength={250}
          />
        </label>
      ))}
      <label>
        Details
        <textarea name="description" maxLength={2000} />
      </label>
      <div hidden>
        <label>
          Leave empty
          <input name="website" tabIndex={-1} />
        </label>
      </div>
      <button className="primary" disabled={busy}>
        {busy ? "Sending..." : "Submit for review"}
      </button>
      <p role="status">{status}</p>
    </form>
  );
}
