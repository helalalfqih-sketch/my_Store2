import test from 'node:test';
import assert from 'node:assert/strict';
import { nextCarouselIndex, safeAutoplayInterval, isTrustedShopifyMedia } from '../src/theme/homeMediaUtils.js';
import { brand, categories, colors, homeMotion, promoSlides, promoTiles } from '../src/theme/indexesTheme.js';

test('Shopify draft hero contains exactly 3 public playable videos in source order', () => {
  assert.deepEqual(promoSlides.map(v => v.key), ['general', 'home', 'cars']);
  for (const slide of promoSlides) {
    assert.equal(isTrustedShopifyMedia(slide.video), true);
    assert.equal(isTrustedShopifyMedia(slide.poster), true);
  }
});

test("draft disabled gifts tile is omitted and video promo is configured", () => {
  assert.deepEqual(promoTiles.map(v => v.kind), ['image','video']);
  assert.equal(promoTiles.every(v => v.handle === 'الإلكترونيات-والهواتف'), true);
  assert.equal(isTrustedShopifyMedia(promoTiles[1].video), true);
});

test('draft red and soft neutral identity and motion timing are preserved', () => {
  assert.equal(colors.primary, '#E60107');
  assert.equal(colors.background, '#FAFAFA');
  assert.equal(homeMotion.bannerIntervalMs, 6000);
  assert.equal(homeMotion.categoryIntervalMs, 4500);
  assert.equal(brand.name, 'اندكس ستور');
  assert.equal(categories.length, 11);
});

test('index arithmetic handles next, previous, wrapping and no slides', () => {
  assert.equal(nextCarouselIndex(2, 3), 0);
  assert.equal(nextCarouselIndex(0, 3, -1), 2);
  assert.equal(nextCarouselIndex(1, 3, 1), 2);
  assert.equal(nextCarouselIndex(0, 0), 0);
  assert.equal(nextCarouselIndex(-1, 3), 0);
});

test('Shopify CDN URL guard rejects HTTP and spoofed domains', () => {
  assert.equal(isTrustedShopifyMedia('https://cdn.shopify.com/files/hero.mp4'), true);
  assert.equal(isTrustedShopifyMedia('http://cdn.shopify.com/files/hero.mp4'), false);
  assert.equal(isTrustedShopifyMedia('https://cdn.shopify.com.evil.example/x.mp4'), false);
  assert.equal(isTrustedShopifyMedia('https://evil.example@cdn.shopify.com/x.mp4'), false);
  assert.equal(isTrustedShopifyMedia('not a url'), false);
});

test('autoplay intervals are bounded', () => {
  assert.equal(safeAutoplayInterval(6000), 6000);
  assert.equal(safeAutoplayInterval(4500), 4500);
  assert.equal(safeAutoplayInterval(200), 6000);
  assert.equal(safeAutoplayInterval(Infinity, 4500), 4500);
});
