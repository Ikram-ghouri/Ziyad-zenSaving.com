# Deployment

Use Vercel for the Next.js frontend and keep WordPress on the existing cPanel account. See `CPANEL_STAGING.md` for the exact staging sequence.

The frontend must receive `WP_API_URL`, `WP_REVALIDATE_SECRET`, `WP_WRITE_TOKEN`, `NEXT_PUBLIC_SITE_URL`, `USE_MOCK_DATA=false` and the correct indexing setting. WordPress must have the Zen Saving Headless Bridge installed and matching secrets configured.

The recommended rollout is `new.zensaving.com` first, followed by the production DNS change only after URL, SEO, analytics, affiliate tracking and editor-update tests pass.
