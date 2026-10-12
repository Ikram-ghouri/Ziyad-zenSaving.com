import { describe, expect, it } from "vitest";
import { formatDate, matchRedirect, safeUrl, toInternalHref, type RedirectRule } from "./types";
import { sanitizeContent, withHeadingIds } from "./html";

const rules: RedirectRule[] = [
  { source: "/what-to-read-this-summer", destination: "/blog/what-to-read-this-summer", permanent: true },
  { source: "/about-us", destination: "/about", permanent: true },
  { source: "/store/:slug*", destination: "/", permanent: true },
];

describe("matchRedirect", () => {
  it("matches old root post URLs with or without a trailing slash", () => {
    expect(matchRedirect("/what-to-read-this-summer", rules)?.destination).toBe("/blog/what-to-read-this-summer");
    expect(matchRedirect("/what-to-read-this-summer/", rules)?.destination).toBe("/blog/what-to-read-this-summer");
  });
  it("matches wildcard legacy coupon URLs", () => {
    expect(matchRedirect("/store/nike", rules)?.destination).toBe("/");
    expect(matchRedirect("/store/nike/", rules)?.destination).toBe("/");
    expect(matchRedirect("/storefront", rules)).toBeUndefined();
  });
  it("leaves frontend routes alone", () => {
    expect(matchRedirect("/blog/what-to-read-this-summer", rules)).toBeUndefined();
    expect(matchRedirect("/", rules)).toBeUndefined();
  });
});

describe("helpers", () => {
  it("accepts web URLs and rejects unsafe protocols", () => {
    expect(safeUrl("https://example.com")).toBe("https://example.com/");
    expect(safeUrl("javascript:alert(1)")).toBeUndefined();
  });
  it("formats dates and tolerates bad input", () => {
    expect(formatDate("2026-10-02T09:00:00Z")).toBe("Oct 2, 2026");
    expect(formatDate("not a date")).toBe("");
  });
  it("strips scripts and marks external links", () => {
    const html = sanitizeContent('<p onclick="x()">Hi</p><script>alert(1)</script><a href="https://shop.example">Shop</a>');
    expect(html).not.toContain("script");
    expect(html).not.toContain("onclick");
    expect(html).toContain('rel="noopener noreferrer sponsored"');
    expect(sanitizeContent('<iframe src="https://evil.example/x"></iframe>')).toBe("");
    expect(sanitizeContent('<iframe src="https://www.youtube.com/embed/x"></iframe>')).toContain("youtube.com");
  });
  it("adds heading ids and builds a table of contents", () => {
    const { html, toc } = withHeadingIds("<h2>First part</h2><p>x</p><h2>First part</h2>");
    expect(toc.map((t) => t.id)).toEqual(["first-part", "first-part-2"]);
    expect(html).toContain('<h2 id="first-part">');
  });
});

describe("toInternalHref", () => {
  const origins = ["https://zensaving.com"];
  it("turns old WordPress store links into frontend paths", () => {
    expect(toInternalHref("https://zensaving.com/store/cuts-clothing/", origins)).toBe("/store/cuts-clothing");
  });
  it("drops empty and placeholder links", () => {
    expect(toInternalHref("#", origins)).toBe("");
    expect(toInternalHref("", origins)).toBe("");
  });
  it("keeps safe external links and rejects unsafe ones", () => {
    expect(toInternalHref("https://shop.example/x", origins)).toBe("https://shop.example/x");
    expect(toInternalHref("javascript:alert(1)", origins)).toBe("");
  });
});
