import BlogLanding from "@/components/blog-landing";
import { pageMetadata, seoKeywords } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Smart Shopping Guides, Reviews & Savings",
  description:
    "Explore practical shopping guides, honest reviews, featured stores and useful money-saving advice from Zen Saving.",
  path: "/",
  keywords: [...seoKeywords.blog, ...seoKeywords.home],
});

export default BlogLanding;
