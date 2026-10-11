"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Leaf, Menu, Search, X } from "lucide-react";

type Suggestion = { id: number; slug: string; title: string; category: string };
export type NavLink = { title: string; href: string };

export function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      fetch(`/api/search?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      })
        .then((response) => response.json())
        .then((data) => setResults(data.posts || []))
        .catch(() => setResults([]));
    }, 180);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);
  return (
    <div className="search-wrap">
      <form action="/search" className="search">
        <Search size={20} />
        <input
          aria-label="Search articles"
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search articles"
        />
        <button aria-label="Search" type="submit">
          <Search size={17} />
        </button>
      </form>
      {query.length > 1 && results.length > 0 && (
        <div className="suggestions">
          {results.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              onClick={() => setQuery("")}
            >
              <span>
                <strong>{post.title}</strong>
                <small>{post.category}</small>
              </span>
              <ArrowUpRight size={15} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Header({ name, links }: { name: string; links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
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
          {links.map(({ title, href }) => {
            const active = isActive(href);
            return (
              <Link
                className={active ? "active" : ""}
                aria-current={active ? "page" : undefined}
                key={href}
                href={href}
                onClick={() => setOpen(false)}
              >
                {title}
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
      </div>
    </header>
  );
}
