import type { NextConfig } from "next";

const wpUrl = process.env.WP_API_URL;
/** WordPress origin (e.g. https://origin.zensaving.com) used to serve media, admin and affiliate links. */
const wpOrigin = wpUrl ? new URL(wpUrl).origin : "";
const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL).origin
  : "";
const mediaHosts = [
  ...(wpUrl ? [new URL(wpUrl).hostname] : []),
  ...(process.env.WP_MEDIA_HOSTS || "")
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean),
];

const config: NextConfig = {
  output: "standalone",
  // Trailing slashes are normalised in proxy.ts so old WordPress URLs like
  // /post-name/ reach their new address in a single 301 instead of two hops.
  skipTrailingSlashRedirect: true,
  outputFileTracingRoot: process.cwd(),
  images: {
    remotePatterns: [...new Set(mediaHosts)].map((hostname) => ({
      protocol: "https" as const,
      hostname,
    })),
  },
  // Paths WordPress still owns are proxied to it, so zensaving.com/wp-content/...
  // images, /out/{id} affiliate links and /wp-admin keep working on the new site.
  // Skipped when WordPress and the frontend share an origin (that would loop).
  async rewrites() {
    if (!wpOrigin || wpOrigin === siteOrigin) return [];
    const paths = [
      "/wp-content/:path*",
      "/wp-includes/:path*",
      "/wp-admin",
      "/wp-admin/:path*",
      "/wp-login.php",
      "/wp-json/:path*",
      "/out/:path*",
      "/go-store/:path*",
    ];
    return {
      beforeFiles: paths.map((source) => ({
        source,
        destination: `${wpOrigin}${source}`,
      })),
      afterFiles: [],
      fallback: [],
    };
  },
  async redirects() {
    return [
      // Old Yoast sitemaps (may be submitted in Search Console) -> the new sitemap.
      { source: "/sitemap_index.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/:name(post|page|coupon_store|coupon_category|category)-sitemap:n(\\d*).xml", destination: "/sitemap.xml", permanent: true },
    ];
  },
  // Legacy URL redirects are handled at runtime in proxy.ts (from the WordPress plugin).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default config;
