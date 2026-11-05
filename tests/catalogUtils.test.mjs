import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cartQuantity, cleanWishlist, discountPercent, firstAvailableVariant, money,
} from '../src/theme/catalogUtils.js';

test('currency values and missing prices are handled explicitly', () => {
  assert.equal(money({ amount: '123.5', currencyCode: 'YER' }), '123.50 YER');
  assert.equal(money({ amount: '0', currencyCode: 'YER' }), 'استفسر عن السعر');
  assert.equal(money(null), 'استفسر عن السعر');
  assert.equal(money({ amount: 'invalid', currencyCode: 'YER' }), 'استفسر عن السعر');
});

test('discount is computed only for legitimate price reductions', () => {
  assert.equal(discountPercent({ price: { amount: '60' }, compareAtPrice: { amount: '100' } }), 40);
  assert.equal(discountPercent({ price: { amount: '100' }, compareAtPrice: { amount: '60' } }), 0);
  assert.equal(discountPercent({ price: { amount: '0' }, compareAtPrice: { amount: '60' } }), 0);
});

test('variant selection favors available inventory', () => {
  assert.equal(firstAvailableVariant({ variants: { nodes: [{ id: 'no', availableForSale: false }, { id: 'yes', availableForSale: true }] } }).id, 'yes');
  assert.equal(firstAvailableVariant({ variants: { nodes: [] } }), null);
});

test('wishlist storage is deduplicated, validates basic shape and caps size', () => {
  const a = { id: 'gid://shopify/Product/1', title: 'A' };
  assert.deepEqual(cleanWishlist([a, a, {}, null, { id: 5, title: 'invalid' }]), [a]);
  assert.equal(cleanWishlist(Array.from({ length: 110 }, (_, i) => ({ id: 'p' + i, title: 'P' }))).length, 100);
});

test('cart badge count sums quantities from backend cart lines', () => {
  assert.equal(cartQuantity({ lines: { nodes: [{ quantity: 2 }, { quantity: 3 }] } }), 5);
  assert.equal(cartQuantity(null), 0);
});
