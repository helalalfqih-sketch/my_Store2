import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  categories, homepageDraft, promoSlides, promoTiles,
} from '../src/theme/indexesTheme.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('only the exact unpublished Shopify draft is the native homepage source', () => {
  assert.equal(homepageDraft.themeId, '162512797781');
  assert.equal(homepageDraft.carouselIntervalMs, 6000);
  assert.equal(homepageDraft.categoryIntervalMs, 4500);
  assert.equal(homepageDraft.carouselAutoplay, true);
  assert.equal(homepageDraft.enabledPromoCount, 2);
});

test('Shopify carousel has exactly three READY video assets in draft order', () => {
  assert.deepEqual(promoSlides.map(item => item.key), ['general', 'home', 'car']);
  assert.deepEqual(promoSlides.map(item => item.handle), [null, 'المنزل-والمطبخ', 'السيارات-وملحقاتها']);
  assert.deepEqual(promoSlides.map(item => item.route), ['categories', 'collection', 'collection']);
  assert.equal(new Set(promoSlides.map(item => item.video)).size, 3);
});

test('the disabled gifts block is excluded, and two active promo blocks are retained', () => {
  assert.deepEqual(promoTiles.map(item => item.key), ['electronics-image', 'electronics-video']);
  assert.equal(promoTiles.filter(item => item.video).length, 1);
  assert.equal(promoTiles.filter(item => item.image).length, 1);
  assert.ok(promoTiles.every(item => item.handle === 'الإلكترونيات-والهواتف'));
});

test('each video is HTTPS MP4 on Shopify CDN and has a valid remote poster', () => {
  const all = [...promoSlides, ...promoTiles];
  assert.equal(all.filter(item => item.video).length, 4);
  for (const asset of all) {
    const imageUrl = asset.poster || asset.image;
    assert.equal(new URL(imageUrl).hostname, 'cdn.shopify.com');
    assert.ok(imageUrl.startsWith('https://'));
    if (asset.video) {
      const u = new URL(asset.video);
      assert.equal(u.hostname, 'cdn.shopify.com');
      assert.ok(u.pathname.endsWith('.mp4'));
      assert.ok(!u.pathname.includes('HD-720p'), 'Use bandwidth-efficient 480p mobile source');
    }
  }
});

test('Arabic category settings follow the configured 11-block Shopify order', () => {
  assert.equal(categories.length, 11);
  assert.deepEqual(categories.slice(0, 3).map(x => x.handle), ['الصحة-والجمال', 'المنزل-والمطبخ', 'السيارات-وملحقاتها']);
  assert.equal(new Set(categories.map(x => x.handle)).size, 11);
});

test('native video uses lifecycle and accessibility gating, muted looping and a poster fallback', () => {
  const player = fs.readFileSync(path.join(root, 'src/components/HomepageVideoBanners.jsx'), 'utf8');
  const home = fs.readFileSync(path.join(root, 'ProductListScreen.jsx'), 'utf8');
  assert.match(player, /from 'expo-av'/);
  assert.match(player, /isMuted/);
  assert.match(player, /isLooping/);
  assert.match(player, /AppState\.addEventListener/);
  assert.match(player, /isReduceMotionEnabled/);
  assert.match(player, /onError/);
  assert.match(player, /slide\.poster/);
  assert.match(home, /HomepageVideoCarousel/);
  assert.match(home, /HomepagePromoTiles/);
});
