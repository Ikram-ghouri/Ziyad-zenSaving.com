# Zen Saving frontend

Next.js App Router frontend for the Zen Saving headless WordPress site. It follows the reference site's information architecture and coupon UX with original Zen Saving branding, copy and styling.

## Run locally

1. Copy `.env.example` to `.env.local`.
2. Keep `USE_MOCK_DATA=true` to preview the full UI with clearly labeled sample offers.
3. Run `npm install` and `npm run dev`.
4. Open `http://localhost:3000`.

## Connect WordPress

Set `WP_API_URL` to the complete custom REST base, for example `https://admin.zensaving.com/wp-json/zs/v1`, set `USE_MOCK_DATA=false`, and configure the revalidation and write tokens. The WordPress plugin endpoints described in the project prompt must exist before live data and submissions work.

Keep `ALLOW_INDEXING=false` on the staging subdomain. Enable indexing only after the live domain, redirects, legal copy, analytics and real offer data are verified.

## Checks

Run `npm run lint`, `npm test`, and `npm run build` before deployment.
