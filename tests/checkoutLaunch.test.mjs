import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertTrustedCheckoutUrl, openCheckoutInBrowser } from '../src/checkout/openCheckout.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const host = 'indexesstore.com';

test('Shopify-hosted HTTPS checkout URLs are accepted', () => {
  assert.equal(assertTrustedCheckoutUrl('https://indexesstore.com/checkouts/a', host),
    'https://indexesstore.com/checkouts/a');
  assert.equal(assertTrustedCheckoutUrl('https://checkout.shopify.com/checkouts/a', host),
    'https://checkout.shopify.com/checkouts/a');
  assert.equal(assertTrustedCheckoutUrl('https://example.myshopify.com/cart/c/a', host),
    'https://example.myshopify.com/cart/c/a');
});

test('malformed or untrusted payment URLs are rejected before opening browser', async () => {
  const invalid = [
    null, 'http://indexesstore.com/checkout', 'javascript:alert(1)',
    'https://indexesstore.com.evil.example/checkout',
    'https://user@indexesstore.com/checkout',
    'https://indexesstore.com:444/checkout', 'https://.shopify.com/checkout',
    'https://shopify.com.evil/checkout',
  ];
  let attempts = 0;
  for (const url of invalid) {
    await assert.rejects(
      () => openCheckoutInBrowser(url, host, async () => { attempts++; }),
      /غير صالح|غير موثوق/,
    );
  }
  assert.equal(attempts, 0);
});

test('trusted URL is passed unchanged to system browser', async () => {
  const opened = [];
  await openCheckoutInBrowser('https://indexesstore.com/checkouts/a', host, async url => opened.push(url));
  assert.deepEqual(opened, ['https://indexesstore.com/checkouts/a']);
});

test('native Checkout Kit is not eagerly imported into the app entry graph', () => {
  for (const filename of ['App.jsx', 'CartScreen.jsx', 'src/checkout/openCheckout.js']) {
    const source = fs.readFileSync(path.join(root, filename), 'utf8');
    assert.doesNotMatch(source, /from\s+['"]@shopify\/checkout-sheet-kit['"]/);
    assert.doesNotMatch(source, /require\s*\(\s*['"]@shopify\/checkout-sheet-kit['"]/);
  }
  const app = fs.readFileSync(path.join(root, 'App.jsx'), 'utf8');
  assert.doesNotMatch(app, /ShopifyCheckoutSheetProvider/);
});
