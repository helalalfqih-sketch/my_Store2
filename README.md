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

GitHub Actions `.github/workflows/android-debug-apk.yml` builds an Android 0.2.1 APK with bundled JS, validates its package, SHA-256 and signature, and includes an emulator smoke-test job that checks launch, live product-card rendering, categories and cart while capturing screenshots. Check each job's status; native compilation alone does not demonstrate correct execution.

Android app ID: `com.indexesstore.mobile`, version `0.2.1`, versionCode `3`. **Evaluation only**: signed with an ephemeral debug certificate, not a production identity. Earlier preview APKs may require uninstalling before installing this one.

## Required integration

`storefrontClient.js` has a merchant-provided **public** Storefront API token. The read-only live integration workflow confirms Shopify accepts it and serves products and collections. Do not replace it with an Admin/private token. The product-card test now checks that the actual Android UI renders these products; real cart mutations and checkout still require separate validation.

Four public Shopify CDN videos are streamed rather than packaged in the APK. Actual video performance, live cart/payment flows, production signing, iOS and real-device behavior are not yet proven. Shopify checkout currently opens in the browser because the native Checkout Sheet Kit failed at app launch in 0.1.0. The legacy `AcceleratedCheckout*.jsx` tutorial examples are not runtime screens.

See [THEME_PORT.md](THEME_PORT.md) for source traceability, verification and blockers.

License: [LICENSE.md](LICENSE.md).

## Installing evaluation APK 0.2.1

An older `0.2.0` APK was built without Shopify Storefront credentials. It will not update its embedded JavaScript when the GitHub repository changes. Install APK `0.2.1` (build 4). Because CI generates a different ephemeral debug signing certificate, you may need to uninstall older evaluation builds first. **Uninstalling deletes locally saved wishlist/cart IDs**; export or preserve any important device data before uninstalling. This is not a production signing/update strategy.
