import test from 'node:test';
import assert from 'node:assert/strict';
import { createStorefrontClient } from '../storefrontClient.js';

const cart = {
  id: 'gid://shopify/Cart/123',
  checkoutUrl: 'https://indexesstore.com/checkouts/example',
  totalQuantity: 1,
  lines: { nodes: [] },
};
const ok = data => ({ ok: true, status: 200, json: async () => ({ data }) });
const clientWith = (fn, overrides = {}) => createStorefrontClient({
  domain: 'indexesstore.com',
  token: 'public-test-storefront-token',
  fetchImpl: fn,
  ...overrides,
});

test('product query uses variables, pagination and configured public domain', async () => {
  let request;
  const client = clientWith(async (url, options) => {
    request = { url, ...options };
    return ok({ products: { nodes: [{ id: 'gid://shopify/Product/1' }], pageInfo: { hasNextPage: true, endCursor: 'abc' } } });
  });
  const result = await client.listProductsPage({ first: 11, query: 'ساعة', after: 'page-1' });
  assert.deepEqual(result.items.map(item => item.id), ['gid://shopify/Product/1']);
  assert.equal(result.pageInfo.endCursor, 'abc');
  assert.equal(request.url, 'https://indexesstore.com/api/2026-01/graphql.json');
  assert.equal(request.headers['X-Shopify-Storefront-Access-Token'], 'public-test-storefront-token');
  assert.deepEqual(JSON.parse(request.body).variables, { first: 11, query: 'ساعة', after: 'page-1' });
  assert.ok(JSON.parse(request.body).query.includes('pageInfo'));
});

test('collection query passes Arabic Shopify handles and cursor', async () => {
  let variables;
  const client = clientWith(async (_, options) => {
    variables = JSON.parse(options.body).variables;
    return ok({ collection: { products: { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } } } });
  });
  const page = await client.listCollectionProductsPage('الإلكترونيات-والهواتف', { first: 8, after: 'two' });
  assert.deepEqual(variables, { handle: 'الإلكترونيات-والهواتف', first: 8, after: 'two' });
  assert.deepEqual(page.items, []);
});

test('cartCreate rejects invalid quantities and accepts valid variant ID', async () => {
  let variables;
  const client = clientWith(async (_, options) => {
    variables = JSON.parse(options.body).variables;
    return ok({ cartCreate: { cart, userErrors: [] } });
  });
  await assert.rejects(() => client.createCart('gid://shopify/ProductVariant/1', 0), /كمية/);
  await assert.rejects(() => client.createCart('gid://shopify/ProductVariant/1', 1.5), /كمية/);
  assert.equal((await client.createCart('gid://shopify/ProductVariant/1', 2)).id, cart.id);
  assert.deepEqual(variables.lines, [{ merchandiseId: 'gid://shopify/ProductVariant/1', quantity: 2 }]);
});

test('mutations report Shopify userErrors rather than treating checkout as success', async () => {
  const client = clientWith(async () => ok({
    cartCreate: { cart: null, userErrors: [{ field: ['lines'], message: 'Not available' }] },
  }));
  await assert.rejects(() => client.createCart('gid://shopify/ProductVariant/1'), /Not available/);
});

test('GraphQL, HTTP and malformed JSON failures have distinct errors', async () => {
  const graphql = clientWith(async () => ({ ok: true, status: 200, json: async () => ({ errors: [{ message: 'Access denied' }] }) }));
  await assert.rejects(() => graphql.listProducts(), /Access denied/);
  const http = clientWith(async () => ({ ok: false, status: 503 }));
  await assert.rejects(() => http.listProducts(), /HTTP 503/);
  const json = clientWith(async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError('invalid'); } }));
  await assert.rejects(() => json.listProducts(), /غير صالحة/);
});

test('network failures are not silently retried, especially for cart mutations', async () => {
  let calls = 0;
  const client = clientWith(async () => { calls += 1; throw new TypeError('offline'); });
  await assert.rejects(() => client.createCart('gid://shopify/ProductVariant/1'), /تعذر الاتصال/);
  assert.equal(calls, 1);
});

test('timeout aborts stalled requests', async () => {
  const client = clientWith((_, options) => new Promise((_, reject) => {
    options.signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
  }), { timeoutMs: 5 });
  await assert.rejects(() => client.listProducts(), /انتهت مهلة/);
});

test('missing token and unsafe domains fail before issuing a request', async () => {
  let calls = 0;
  const fetchImpl = async () => { calls += 1; return ok({}); };
  await assert.rejects(() => clientWith(fetchImpl, { domain: 'https://bad-domain.invalid/evil' }).listProducts(), /النطاق|SHOP_DOMAIN/);
  await assert.rejects(() => clientWith(fetchImpl, { token: '' }).listProducts(), /STOREFRONT_ACCESS_TOKEN/);
  assert.equal(calls, 0);
});

test('cart mutations send the correct line IDs and use updated backend state', async () => {
  const mutations = [];
  const client = clientWith(async (_, options) => {
    const body = JSON.parse(options.body);
    mutations.push(body.variables);
    if (body.query.includes('cartLinesUpdate')) return ok({ cartLinesUpdate: { cart, userErrors: [] } });
    return ok({ cartLinesRemove: { cart, userErrors: [] } });
  });
  await client.updateCartLine(cart.id, 'gid://shopify/CartLine/1', 3);
  await client.removeCartLine(cart.id, 'gid://shopify/CartLine/1');
  assert.deepEqual(mutations[0].lines, [{ id: 'gid://shopify/CartLine/1', quantity: 3 }]);
  assert.deepEqual(mutations[1].lineIds, ['gid://shopify/CartLine/1']);
  assert.equal(mutations[1].cartId, cart.id);
});

test('expired or missing cart is a normal empty result', async () => {
  let calls = 0;
  const client = clientWith(async () => { calls += 1; return ok({ cart: null }); });
  assert.equal(await client.getCart(null), null);
  assert.equal(calls, 0);
  assert.equal(await client.getCart('gid://shopify/Cart/expired'), null);
});
