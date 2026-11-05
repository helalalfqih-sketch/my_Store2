// Browser checkout remains available even when Checkout Kit's Android native
// module has not been linked. Do not import Checkout Kit at app startup.
// The URL comes from Shopify's cartCreate response, not from user input.
export function assertTrustedCheckoutUrl(url, shopDomain) {
  if (typeof url !== 'string' || typeof shopDomain !== 'string') {
    throw new Error('رابط الدفع غير صالح.');
  }
  const match = /^https:\/\/([a-z0-9.-]+)(?::443)?(?:[/?#]|$)/i.exec(url);
  const host = match?.[1]?.toLowerCase();
  const domain = shopDomain.toLowerCase();
  const shopHosted = host === domain || host === 'www.' + domain;
  const shopifyHosted = host === 'checkout.shopify.com'
    || (host?.endsWith('.myshopify.com') && host.length > '.myshopify.com'.length)
    || (host?.endsWith('.shopify.com') && host.length > '.shopify.com'.length);
  if (!host || host.includes('..') || host.startsWith('.') || host.endsWith('.')
      || (!shopHosted && !shopifyHosted)) {
    throw new Error('رفض فتح رابط دفع غير موثوق.');
  }
  return url;
}

export async function openCheckoutInBrowser(checkoutUrl, shopDomain, openURL) {
  const verifiedUrl = assertTrustedCheckoutUrl(checkoutUrl, shopDomain);
  if (typeof openURL !== 'function') throw new Error('المتصفح غير متاح.');
  await openURL(verifiedUrl);
  // Launching the browser does not prove that an order completed.
}
