// Native design tokens and merchandising assets ported from
// helalalfqih-sketch/indexes-shopify-theme @ b64cdde7c22c1efe7ac48d920517308691c1e909.
// Remote promotional images are hosted by the Shopify store, not bundled with this app.
export const colors = Object.freeze({
  primary: '#E0000B',
  primaryDark: '#AD0010',
  accent: '#FA2430',
  text: '#141619',
  muted: '#626875',
  line: '#E9EBEE',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  soft: '#FFF0F1',
  success: '#12A94C',
  danger: '#E0000B',
});

const assets = 'https://cdn.shopify.com/s/files/1/0664/0110/8053/files/';

// Actual unpublished Shopify theme settings from
// gid://shopify/OnlineStoreTheme/162512797781, templates/index.json,
// inspected 2026-11-05. The draft is not published to the online store.
// URLs were resolved from READY Shopify Video and MediaImage Admin records.
export const homepageDraft = Object.freeze({
  themeId: '162512797781',
  name: 'Indexes — Homepage Video Banners — Draft 2026-1...',
  sourceUpdatedAt: '2026-11-05T15:49:11Z',
  carouselAutoplay: true,
  carouselIntervalMs: 6000,
  categoryIntervalMs: 4500,
  enabledPromoCount: 2,
});

export const promoSlides = Object.freeze([
  {
    key: 'general',
    title: 'تصفح جميع الأقسام',
    handle: null,
    route: 'categories',
    video: 'https://cdn.shopify.com/videos/c/vp/e4e37bdf87784c7199e384b22795c478/e4e37bdf87784c7199e384b22795c478.SD-480p-1.5Mbps-100132491.mp4',
    poster: assets + 'indexes-home-video-poster-general-20261105.jpg?v=1793882176',
  },
  {
    key: 'home',
    title: 'تصفح قسم المنزل والمطبخ',
    handle: 'المنزل-والمطبخ',
    route: 'collection',
    video: 'https://cdn.shopify.com/videos/c/vp/2a6bc000ff934697b32cbd3eddba3397/2a6bc000ff934697b32cbd3eddba3397.SD-480p-1.2Mbps-100132492.mp4',
    poster: assets + 'indexes-home-video-poster-feature-20261105.jpg?v=1793882255',
  },
  {
    key: 'car',
    title: 'تصفح قسم السيارات وملحقاتها',
    handle: 'السيارات-وملحقاتها',
    route: 'collection',
    video: 'https://cdn.shopify.com/videos/c/vp/edf1834fffe7460ebd3df38b8cef8482/edf1834fffe7460ebd3df38b8cef8482.SD-480p-1.5Mbps-100141600.mp4',
    poster: assets + 'indexes-home-video-poster-general-20261105.jpg?v=1793882176',
  },
]);

// The merchant disabled the original gifts image block in templates/index.json.
// Preserve only the two enabled promos in the draft and in their actual order.
export const promoTiles = Object.freeze([
  {
    key: 'electronics-image',
    title: 'تصفح قسم الإلكترونيات والهواتف',
    handle: 'الإلكترونيات-والهواتف',
    route: 'categories',
    image: assets + '1000502272.png?v=1793656063',
  },
  {
    key: 'electronics-video',
    title: 'تصفح قسم الإلكترونيات والهواتف',
    handle: 'الإلكترونيات-والهواتف',
    route: 'categories',
    video: 'https://cdn.shopify.com/videos/c/vp/b36a9362e6b2460590ec4293400c0234/b36a9362e6b2460590ec4293400c0234.SD-480p-1.2Mbps-100142663.mp4',
    poster: assets + 'indexes-home-promo-home-1000491824.png?v=1792368222',
  },
]);

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
  handle,
  title,
  image: assets + file + '&width=540',
})));

export const navigationItems = Object.freeze([
  { key: 'home', title: 'الرئيسية', icon: '⌂' },
  { key: 'categories', title: 'الأقسام', icon: '▦' },
  { key: 'wishlist', title: 'المفضلة', icon: '♡' },
  { key: 'cart', title: 'السلة', icon: '▣' },
  { key: 'account', title: 'حسابي', icon: '♙' },
]);
