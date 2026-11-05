/**
 * Native theme tokens and editable-homepage media, ported from:
 * Shopify theme 162512797781 ("Indexes — Homepage Video Banners — Draft")
 * Shopify Admin snapshot: 2026-11-05 16:37 UTC
 * Files: templates/index.json, sections/indexes-home-carousel.liquid,
 * sections/indexes-home-promos.liquid, assets/indexes-brand-identity.css.
 *
 * Only public Shopify CDN URLs are used. No admin credentials are shipped.
 */
export const colors = Object.freeze({
  primary: '#E60107',
  primaryDark: '#BD0006',
  accent: '#E60107',
  danger: '#E60107',
  text: '#171717',
  muted: '#626262',
  line: '#E6E6E6',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  soft: '#FFF1F1',
  success: '#0F7F43',
});

export const homeMotion = Object.freeze({
  bannerIntervalMs: 6000,
  categoryIntervalMs: 4500,
});

const files = 'https://cdn.shopify.com/s/files/1/0664/0110/8053/files/';

export const brand = Object.freeze({
  name: 'اندكس ستور',
  tagline: 'كل ما تحتاجه لمنزلك وسيارتك والعناية الشخصية',
  // The brand-master graphic is public in Shopify Files; the exact theme
  // logo is an unpublished theme asset, not a durable public URL.
  logo: files + 'indexes-store-brand-master-20261017.jpg?v=1792238299',
});

/**
 * The slide order and titles match the unpublished draft's index.json.
 * videoSource uses the READY SD MP4 Shopify rendition to reduce mobile data;
 * the poster is the corresponding ready Shopify video preview.
 */
export const promoSlides = Object.freeze([
  Object.freeze({
    key: 'general',
    title: 'تصفح جميع الأقسام',
    handle: null,
    poster: files + 'indexes-home-video-poster-general-20261105.jpg?v=1793882176',
    thumbnail: files + 'preview_images/e4e37bdf87784c7199e384b22795c478.thumbnail.0000000000.jpg?v=1793879506',
    video: 'https://cdn.shopify.com/videos/c/vp/e4e37bdf87784c7199e384b22795c478/e4e37bdf87784c7199e384b22795c478.SD-480p-1.5Mbps-100132491.mp4',
  }),
  Object.freeze({
    key: 'home',
    title: 'تصفح قسم المنزل والمطبخ',
    handle: 'المنزل-والمطبخ',
    poster: files + 'indexes-home-video-poster-feature-20261105.jpg?v=1793882255',
    thumbnail: files + 'preview_images/2a6bc000ff934697b32cbd3eddba3397.thumbnail.0000000000.jpg?v=1793879503',
    video: 'https://cdn.shopify.com/videos/c/vp/2a6bc000ff934697b32cbd3eddba3397/2a6bc000ff934697b32cbd3eddba3397.SD-480p-1.2Mbps-100132492.mp4',
  }),
  Object.freeze({
    key: 'cars',
    title: 'تصفح قسم السيارات وملحقاتها',
    handle: 'السيارات-وملحقاتها',
    poster: files + 'indexes-home-video-poster-general-20261105.jpg?v=1793882176',
    thumbnail: files + 'preview_images/edf1834fffe7460ebd3df38b8cef8482.thumbnail.0000000000.jpg?v=1793885359',
    video: 'https://cdn.shopify.com/videos/c/vp/edf1834fffe7460ebd3df38b8cef8482/edf1834fffe7460ebd3df38b8cef8482.SD-480p-1.5Mbps-100141600.mp4',
  }),
]);

/**
 * Only the two enabled tiles from the draft's indexes_home_promos section.
 * The gifts tile is disabled in Shopify and intentionally not rendered.
 */
export const promoTiles = Object.freeze([
  Object.freeze({
    key: 'electronics-image',
    title: 'تصفح قسم الإلكترونيات والهواتف',
    handle: 'الإلكترونيات-والهواتف',
    kind: 'image',
    image: files + '1000502272.png?v=1793656063&width=720',
  }),
  Object.freeze({
    key: 'electronics-video',
    title: 'تصفح قسم الإلكترونيات والهواتف',
    handle: 'الإلكترونيات-والهواتف',
    kind: 'video',
    image: files + 'indexes-home-promo-home-1000491824.png?v=1792368222&width=720',
    poster: files + 'preview_images/b36a9362e6b2460590ec4293400c0234.thumbnail.0000000000.jpg?v=1793885915',
    video: 'https://cdn.shopify.com/videos/c/vp/b36a9362e6b2460590ec4293400c0234/b36a9362e6b2460590ec4293400c0234.SD-480p-1.2Mbps-100142663.mp4',
  }),
]);

/** Category block order from the same draft's templates/index.json. */
export const categories = Object.freeze([
  ['الصحة-والجمال', 'الصحة والجمال', 'indexes-category-banner-care-1000491793.png?v=1792365845'],
  ['المنزل-والمطبخ', 'المنزل والمطبخ', 'indexes-category-banner-home-1000491799.png?v=1792365795'],
  ['السيارات-وملحقاتها', 'مستلزمات السيارات', 'indexes-category-banner-car-1000491797.png?v=1792365769'],
  ['الأدوات-والمعدات', 'الأدوات والمعدات', 'indexes-category-banner-tools-1000491794.png?v=1792365735'],
  ['الإلكترونيات-والهواتف', 'الإلكترونيات', 'indexes-category-banner-electronics-1000491795.png?v=1792365751'],
  ['الألعاب-والأطفال', 'الأطفال والألعاب', 'indexes-category-banner-toys-1000491802.png?v=1792365819'],
  ['الرياضة-واللياقة', 'الرياضة واللياقة', 'indexes-category-banner-sports-1000491800.png?v=1792365803'],
  ['الكاميرات-والأمن', 'الكاميرات والأمن', 'indexes-category-banner-security-1000491796.png?v=1792365759'],
  ['المكتب-والقرطاسية', 'المكتب والقرطاسية', 'indexes-category-banner-office-1000491801.png?v=1792365811'],
  ['الهدايا-والهوايات', 'الهدايا والهوايات', 'indexes-category-banner-gifts-1000491798.png?v=1792365777'],
  ['الأزياء-والحقائب', 'الأزياء والحقائب', 'indexes-category-banner-fashion-1000491803.png?v=1792365828'],
].map(([handle, title, file]) => Object.freeze({
  handle, title, image: files + file + '&width=540',
})));

export const navigationItems = Object.freeze([
  { key: 'home', title: 'الرئيسية', icon: 'home-outline', activeIcon: 'home' },
  { key: 'categories', title: 'الأقسام', icon: 'grid-outline', activeIcon: 'grid' },
  { key: 'wishlist', title: 'المفضلة', icon: 'heart-outline', activeIcon: 'heart' },
  { key: 'cart', title: 'السلة', icon: 'cart-outline', activeIcon: 'cart' },
  { key: 'account', title: 'حسابي', icon: 'person-outline', activeIcon: 'person' },
]);
