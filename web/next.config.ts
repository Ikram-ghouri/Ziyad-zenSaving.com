import type { NextConfig } from "next";

const wpUrl = process.env.WP_API_URL;
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
