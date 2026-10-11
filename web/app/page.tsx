import BlogLanding from "@/components/blog-landing";
import { pageMetadata, seoKeywords } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Practical Guides, Reviews & Better Ideas",
  description:
    "Explore practical guides, honest reviews and useful ideas for more confident everyday choices.",
  path: "/",
  keywords: [...seoKeywords.blog, ...seoKeywords.home],
});

export default BlogLanding;
