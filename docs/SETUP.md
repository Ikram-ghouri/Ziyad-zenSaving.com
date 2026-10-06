# Local setup

## Frontend with demo data

```powershell
cd web
Copy-Item .env.example .env.local
npm install
npm run dev
```

Keep `USE_MOCK_DATA=true` and open `http://localhost:3000`.

## Frontend with an existing WordPress site

Install the plugin in `wp-plugin/zensaving-headless`, then set:

```text
WP_API_URL=https://your-wordpress-domain.example/wp-json/zs/v1
WP_REVALIDATE_SECRET=matching-random-secret
WP_WRITE_TOKEN=matching-random-write-token
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Zen Saving
USE_MOCK_DATA=false
ALLOW_INDEXING=false
```

Add `http://localhost:3000` as a separate line in **Settings → Zen Saving Headless → Frontend origins**. Restart Next.js after changing environment variables.

## Verification

```powershell
npm run lint
npm test
npm run build
```

The frontend requires the custom `zs/v1` bridge. The default WordPress REST API does not expose the WP Coupon theme’s private metadata and taxonomies.
