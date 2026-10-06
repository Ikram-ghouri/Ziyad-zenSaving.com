# Project: Zen Saving — Headless WordPress backend + Next.js frontend

You are a senior full-stack engineer. Rebuild the frontend of **zensaving.com** (a coupon / deals site) as a fast **Next.js** app, while keeping **WordPress as the backend/CMS**. The existing editors must keep adding coupons and stores in WP Admin exactly as they do today.

## Inputs you are given

1. **This folder (`wp-coupon/`)** — the current live WordPress theme ("WP Coupon" v1.2.6, Semantic UI 2.3, heavily hand-edited). It is the source of truth for the data model. Read it before writing code, especially:
   - `inc/post-type.php` — registers the post type and taxonomies
   - `inc/config/metabox-config.php` — all custom fields (CMB2, prefix `_wpc_`)
   - `inc/core/coupon.php`, `inc/core/store.php` — how coupons/stores are read, how expiry, "% success", votes, affiliate "go out" URLs work
   - `inc/core/ajax.php`, `inc/core/search.php` — current AJAX/search behaviour
   - `loop/loop-coupon.php`, `loop/coupon-modal.php`, `taxonomy-coupon_store.php`, `single-coupon.php`, `templates/*.php` — current UI and page set
   - `header.php`, `footer.php` — tracking scripts, menus, affiliate disclosure
2. **Reference site: https://savingsays.com** — use it as a reference for **layout, information architecture, UX and speed only**. Study its homepage, `/stores`, `/stores/<slug>`, `/discounts/*`, `/blog`, reviews, buying guides, subscription boxes, search, login and submit-coupon flows. **Do NOT copy its text, images, logos, brand name, colours or code.** Build an original design for the Zen Saving brand that offers a comparable structure and experience.

## Data model (from the theme — verify in code)

- Post type **`coupon`** (rewrite slug `coupon`)
- Taxonomies: **`coupon_store`** (default slug `store`), **`coupon_category`** (default `coupon-category`), **`coupon_tag`** (default `coupon-tag`). Slugs can be overridden by theme options `rewrite_store_slug`, `rewrite_category_slug`, `rewrite_tag_slug` — read the live values, don't assume.
- Coupon meta (`_wpc_*`): `coupon_type` (code | sale | print), `coupon_type_code`, `coupon_type_printable`(+`_id`), `destination_url`, `expires`, `start_on`, `coupon_save`, `free_shipping`, `exclusive`, `used`, `views`, `vote_up`, `vote_down`, `percent_success`, `store`, `is_featured`, etc.
- Store term meta: `store_url`, `store_aff_url`, `store_image`/`store_image_id`, `store_heading`, `is_featured`, `extra_info`, `auto_thumbnail`.
- Category term meta: `icon`, `cat_image`.
- Blog uses normal `post` + `category`. Yoast SEO (`wordpress-seo`) is installed.

**Important:** today the WP REST API exposes **none** of these — `/wp-json/wp/v2/coupon` and `/wp-json/wp/v2/coupon_store` return 404. Step 1 fixes that.

## Deliverables

### Step 1 — WordPress plugin `zensaving-headless` (in `/wp-plugin/zensaving-headless/`)
A standalone plugin (must NOT modify the theme; must keep working if the theme is later switched off):
- Custom REST namespace `zs/v1` with read endpoints (public, cached):
  - `GET /coupons` — filters: `store`, `category`, `tag`, `type`, `featured`, `exclusive`, `active_only` (exclude expired), `sort` (latest | popular | expiring | top-discount), `search`, `page`, `per_page`. Returns normalized JSON: id, title, slug, description (rendered + excerpt), type, code (see security note), discount text/value (parse "70% off", "$20 off" from title/`coupon_save`), expires (ISO + human), is_expired, free_shipping, exclusive, used, percent_success, votes, store {id, slug, name, logo}, categories, go_url.
  - `GET /coupons/{id}`
  - `GET /stores` (A–Z, featured, popular, search, pagination) and `GET /stores/{slug}` (store details + its active and expired coupons + related stores in same category)
  - `GET /categories`, `GET /categories/{slug}`
  - `GET /home` — one aggregated payload for the homepage (featured stores, top deals, latest coupons, expiring soon, categories, latest posts) to avoid N requests
  - `GET /search?q=` — stores + coupons + posts, typo-tolerant ranking
  - `GET /seo?path=` — Yoast title/description/canonical/OG/schema for any WP URL
  - `GET /redirects` — map of old WP URLs → new Next.js URLs (for SEO-safe migration)
- Write endpoints:
  - `POST /coupons/{id}/vote` (up/down) and `POST /coupons/{id}/use` (increments `used`/`views`) — rate-limited per IP, nonce/HMAC or simple signed token from Next.js
  - `POST /submit-coupon` — creates a **pending** coupon (honeypot + reCAPTCHA v3 verification, sanitize everything)
- Webhook: on save/update/delete of coupon, store, category, post → POST to Next.js revalidation endpoint (`NEXT_REVALIDATE_URL` + secret, configurable in a small settings page) so pages update within seconds.
- New fields (CMB2 or native term/post meta, editable in WP Admin): store **rating** + **review text/pros/cons**, coupon **verified** flag + **last verified date**, and a **"special discount audience"** taxonomy (student, teacher, military, senior, nurse, healthcare, first responder, birthday, credit card, gift card) attachable to coupons/stores.
- CORS limited to the frontend domain(s). Use transients/object cache for responses. PHP 7.4+ compatible, WP coding standards, no fatal errors if CMB2/Yoast missing.
- **Security:** escape/sanitize all input/output; no SQL string concatenation (use `WP_Query`/`$wpdb->prepare`); never leak `wp-config`, emails, or user data.

### Step 2 — Next.js app (in `/web/`)
- **Next.js (latest stable, App Router) + TypeScript + Tailwind CSS**. Server Components by default; client components only where interactive.
- Rendering: **ISR / on-demand revalidation** (`revalidateTag`) driven by the WP webhook; fallback `revalidate` of ~10 min. Route `app/api/revalidate/route.ts` protected by secret.
- Pages (original Zen Saving design, mobile-first):
  - `/` — search-first hero, featured/trending stores, top deals (biggest discount), expiring soon, categories grid, special-discount audiences, latest guides/reviews
  - `/stores` (A–Z index + search) and `/store/[slug]` (keep the existing WP slug path) — store header with logo, rating, description; filter tabs (All / Codes / Deals / Free shipping); active coupons; expired coupons collapsed; store review/pros/cons; FAQ; related stores
  - `/coupon-category/[slug]`, `/coupon-tag/[slug]`
  - `/discounts/[audience]` — special discount hubs
  - `/blog`, `/blog/[slug]` (or the existing WP post permalink structure — preserve URLs), reviews and buying-guide listings using WP post categories
  - `/search?q=` with instant results dropdown in the header
  - `/submit-coupon`, `/about`, `/contact`, `/privacy-policy`, `/affiliate-disclosure`, `/terms` (pull from WP pages)
  - Custom 404
- **Coupon interaction:** "Get Code" button shows partially hidden code; on click → reveal modal with full code + copy-to-clipboard + opens the affiliate `go_url` in a new tab (same behaviour as current `coupon-modal.php`). "Get Deal" opens the affiliate link directly. Vote (worked / didn't work) and save-to-favourites (localStorage).
- **SEO (critical — the site has existing Google rankings):**
  - Keep every existing URL or 301 it (use `/redirects` endpoint in `next.config` / middleware)
  - Per-page metadata from Yoast via `/seo`; canonical URLs; Open Graph; `sitemap.xml` and `robots.txt` generated from WP data
  - JSON-LD: `Organization`, `WebSite` + `SearchAction`, `BreadcrumbList`, `Offer`/`ItemList` for coupons, `Review`/`AggregateRating` for stores, `Article` for posts
  - One `<h1>` per page with a meaningful title (the current homepage wrongly uses "Reviews" as its only h1)
  - `noindex` for filtered/query variants like `?coupon_type=` (same as current theme)
- **Performance targets:** Lighthouse mobile ≥ 90 performance, ≥ 95 SEO/accessibility; LCP < 2.5s. Use `next/image` (WP media as remote pattern), `next/font`, no jQuery, no Semantic UI, minimal client JS.
- **Tracking:** one Google tag / GTM loaded via `next/script` (`afterInteractive`), IDs from env vars. Replace the current duplicated gtag + dead Universal Analytics tag. Keep Bing UET as optional env. Keep site-verification meta tags from `header.php` as env-configurable values. Add consent-friendly loading.
- **Accessibility:** keyboard-usable modals and menus, visible focus, alt text everywhere, colour contrast AA.
- Affiliate disclosure in footer (text from current `footer.php`).
- `.env.example` with: `WP_API_URL`, `WP_REVALIDATE_SECRET`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GTM_ID`, `RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET`, etc.

### Step 3 — Deployment & migration docs (`/docs/`)
- `SETUP.md` — local dev (WP via Docker `wordpress` + `mysql` image with a DB dump, or pointing at staging), running Next.js, env vars
- `DEPLOY.md` —
  - WordPress stays on current Namecheap shared hosting, moved to `admin.zensaving.com` (or `cms.`), front-end theme disabled/redirected so it isn't indexed
  - Next.js on **Vercel** (primary) with alternative instructions for a small VPS (Node + PM2 + Nginx)
  - Staging first at `new.zensaving.com`, then DNS cut-over checklist (redirect test, sitemap submit in Search Console, analytics check)
- `MIGRATION_CHECKLIST.md` — list every current URL pattern and how it maps; how to verify no 404s (crawl script)

## Working rules

- Start by **reading the theme folder and writing a short `docs/ANALYSIS.md`**: data model you found, every current URL pattern, features to keep, issues found. Then build Step 1, then Step 2, then Step 3.
- Small, reviewable commits per feature with clear messages.
- Write tests: PHPUnit (or at least WP-CLI smoke scripts) for the plugin endpoints; Vitest/Playwright for key Next.js flows (store page renders, code reveal + copy, search, submit coupon).
- Use realistic mock data (`/web/mocks/`) so the frontend can run before the plugin is installed.
- Don't hard-code secrets or tracking IDs. Don't delete or alter any WordPress data.
- Must also be reusable for the sister site **savingcuts.com** (same theme/data model) — make site name, logo, colours and API URL configurable via env/config so a second deployment only needs new env values.
- When something is ambiguous, choose the option that best protects existing SEO and editor workflow, and note the decision in `docs/DECISIONS.md`.

## Definition of done

- Plugin installs on a fresh WP + WP Coupon setup with no errors, and all `zs/v1` endpoints return correct data for real coupons/stores.
- Next.js app builds (`next build`) with no type errors, passes lint and tests, and renders all pages listed above against the API.
- Editing a coupon in WP Admin updates the live page within ~1 minute.
- Every old URL either resolves or 301s to the correct new page.
- Lighthouse targets met on homepage and a store page (attach report).
