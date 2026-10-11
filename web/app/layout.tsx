import type { Metadata } from "next";
import Link from "next/link";
import { Header, type NavLink } from "@/components/interactive";
import { Analytics } from "@/components/analytics";
import { getPostCategories, siteName, siteUrl } from "@/lib/data";
import { seoKeywords } from "@/lib/seo";
import type { Term } from "@/lib/types";
import "./globals.css";
import "./enhancements.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Guides, Reviews & Better Ideas`,
    template: `%s | ${siteName}`,
  },
  description:
    "Read practical guides, thoughtful reviews and useful ideas for making confident everyday choices.",
  keywords: seoKeywords.home,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${siteName} — Guides, Reviews & Better Ideas`,
    description:
      "Read practical guides, thoughtful reviews and useful ideas for making confident everyday choices.",
    url: "/",
    siteName,
    type: "website",
  },
  robots:
    process.env.ALLOW_INDEXING === "true"
      ? { index: true, follow: true }
      : { index: false, follow: false },
};

/** Navigation should never take the whole site down, so a failure here yields no category links. */
async function navCategories(): Promise<Term[]> {
  try {
    return (await getPostCategories()).slice(0, 3);
  } catch {
    return [];
  }
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const categories = await navCategories();
  const links: NavLink[] = [
    { title: "Home", href: "/" },
    { title: "Latest", href: "/blog" },
    ...categories.map((c) => ({ title: c.name, href: `/category/${c.slug}` })),
    { title: "Categories", href: "/categories" },
    { title: "About", href: "/about" },
  ];
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: siteName,
        url: siteUrl,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: siteName,
        publisher: { "@id": `${siteUrl}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
        <Header name={siteName} links={links} />
        <main>{children}</main>
        <Footer categories={categories} />
        <Analytics />
      </body>
    </html>
  );
}

function Footer({ categories }: { categories: Term[] }) {
  return (
    <footer>
      <div className="footer-grid">
        <div>
          <Link className="brand footer-brand" href="/">
            {siteName}
            <span className="brand-dot">.</span>
          </Link>
          <p>
            Practical ideas for thoughtful choices, useful discoveries and
            everyday life.
          </p>
          <p className="fine">
            Affiliate disclosure: if you buy a product or service after
            clicking one of our links, we may be paid a commission. All company
            logos and names are trademarks of their respective owners.
          </p>
        </div>
        <div>
          <strong>Read</strong>
          <Link href="/blog">Latest stories</Link>
          {categories.map((c) => (
            <Link href={`/category/${c.slug}`} key={c.id}>
              {c.name}
            </Link>
          ))}
          <Link href="/categories">All categories</Link>
        </div>
        <div>
          <strong>Explore</strong>
          <Link href="/about">About us</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/careers">Careers</Link>
        </div>
        <div>
          <strong>Legal</strong>
          <Link href="/privacy-policy">Privacy policy</Link>
          <Link href="/affiliate-disclosure">Affiliate disclosure</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/community-guidelines">Community guidelines</Link>
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} {siteName}. All rights reserved.{" "}
        <span>Read thoughtfully. Choose confidently.</span>
      </div>
    </footer>
  );
}
