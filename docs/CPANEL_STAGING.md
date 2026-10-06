# Staging on `new.zensaving.com` with the existing cPanel WordPress backend

This is the safest testing arrangement:

- `zensaving.com` continues serving the current WordPress site.
- `new.zensaving.com` serves the Next.js frontend from Vercel.
- The frontend reads data from `https://zensaving.com/wp-json/zs/v1`.
- Nothing on the live WordPress site is redirected or removed during testing.
- Staging remains `noindex` through `ALLOW_INDEXING=false`.

## 1. Install the WordPress bridge in cPanel

1. Back up the WordPress files and database.
2. In cPanel, open **File Manager**.
3. Open the live WordPress directory, then `wp-content/plugins/`.
4. Upload `zensaving-headless.zip` from this project.
5. Extract it. The final plugin file must be `wp-content/plugins/zensaving-headless/zensaving-headless.php`.
6. In WordPress Admin, open **Plugins** and activate **Zen Saving Headless Bridge**.
7. Test `https://zensaving.com/wp-json/zs/v1/stores`. It should return JSON.

The plugin is independent of the active theme and only reads the existing coupon/store data. It also adds verification fields to coupons and rating/review/audience fields to stores.

## 2. Configure the WordPress bridge

In WordPress Admin, open **Settings → Zen Saving Headless** and enter:

- Frontend origins: `https://new.zensaving.com`
- Revalidation URL: `https://new.zensaving.com/api/revalidate`
- Revalidation secret: a long random value, identical to `WP_REVALIDATE_SECRET` in Vercel
- Write token: a different long random value, identical to `WP_WRITE_TOKEN` in Vercel

Save the settings. Do not put either secret in a `NEXT_PUBLIC_` variable.

## 3. Deploy the frontend to Vercel

The deployable project is the `web/` directory.

1. Create a Git repository and push this project, or upload/import it through Vercel.
2. In Vercel choose **Add New → Project**.
3. Set **Root Directory** to `web`.
4. Framework preset should be **Next.js**.
5. Add these environment variables for Production and Preview:

```text
WP_API_URL=https://zensaving.com/wp-json/zs/v1
WP_REVALIDATE_SECRET=use-the-same-random-revalidation-secret
WP_WRITE_TOKEN=use-the-same-random-write-token
NEXT_PUBLIC_SITE_URL=https://new.zensaving.com
NEXT_PUBLIC_SITE_NAME=Zen Saving
USE_MOCK_DATA=false
ALLOW_INDEXING=false
```

6. Deploy and first test the generated `*.vercel.app` URL.
7. Check the homepage, `/stores`, at least three `/store/...` pages, search, code reveal, voting and submit-coupon.

## 4. Create `new.zensaving.com`

Add the subdomain to the Vercel project first:

1. Open the Vercel project.
2. Open **Settings → Domains**.
3. Add `new.zensaving.com`.
4. Vercel displays the exact CNAME target for this project. Copy that value.

Then configure DNS in cPanel:

1. Open **cPanel → Domains → Zone Editor**.
2. Find `zensaving.com` and choose **Manage**.
3. Add a **CNAME** record.
4. Name: `new` (some cPanel versions show `new.zensaving.com`).
5. Target: paste the exact CNAME value shown by Vercel.
6. Use the default TTL and save.

Do not create an A record for `new` when Vercel asks for a CNAME. Remove an existing `new` A/AAAA record before adding the CNAME because conflicting records will prevent verification. Return to Vercel Domains and wait for **Valid Configuration** and SSL provisioning.

DNS may update quickly but caches can take longer. Vercel recommends using the exact record shown in the project rather than assuming a generic value.

## 5. Test the real connection

Open these URLs in order:

1. `https://zensaving.com/wp-json/zs/v1/stores`
2. `https://zensaving.com/wp-json/zs/v1/coupons?active_only=true&per_page=5`
3. `https://new.zensaving.com`
4. `https://new.zensaving.com/stores`
5. A real store page at `https://new.zensaving.com/store/{store-slug}`

Edit one coupon in WordPress. The frontend should refresh after the webhook calls `/api/revalidate`. If it does not, confirm both revalidation secrets match exactly and check the Vercel Function logs.

## 6. Later: move WordPress to `admin.zensaving.com`

Do this only during the final migration, after staging passes:

1. In **cPanel → Domains**, choose **Create a New Domain**.
2. Enter `admin.zensaving.com`.
3. Do not share the main site document root. Use a separate folder such as `public_html/admin`.
4. Copy/migrate WordPress and update both WordPress Address and Site Address.
5. Replace internal URLs safely with a WordPress-aware search/replace tool.
6. Update Vercel `WP_API_URL` to `https://admin.zensaving.com/wp-json/zs/v1`.
7. Add `https://zensaving.com` to the plugin’s allowed frontend origins for launch.

Do not move the live WordPress installation just to test the frontend. Keeping the backend on its current URL during staging avoids changing indexed pages.
