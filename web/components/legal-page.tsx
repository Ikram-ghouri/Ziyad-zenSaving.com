import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/data";
import { sanitizeContent } from "@/lib/html";
import { wpMetadata } from "@/lib/seo";
import { pageSlugs, type StaticRoute } from "@/lib/types";

/** Metadata for a static page whose content lives in WordPress. */
export async function staticPageMetadata(route: StaticRoute): Promise<Metadata> {
  const page = await getPage(pageSlugs[route]);
  if (!page) return { title: "Page not found" };
  return wpMetadata(page.seo, `/${route}`);
}

/** Renders a WordPress page (About, Contact, legal pages...) by its frontend route. */
export async function StaticPage({ route }: { route: StaticRoute }) {
  const page = await getPage(pageSlugs[route]);
  if (!page) notFound();
  return (
    <>
      <section className="page-hero">
        <span className="eyebrow">Zen Saving</span>
        <h1>{page.title}</h1>
        {page.excerpt && <p>{page.excerpt}</p>}
      </section>
      <div
        className="content-wrap prose legal"
        dangerouslySetInnerHTML={{ __html: sanitizeContent(page.content) }}
      />
    </>
  );
}
