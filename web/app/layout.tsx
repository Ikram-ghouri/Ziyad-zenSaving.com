import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/interactive';
import { Analytics } from '@/components/analytics';
import { siteName, siteUrl } from '@/lib/data';
import { seoKeywords } from '@/lib/seo';
import './globals.css';
import './enhancements.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${siteName} — Coupons, Promo Codes & Deals`, template: `%s | ${siteName}` },
  description: 'Find coupon codes, trusted offers and practical shopping guides for the stores you love.',
  keywords: seoKeywords.home,
  alternates: { canonical: '/' },
  openGraph: { title: `${siteName} — Coupons, Promo Codes & Deals`, description: 'Find coupon codes, trusted offers and practical shopping guides for the stores you love.', url: '/', siteName, type: 'website' },
  robots: process.env.ALLOW_INDEXING === 'true' ? { index: true, follow: true } : { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData={"@context":"https://schema.org","@graph":[{"@type":"Organization","@id":`${siteUrl}/#organization`,name:siteName,url:siteUrl},{"@type":"WebSite","@id":`${siteUrl}/#website`,url:siteUrl,name:siteName,publisher:{"@id":`${siteUrl}/#organization`},potentialAction:{"@type":"SearchAction",target:`${siteUrl}/search?q={search_term_string}`,"query-input":"required name=search_term_string"}}]};
  return <html lang="en" data-scroll-behavior="smooth"><body suppressHydrationWarning><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structuredData).replace(/</g,'\\u003c')}}/><Header name={siteName}/><main>{children}</main><Footer/><Analytics/></body></html>;
}

function Footer() {
  return <footer><div className="footer-grid"><div><Link className="brand footer-brand" href="/">{siteName}<span className="brand-dot">.</span></Link><p>Helping everyday shoppers find a little more room in their budget.</p><p className="fine">We may earn a commission when you buy through links on our site.</p></div><div><strong>Save</strong><Link href="/stores">All stores</Link><Link href="/deals">Top deals</Link><Link href="/discounts">Special discounts</Link><Link href="/submit-coupon">Submit a coupon</Link></div><div><strong>Explore</strong><Link href="/blog">Guides & reviews</Link><Link href="/categories">Categories</Link><Link href="/saved">Saved offers</Link><Link href="/about">About us</Link></div><div><strong>Legal</strong><Link href="/contact">Contact</Link><Link href="/privacy-policy">Privacy policy</Link><Link href="/affiliate-disclosure">Affiliate disclosure</Link><Link href="/terms">Terms</Link></div></div><div className="footer-bottom">© {new Date().getFullYear()} {siteName}. All rights reserved. <span>Shop thoughtfully. Save happily.</span></div></footer>;
}
