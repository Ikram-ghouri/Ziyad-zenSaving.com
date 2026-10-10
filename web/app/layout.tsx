import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/interactive";
import { Analytics } from "@/components/analytics";
import { siteName, siteUrl } from "@/lib/data";
import { seoKeywords } from "@/lib/seo";
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
        <Header name={siteName} />
        <main>{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}

function Footer() {
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
            Independent guides and reviews, written to be clear and useful.
          </p>
        </div>
        <div>
          <strong>Read</strong>
          <Link href="/#stories">Latest stories</Link>
          <Link href="/search?q=Buying%20guides">Buying guides</Link>
          <Link href="/search?q=Reviews">Reviews</Link>
          <Link href="/categories">All categories</Link>
        </div>
        <div>
          <strong>Explore</strong>
          <Link href="/">Home</Link>
          <Link href="/search">Article archive</Link>
          <Link href="/about">About us</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div>
          <strong>Legal</strong>
          <Link href="/privacy-policy">Privacy policy</Link>
          <Link href="/affiliate-disclosure">Affiliate disclosure</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} {siteName}. All rights reserved.{" "}
        <span>Read thoughtfully. Choose confidently.</span>
      </div>
    </footer>
  );
}
