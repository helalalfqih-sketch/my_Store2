# Indexes Store — Native Android

Expo SDK 50 / React Native 0.73 storefront for `indexesstore.com`.
Design reference: **unpublished Shopify Admin theme 162512797781** (Indexes — Homepage Video Banners — Draft), not the older upstream snippets.

## Implemented

- Native three-video homepage carousel (6-second autoplay, pause, arrows, accessible slide dots and posters).
- Shopify's two **enabled** promo tiles: one image, one muted video. Disabled Gifts promo is excluded.
- Shopify artwork and icon, Arabic RTL search/header, eleven collections in the draft's order, auto-scrolling 4.5-second category strip.
- Product listing (24/page), search, wishlist, product detail and persistent cart via Shopify Storefront API.
- External browser checkout for validated Shopify cart URL; never assumes checkout completed.

## Build and verify

```sh
npm install
npm run verify
npx expo prebuild --platform android --no-install
cd android && ./gradlew :app:assembleRelease
```

GitHub Actions `.github/workflows/android-debug-apk.yml` builds an Android 0.2.0 APK with bundled JS, validates its package, SHA-256 and signature, and includes an emulator smoke-test job that checks launch/categories/cart and captures screenshots. Check each job's status; native compilation alone does not demonstrate correct execution.

Android app ID: `com.indexesstore.mobile`, version `0.2.0`, versionCode `3`. **Evaluation only**: signed with an ephemeral debug certificate, not a production identity. Earlier preview APKs may require uninstalling before installing this one.

## Required integration

`storefrontClient.js` still contains the placeholder `STOREFRONT_ACCESS_TOKEN = 'your-public-storefront-token'`. Only configure a *public* Storefront API token, never an Admin/private token. Without it, the catalog and cart fail visibly even though the UI can render.

Four public Shopify CDN videos are streamed rather than packaged in the APK. Actual video performance, live cart/payment flows, production signing, iOS and real-device behavior are not yet proven. Shopify checkout currently opens in the browser because the native Checkout Sheet Kit failed at app launch in 0.1.0. The legacy `AcceleratedCheckout*.jsx` tutorial examples are not runtime screens.

See [THEME_PORT.md](THEME_PORT.md) for source traceability, verification and blockers.

License: [LICENSE.md](LICENSE.md).
