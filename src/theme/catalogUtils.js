// Pure merchandising helpers; no React Native dependency.
export function firstAvailableVariant(product) {
  const variants = product?.variants?.nodes;
  if (!Array.isArray(variants)) return null;
  return variants.find(item => item?.availableForSale) || variants[0] || null;
}

export function money(price) {
  if (!price || price.amount == null) return 'استفسر عن السعر';
  const amount = Number(price.amount);
  if (!Number.isFinite(amount) || amount <= 0) return 'استفسر عن السعر';
  const unit = typeof price.currencyCode === 'string' ? price.currencyCode : '';
  return amount.toFixed(2) + (unit ? ' ' + unit : '');
}

export function discountPercent(variant) {
  const price = Number(variant?.price?.amount);
  const compare = Number(variant?.compareAtPrice?.amount);
  if (!Number.isFinite(price) || !Number.isFinite(compare) || compare <= price || price <= 0) return 0;
  return Math.round(((compare - price) / compare) * 100);
}

export function cleanWishlist(value) {
  if (!Array.isArray(value)) return [];
  const ids = new Set();
  return value.filter(item => {
    if (!item || typeof item.id !== 'string' || ids.has(item.id) || !item.title) return false;
    ids.add(item.id);
    return true;
  }).slice(0, 100);
}

export function cartQuantity(cart) {
  if (!cart?.lines?.nodes) return 0;
  return cart.lines.nodes.reduce((total, line) => total + Math.max(0, Number(line.quantity) || 0), 0);
}
