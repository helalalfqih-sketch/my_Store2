/**
 * Live, READ-ONLY integration probe for the currently configured public
 * Shopify Storefront token. No cart mutations, purchases or account calls.
 * Never log the token or raw headers (this repository is public).
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../storefrontClient.js', import.meta.url), 'utf8');
const match = source.match(/const\s+STOREFRONT_ACCESS_TOKEN\s*=\s*(['"])([^'"]+)\1\s*;/);
assert(match && match[2] !== 'your-public-storefront-token',
  'Configure a public Storefront API token before running this integration test.');

const client = await import(
  'data:text/javascript;base64,' + Buffer.from(source, 'utf8').toString('base64')
);

const results = await client.fetchProductsPage({ first: 5 });
assert(Array.isArray(results?.items), 'Invalid products connection response.');
assert(typeof results?.pageInfo?.hasNextPage === 'boolean',
  'Product pagination metadata missing.');
const products = results.items;
for (const product of products) {
  assert(typeof product.id === 'string' && typeof product.title === 'string',
    'Invalid public product in Storefront API response.');
}

const collections = await client.fetchCollections();
assert(Array.isArray(collections), 'Invalid collections connection response.');
for (const collection of collections) {
  assert(typeof collection.handle === 'string' && collection.handle,
    'Invalid public collection handle.');
}
if (collections.length > 0) {
  const categoryPage = await client.fetchCollectionProductsPage(collections[0].handle, {
    first: 3,
  });
  assert(Array.isArray(categoryPage.items),
    'Collection products connection was not readable.');
}

console.log('PASS: Shopify accepted the configured public Storefront token.');
console.log('PASS: product listing, collections, and collection detail are readable.');
console.log('Visible products in first 5:', products.length);
console.log('Visible collections (first 100):', collections.length);
if (products.length === 0) {
  console.warn('WARNING: No products are currently visible to the public Storefront API.');
}
if (collections.length === 0) {
  console.warn('WARNING: No collections are currently visible to the public Storefront API.');
}
