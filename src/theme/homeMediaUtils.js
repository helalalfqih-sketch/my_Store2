/** Pure helpers shared by the native Shopify media carousels. */
export function nextCarouselIndex(current, total, step = 1) {
  if (!Number.isInteger(total) || total <= 0) return 0;
  const index = Number.isInteger(current) ? current : 0;
  const distance = Number.isInteger(step) ? step : 1;
  return ((index + distance) % total + total) % total;
}

/** Only allow public HTTPS Shopify CDN media in the mobile client. */
export function isTrustedShopifyMedia(url) {
  if (typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' &&
      parsed.hostname === 'cdn.shopify.com' &&
      !parsed.username && !parsed.password;
  } catch (_) {
    return false;
  }
}

/** Editor settings are milliseconds and should not allow runaway intervals. */
export function safeAutoplayInterval(ms, fallback = 6000) {
  if (!Number.isFinite(ms) || ms < 3000 || ms > 15000) return fallback;
  return Math.round(ms);
}
