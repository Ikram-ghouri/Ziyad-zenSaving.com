# Zen Saving Headless Bridge

Upload the `zensaving-headless` directory to `wp-content/plugins/`, activate it, then open **Settings → Zen Saving Headless**.

Configure:

- Frontend origins: `https://new.zensaving.com` during staging and `https://zensaving.com` after launch.
- Revalidation URL: `https://new.zensaving.com/api/revalidate`.
- Revalidation secret: the same random value as `WP_REVALIDATE_SECRET` in Vercel.
- Write token: the same random value as `WP_WRITE_TOKEN` in Vercel.

The public API base is `https://admin.zensaving.com/wp-json/zs/v1` when WordPress is hosted on `admin.zensaving.com`.
