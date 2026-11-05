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

export const promoSlides = Object.freeze([
  {
    key: 'all',
    title: 'تصفح جميع الأقسام',
    handle: null,
    image: assets + 'indexes-home-promo-general-1000491815.png?v=1792368194&width=960',
  },
  {
    key: 'home',
    title: 'المنزل والمطبخ',
    handle: 'المنزل-والمطبخ',
    image: assets + 'indexes-home-promo-home-1000491824.png?v=1792368222&width=960',
  },
  {
    key: 'cars',
    title: 'مستلزمات السيارات',
    handle: 'السيارات-وملحقاتها',
    image: assets + 'indexes-home-promo-car-1000491825.png?v=1792368232&width=960',
  },
]);

export const promoTiles = Object.freeze([
  {
    key: 'gifts',
    title: 'الهدايا والهوايات',
    handle: 'الهدايا-والهوايات',
    image: assets + 'indexes-home-promo-gifts-1000491813.png?v=1792368238&width=720',
  },
  {
    key: 'electronics',
    title: 'الإلكترونيات والهواتف',
    handle: 'الإلكترونيات-والهواتف',
    image: assets + 'indexes-home-promo-electronics-1000491814.png?v=1792368247&width=720',
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
