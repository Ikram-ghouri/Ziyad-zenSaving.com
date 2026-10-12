import BlogLanding from "@/components/blog-landing";
import { pageMetadata, seoKeywords } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Coupons, Promo Codes & Saving Guides",
  description:
    "Find verified coupon codes and deals from 1,600+ stores, plus practical guides and honest reviews.",
  path: "/",
  keywords: [...seoKeywords.blog, ...seoKeywords.home],
});

export default BlogLanding;
