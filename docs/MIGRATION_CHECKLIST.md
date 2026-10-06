# Migration checklist

## URL mappings

| Current WordPress URL | Next.js URL | Action |
| --- | --- | --- |
| `/` | `/` | Preserve |
| `/store/{slug}` | `/store/{slug}` | Preserve |
| `/coupon-category/{slug}` | `/coupon-category/{slug}` | Preserve |
| `/coupon-tag/{slug}` | `/coupon-tag/{slug}` | Preserve |
| `/coupon/{slug}` | `/coupon/{slug}` or the related store page | Decide from the live single-coupon setting |
| `/stores` | `/stores` | Preserve |
| Blog permalink | Matching `/blog/{slug}` or existing structure | Confirm against WordPress permalink settings |
| WordPress pages | Same public slug | Preserve |
| Outbound `/out/{id}` | WordPress backend URL | Keep on WordPress for affiliate tracking |

## Before staging

- Install and activate the bridge plugin.
- Confirm every `zs/v1` endpoint returns JSON.
- Keep `ALLOW_INDEXING=false`.
- Add the staging origin to WordPress CORS settings.
- Configure matching write and revalidation secrets.

## Before launch

- Export all indexed URLs from Search Console and the XML sitemap.
- Crawl both the old site and staging frontend.
- Map every 404 to its exact replacement with a permanent redirect.
- Replace demo content and legal placeholders with WordPress content.
- Confirm canonical URLs use the production domain.
- Confirm title, description and one H1 on every template.
- Validate Organization, WebSite, Breadcrumb, ItemList/Offer and Article structured data.
- Verify code reveal, outbound tracking, votes, submissions and revalidation.
- Run Lighthouse on the homepage and at least three store pages.
- Enable indexing only at the DNS cutover.
- Submit the new sitemap and monitor coverage, rankings and 404s.
