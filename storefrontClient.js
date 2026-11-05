// Shopify Storefront API client for the native Indexes Store UI.
// A Storefront PUBLIC access token is intended for client apps; never put
// Admin API credentials or customer account secrets in this file.
const SHOP_DOMAIN = 'indexesstore.com';
const STOREFRONT_ACCESS_TOKEN = 'your-public-storefront-token';
const API_VERSION = '2026-01';

const PRODUCT_FIELDS = [
  'fragment IndexesProduct on Product {',
  'id handle title description availableForSale',
  'featuredImage { url altText }',
  'images(first: 6) { nodes { url altText } }',
  'variants(first: 30) { nodes { id title availableForSale',
  'price { amount currencyCode } compareAtPrice { amount currencyCode } } }',
  '}',
].join('\n');

const CART_FIELDS = [
  'fragment IndexesCart on Cart {',
  'id checkoutUrl totalQuantity',
  'cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }',
  'lines(first: 100) { nodes { id quantity',
  'cost { totalAmount { amount currencyCode } }',
  'merchandise { ... on ProductVariant { id title',
  'price { amount currencyCode }',
  'image { url altText }',
  'product { id title handle featuredImage { url altText } }',
  '} } } }',
  '}',
].join('\n');

const PRODUCTS_QUERY = [
  'query IndexesProducts($first: Int!, $query: String, $after: String) {',
  'products(first: $first, query: $query, after: $after) { nodes { ...IndexesProduct } pageInfo { hasNextPage endCursor } }',
  '}',
  PRODUCT_FIELDS,
].join('\n');

const COLLECTION_QUERY = [
  'query IndexesCollection($handle: String!, $first: Int!, $after: String) {',
  'collection(handle: $handle) { id title handle',
  'products(first: $first, after: $after) { nodes { ...IndexesProduct } pageInfo { hasNextPage endCursor } } }',
  '}',
  PRODUCT_FIELDS,
].join('\n');

const CART_CREATE = [
  'mutation IndexesCartCreate($lines: [CartLineInput!]!) {',
  'cartCreate(input: { lines: $lines }) { cart { ...IndexesCart }',
  'userErrors { field message } } }',
  CART_FIELDS,
].join('\n');

const CART_ADD = [
  'mutation IndexesCartAdd($cartId: ID!, $lines: [CartLineInput!]!) {',
  'cartLinesAdd(cartId: $cartId, lines: $lines) {',
  'cart { ...IndexesCart } userErrors { field message } } }',
  CART_FIELDS,
].join('\n');

const CART_UPDATE = [
  'mutation IndexesCartUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {',
  'cartLinesUpdate(cartId: $cartId, lines: $lines) {',
  'cart { ...IndexesCart } userErrors { field message } } }',
  CART_FIELDS,
].join('\n');

const CART_REMOVE = [
  'mutation IndexesCartRemove($cartId: ID!, $lineIds: [ID!]!) {',
  'cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {',
  'cart { ...IndexesCart } userErrors { field message } } }',
  CART_FIELDS,
].join('\n');

const CART_GET = [
  'query IndexesCart($id: ID!) { cart(id: $id) { ...IndexesCart } }',
  CART_FIELDS,
].join('\n');

const COLLECTIONS_QUERY = [
  'query IndexesCollections {',
  'collections(first: 100) { nodes { id handle title image { url altText } } }',
  '}',
].join('\n');

function validateDomain(domain) {
  if (typeof domain !== 'string' ||
      domain === 'your-shop.myshopify.com' ||
      !/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(domain) ||
      domain.split('.').some(part => part.startsWith('-') || part.endsWith('-'))) {
    throw new Error('اضبط SHOP_DOMAIN باسم نطاق متجرك Shopify قبل التشغيل.');
  }
  return domain.toLowerCase();
}

function validQuantity(value) {
  if (!Number.isSafeInteger(value) || value < 1 || value > 100) {
    throw new Error('كمية المنتج يجب أن تكون عددًا صحيحًا من 1 إلى 100.');
  }
  return value;
}

function expectCart(data, key) {
  const payload = data?.[key];
  if (!payload) throw new Error('لم يُرجع Shopify نتيجة السلة المتوقعة.');
  if (payload.userErrors?.length) {
    throw new Error(payload.userErrors.map(item => item.message).join('، '));
  }
  if (!payload.cart?.id || !payload.cart.checkoutUrl) {
    throw new Error('لم يُرجع Shopify سلة صالحة أو رابط إتمام الطلب.');
  }
  return payload.cart;
}

export function createStorefrontClient({
  domain,
  token,
  version = API_VERSION,
  fetchImpl = (...args) => globalThis.fetch(...args),
  timeoutMs = 20000,
}) {
  async function request(query, variables = {}) {
    const host = validateDomain(domain);
    if (!token || token === 'your-public-storefront-token') {
      throw new Error('اضبط STOREFRONT_ACCESS_TOKEN برمز Storefront API العام.');
    }
    if (!/^\d{4}-\d{2}$/.test(version)) throw new Error('إصدار Storefront API غير صالح.');

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeout = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
    let response;
    try {
      response = await fetchImpl('https://' + host + '/api/' + version + '/graphql.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': token,
        },
        body: JSON.stringify({ query, variables }),
        ...(controller ? { signal: controller.signal } : {}),
      });
    } catch (error) {
      if (error?.name === 'AbortError') throw new Error('انتهت مهلة الاتصال بـ Shopify. حاول مرة أخرى.');
      throw new Error('تعذر الاتصال بالمتجر. تحقق من الإنترنت وحاول مجددًا.');
    } finally {
      if (timeout) clearTimeout(timeout);
    }
    if (!response?.ok) throw new Error('رفض Shopify الطلب (HTTP ' + response?.status + ').');
    let result;
    try {
      result = await response.json();
    } catch (_) {
      throw new Error('استجابة Shopify غير صالحة.');
    }
    if (result?.errors?.length) {
      throw new Error(result.errors.map(error => error.message).join('، '));
    }
    if (!result?.data) throw new Error('لم يرجع Shopify بيانات.');
    return result.data;
  }

  return {
    async listProductsPage({ first = 24, query = null, after = null } = {}) {
      const n = Number.isSafeInteger(first) ? Math.max(1, Math.min(50, first)) : 24;
      const data = await request(PRODUCTS_QUERY, { first: n, query: query?.trim() || null, after });
      return { items: data.products?.nodes || [], pageInfo: data.products?.pageInfo || { hasNextPage: false, endCursor: null } };
    },
    async listProducts(options) {
      const page = await this.listProductsPage(options);
      return page.items;
    },
    async listCollections() {
      const data = await request(COLLECTIONS_QUERY);
      return data.collections?.nodes || [];
    },
    async listCollectionProductsPage(handle, { first = 24, after = null } = {}) {
      if (!handle || typeof handle !== 'string') throw new Error('معرّف القسم غير صالح.');
      const n = Number.isSafeInteger(first) ? Math.max(1, Math.min(50, first)) : 24;
      const data = await request(COLLECTION_QUERY, { handle, first: n, after });
      return { items: data.collection?.products?.nodes || [], pageInfo: data.collection?.products?.pageInfo || { hasNextPage: false, endCursor: null } };
    },
    async listCollectionProducts(handle, first = 24) {
      const page = await this.listCollectionProductsPage(handle, { first });
      return page.items;
    },
    async createCart(variantId, quantity = 1) {
      if (!variantId) throw new Error('اختر منتجًا صالحًا.');
      const data = await request(CART_CREATE, { lines: [{ merchandiseId: variantId, quantity: validQuantity(quantity) }] });
      return expectCart(data, 'cartCreate');
    },
    async addCartLines(cartId, variantId, quantity = 1) {
      if (!cartId || !variantId) throw new Error('بيانات السلة أو المنتج غير مكتملة.');
      const data = await request(CART_ADD, { cartId, lines: [{ merchandiseId: variantId, quantity: validQuantity(quantity) }] });
      return expectCart(data, 'cartLinesAdd');
    },
    async updateCartLine(cartId, lineId, quantity) {
      if (!cartId || !lineId) throw new Error('بيانات السلة غير مكتملة.');
      const data = await request(CART_UPDATE, { cartId, lines: [{ id: lineId, quantity: validQuantity(quantity) }] });
      return expectCart(data, 'cartLinesUpdate');
    },
    async removeCartLine(cartId, lineId) {
      if (!cartId || !lineId) throw new Error('بيانات السلة غير مكتملة.');
      const data = await request(CART_REMOVE, { cartId, lineIds: [lineId] });
      return expectCart(data, 'cartLinesRemove');
    },
    async getCart(cartId) {
      if (!cartId) return null;
      const data = await request(CART_GET, { id: cartId });
      return data.cart || null;
    },
  };
}

const client = createStorefrontClient({ domain: SHOP_DOMAIN, token: STOREFRONT_ACCESS_TOKEN });
export const fetchProducts = options => client.listProducts(options);
export const fetchProductsPage = options => client.listProductsPage(options);
export const fetchCollections = () => client.listCollections();
export const fetchCollectionProducts = (handle, first) => client.listCollectionProducts(handle, first);
export const fetchCollectionProductsPage = (handle, options) => client.listCollectionProductsPage(handle, options);
export const createCart = (variantId, quantity) => client.createCart(variantId, quantity);
export const addCartLines = (cartId, variantId, quantity) => client.addCartLines(cartId, variantId, quantity);
export const updateCartLine = (cartId, lineId, quantity) => client.updateCartLine(cartId, lineId, quantity);
export const removeCartLine = (cartId, lineId) => client.removeCartLine(cartId, lineId);
export const fetchCart = cartId => client.getCart(cartId);
export function buildCartPermalink(variantId, quantity = 1) {
  const host = validateDomain(SHOP_DOMAIN);
  const numeric = String(variantId || '').split('/').pop();
  if (!/^\d+$/.test(numeric)) throw new Error('معرّف خيار المنتج غير صالح.');
  return 'https://' + host + '/cart/' + numeric + ':' + validQuantity(quantity);
}
export { SHOP_DOMAIN, API_VERSION };
