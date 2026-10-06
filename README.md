# Ziyad-zenSaving.com

Headless coupon and savings platform with a Next.js frontend and a WordPress REST API bridge.

## Project structure

- `web/` — responsive Next.js frontend
- `wp-plugin/zensaving-headless/` — WordPress headless API bridge
- `wp-coupon/` — existing WordPress coupon theme reference
- `docs/` — deployment, SEO, migration, and setup guides
- `zensaving-headless.zip` — installable WordPress bridge plugin

## Local development

```bash
cd web
npm install
npm run dev
```

Copy `web/.env.example` to `web/.env.local` and configure the WordPress API URL before connecting live data.

See `docs/CPANEL_STAGING.md` for the recommended staging and subdomain setup.
