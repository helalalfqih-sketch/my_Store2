# Indexes Store: Shopify theme to React Native

## Source and scope

- Theme repository: https://github.com/helalalfqih-sketch/indexes-shopify-theme
- Theme baseline: b64cdde7c22c1efe7ac48d920517308691c1e909 (main)
- Target: my_Store2, branch feat/port-indexes-shopify-theme-to-react-native
- Connected Shopify store public domain: indexesstore.com

Shopify Liquid, CSS and browser JavaScript cannot run directly in React Native. This change ports the native UI, design tokens and supported flows rather than copying the theme's 537 files.

## Ported UI components

| Shopify theme file | Native implementation |
|---|---|
| assets/indexes-brand-identity.css, assets/indexes-unified.css | src/theme/indexesTheme.js, src/components/StorefrontUI.jsx |
| sections/indexes-mobile-home.liquid | ProductListScreen.jsx: three hero banners, promotional tiles, category cards, product list |
| snippets/indexes-global-shell.liquid | Native header, search input, bottom navigation |
| snippets/indexes-product-card.liquid | Product media, prices, discount, wishlist, stock-aware cart action |
| sections/indexes-product.liquid | ProductDetailScreen.jsx: image gallery, variants, quantity |
| sections/indexes-cart.liquid | CartScreen.jsx: quantities, removal, summary, Checkout Sheet Kit |
| sections/indexes-search.liquid | Debounced storefront search and cursor pagination |
| sections/indexes-account.liquid | External Shopify customer account link (no native OAuth) |

Identity: primary #E0000B, background #F8F9FA, text #141619, muted #626875, Arabic RTL layout. Promotional images are referenced via the original Shopify CDN, so network access is required. Identity graphics stored in Shopify shop_images are NOT bundled.

## API and state

storefrontClient.js implements Shopify Storefront API version 2026-01: products, collections, search, pagination and carts. Only cart IDs and the wishlist are stored locally using AsyncStorage. Server-side cart data remains authoritative. Network failures display clear errors; cart mutations are not blindly retried.

### Required configuration

The storefront public domain has been set to indexesstore.com. Before running the app, configure STOREFRONT_ACCESS_TOKEN in storefrontClient.js with the store's PUBLIC Storefront API token. A public token with the correct storefront scopes is required. Never embed an Admin API token, private token or customer OAuth credentials in the mobile app.

The imported theme category handles may not all match current published store collections; confirm them with a functioning Storefront API token.

## Verification

- node --test tests/*.test.mjs: isolated API, timeout, offline, cart mutation, pagination, and catalog utility tests.
- node scripts/check-syntax.cjs: JavaScript/JSX parsing and local-import checks (requires @babel/parser).
- GitHub Actions: .github/workflows/native-theme-verification.yml. It verifies code and module structure but does not build or start a native mobile app.

## Outstanding blockers for a running APK

1. Provide a real React Native/Expo native scaffold. Upstream is tutorial snippets with no android/ or ios/ directories, no Metro or Babel configuration.
2. Install and validate compatible native dependencies, including AsyncStorage and Checkout Kit, and Expo Crypto for the separate OAuth example.
3. Configure a PUBLIC Storefront token, and validate live products, collections, media, cart, checkout and customer account behavior in a permitted store.
4. Run Android/iOS build, lint, type checks where applicable, live integration tests and E2E on a real device or emulator.
5. Review native accessibility, safe areas, currency handling, performance with large catalogs and screenshot fidelity.

No APK, app-store submission, live deployment or verified payment checkout is provided by this change. The main branch remains unchanged until review.
