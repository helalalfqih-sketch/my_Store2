# Modern Shopify Draft → React Native implementation

## Source

Shopify Admin theme `gid://shopify/OnlineStoreTheme/162512797781`, name `Indexes — Homepage Video Banners — Draft`, role `UNPUBLISHED`. The live Shopify editor's `templates/index.json` and associated Liquid sections are the **design source of truth**; the older Shopify theme GitHub repository is a historical reference only.

## Native mapping

| Shopify draft | Native implementation |
|---|---|
| `indexes-home-carousel.liquid`, 3 video blocks | `src/components/HomeMedia.jsx` `HomeVideoCarousel` with `expo-av`, posters, 6s rotation, pause/arrows/dots |
| `indexes-home-promos.liquid` | `HomePromoTiles`, two active tiles (one video), disabled Gifts tile excluded |
| `indexes-home-categories.liquid` | `AutoCategoryRail`, 11 categories in draft order, optional 4.5s scrolling |
| `indexes-brand-identity.css` | `indexesTheme.js` with `#E60107` primary, `#BD0006` dark, `#FAFAFA` background |
| Brand logo/icon, 5-tab navigation | `StorefrontUI.jsx`, Expo vector icons, `assets/indexes-app-512*.png` |
| Product cards, 24/page, search and variants | `ProductListScreen.jsx`, `ProductDetailScreen.jsx`, Storefront GraphQL client |
| Cart and checkout | `CartScreen.jsx`, validated browser checkout; no unproven native checkout events |

All 4 Shopify video Files were checked through the connected Admin API, and each reports `READY`. Their public MP4 renditions and preview URLs in the native theme match Shopify's records. Their accessibility, actual playback quality and memory/network behavior still require runtime validation. The MP4 files are not bundled in APK.

## Evidence and limits

- `npm run verify` runs Node regression tests, JSX syntax and relative-import verification.
- GitHub Actions Android workflow builds a standalone APK and verifies `aapt` application ID `com.indexesstore.mobile`, version `0.2.1`/code `3`, signature (`apksigner`), bundled JS and SHA-256; artifacts include the APK and verification texts.
- The same workflow has a separate **Android emulator E2E** job asserting launch, at least one live visible product card, categories and empty cart, and collecting screenshots. Its result must be checked before claiming successful E2E.
- Ramus direct-emulator testing was blocked by `quota_exhausted` on 2026-11-05; the monthly quota resets on 2026-12-01. No claim of successful Ramus E2E for 0.2.1.
- `STOREFRONT_ACCESS_TOKEN` is now configured with a public Storefront token by the merchant. GitHub Actions read-only Storefront API verification succeeded (products and 20 collections). Native Android product-card rendering is checked in a separate E2E gate. Cart mutations, checkout, authenticated accounts and payment are **not** tested. Never embed Shopify Admin/private credentials in a mobile APK.
- Android release-variant APK is signed with an **ephemeral debug certificate**, unsuitable for production updates. iOS, production signing, recovery from poor network, visual parity and device-specific memory use are unverified.
- PR #1 is draft and `main` remains unchanged. Do not merge or publish the theme without passing the business integration/security gates.

## Regression history

0.1.0 crashed on launch because the native `ShopifyCheckoutSheetKit` module was not linked. 0.1.1 removed the eager import and uses browser checkout. 0.2.1 retains that fix and ports the newer Shopify video-homepage draft.
