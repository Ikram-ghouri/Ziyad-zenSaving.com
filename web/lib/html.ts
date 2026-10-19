import sanitizeHtml from "sanitize-html";

/** Sanitizes rendered WordPress HTML before it is injected into a page. */
export function sanitizeContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "figure",
      "figcaption",
      "iframe",
      "picture",
      "source",
      "video",
    ]),
    allowedAttributes: {
      a: ["href", "target", "rel", "id"],
      img: ["src", "srcset", "sizes", "alt", "width", "height", "loading"],
      source: ["srcset", "type", "media"],
      video: ["src", "controls", "poster", "width", "height"],
      iframe: ["src", "width", "height", "title", "allow", "allowfullscreen"],
      "*": ["id", "class"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan", "scope"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedIframeHostnames: [
      "www.youtube.com",
      "www.youtube-nocookie.com",
      "player.vimeo.com",
    ],
    // Drop iframes whose src was removed because the host is not allowed.
    exclusiveFilter: (frame) => frame.tag === "iframe" && !frame.attribs.src,
    transformTags: {
      a: (tagName, attribs) => {
        const external = /^https?:\/\//i.test(attribs.href || "");
        return {
          tagName,
          attribs: external
            ? {
                ...attribs,
                target: "_blank",
                rel: "noopener noreferrer sponsored",
              }
            : attribs,
        };
      },
      img: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, loading: attribs.loading || "lazy" },
      }),
    },
  });
}

/** Builds the table of contents from h2 headings and adds ids where missing. */
export function withHeadingIds(html: string): {
  html: string;
  toc: { id: string; text: string }[];
} {
  const toc: { id: string; text: string }[] = [];
  const used = new Set<string>();
  const out = html.replace(
    /<h2([^>]*)>([\s\S]*?)<\/h2>/gi,
    (match, attrs: string, inner: string) => {
      const text = inner.replace(/<[^>]+>/g, "").trim();
      if (!text) return match;
      const existing = /\sid="([^"]+)"/i.exec(attrs)?.[1];
      let id =
        existing ||
        text
          .toLowerCase()
          .replace(/&[a-z#0-9]+;/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") ||
        "section";
      if (!existing) {
        let n = 2;
        const base = id;
        while (used.has(id)) id = `${base}-${n++}`;
      }
      used.add(id);
      toc.push({ id, text });
      return existing ? match : `<h2${attrs} id="${id}">${inner}</h2>`;
    },
  );
  return { html: out, toc };
}
