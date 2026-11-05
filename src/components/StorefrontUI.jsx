import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { brand, colors, categories, navigationItems } from '../theme/indexesTheme';
import { discountPercent, firstAvailableVariant, money } from '../theme/catalogUtils';

export function StoreHeader({ search, onSearch, onHome, onCategories, onCart, cartCount }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerBar}>
        <Pressable onPress={onCart} accessibilityRole="button" accessibilityLabel="فتح السلة" style={styles.cartIcon}>
          <Ionicons name="cart-outline" size={27} color="#fff" />
          {cartCount > 0 && <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{cartCount}</Text></View>}
        </Pressable>
        <Pressable onPress={onHome} accessibilityRole="button" accessibilityLabel="اندكس ستور - الرئيسية" style={styles.logoContainer}>
          <Image source={{ uri: brand.logo }} style={styles.brandLogo} resizeMode="contain" accessibilityLabel="شعار اندكس ستور" />
        </Pressable>
        <Pressable onPress={onCategories} accessibilityRole="button" accessibilityLabel="فتح قائمة الأقسام" style={styles.menuButton}><Ionicons name="menu-outline" size={29} color="#fff" /></Pressable>
      </View>
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={21} color={colors.muted} />
        <TextInput
          accessibilityLabel="البحث في المنتجات"
          value={search}
          onChangeText={onSearch}
          placeholder="ابحث عن منتج أو قسم أو علامة تجارية..."
          placeholderTextColor="#89909A"
          textAlign="right"
          style={styles.searchInput}
          returnKeyType="search"
          autoCorrect={false}
        />
      </View>
      <Text style={styles.tagline}>{brand.tagline}</Text>
    </View>
  );
}

export function BottomNavigation({ selected, onSelect, cartCount }) {
  return (
    <View style={styles.bottomBar} accessibilityRole="tablist">
      {navigationItems.map(item => {
        const active = selected === item.key;
        return (
          <Pressable
            key={item.key}
            onPress={() => onSelect(item.key)}
            style={styles.tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={item.title}
          >
            <View>
              <Ionicons name={active ? item.activeIcon : item.icon} size={24} color={active ? colors.primary : colors.muted} />
              {item.key === 'cart' && cartCount > 0 && (
                <View style={styles.tabBadge}><Text style={styles.tabBadgeText}>{cartCount}</Text></View>
              )}
            </View>
            <Text style={[styles.tabText, active && styles.activeText]}>{item.title}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function CategoryRail({ selectedHandle, onPress, grid = false, items = categories }) {
  const cards = items.map(item => {
    const active = item.handle === selectedHandle;
    return (
      <Pressable
        key={item.handle}
        onPress={() => onPress(item.handle)}
        style={[styles.category, grid && styles.categoryLarge, active && styles.categoryActive]}
        accessibilityRole="button"
        accessibilityLabel={'تصفح قسم ' + item.title}
      >
        <Image source={{ uri: item.image }} resizeMode="cover" style={styles.categoryImage} accessibilityIgnoresInvertColors />
        <Text numberOfLines={2} style={[styles.categoryLabel, active && styles.activeText]}>{item.title}</Text>
      </Pressable>
    );
  });
  return grid ? (
    <View style={[styles.categoryStrip, styles.categoryGrid]}>{cards}</View>
  ) : (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryStrip}>{cards}</ScrollView>
  );
}

export function SectionHeading({ title, subtitle, action, onAction }) {
  return (
    <View style={styles.sectionHeading}>
      {action && <Pressable onPress={onAction} accessibilityRole="button" style={styles.actionPill}><Text style={styles.actionText}>{action}</Text></Pressable>}
      <View style={styles.headingCopy}>
        <Text style={styles.heading}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

export function ProductCard({ product, favorite, onFavorite, onOpen, onAdd, busy }) {
  const variant = firstAvailableVariant(product);
  const discount = discountPercent(variant);
  const buyable = Boolean(variant?.availableForSale && Number(variant?.price?.amount) > 0);
  const image = product.featuredImage?.url || product.images?.nodes?.[0]?.url;
  return (
    <View style={styles.productCard}>
      <Pressable onPress={() => onOpen(product)} accessibilityRole="button" accessibilityLabel={'عرض ' + product.title}>
        <View style={styles.productImageBox}>
          {image ? <Image source={{ uri: image }} style={styles.productImage} resizeMode="contain" /> : <Text style={styles.noImage}>صورة المنتج</Text>}
          {discount > 0 && <View style={styles.discount}><Text style={styles.discountText}>خصم {discount}%</Text></View>}
        </View>
      </Pressable>
      <Pressable
        onPress={() => onFavorite(product)}
        style={styles.favorite}
        accessibilityRole="button"
        accessibilityLabel={favorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
        accessibilityState={{ selected: favorite }}
      >
        <Ionicons name={favorite ? "heart" : "heart-outline"} size={22} color={favorite ? colors.primary : colors.text} />
      </Pressable>
      <Pressable onPress={() => onOpen(product)} accessibilityRole="button">
        <Text style={styles.productTitle} numberOfLines={2}>{product.title}</Text>
      </Pressable>
      <Text style={styles.productPrice}>{money(variant?.price)}</Text>
      {discount > 0 && <Text style={styles.oldPrice}>{money(variant.compareAtPrice)}</Text>}
      <Pressable
        style={[styles.addButton, !buyable && styles.disabled]}
        onPress={() => {
          if (!buyable) return;
          const variants = product.variants?.nodes || [];
          if (variants.length > 1) onOpen(product);
          else onAdd(product, variant.id, 1);
        }}
        disabled={!buyable || busy}
        accessibilityRole="button"
        accessibilityLabel={buyable ? 'أضف للسلة: ' + product.title : 'المنتج غير متوفر'}
      >
        <Text style={styles.addButtonText}>{buyable ? (product.variants?.nodes?.length > 1 ? 'اختر الخيارات' : 'إضافة للسلة') : 'غير متوفر'}</Text>
      </Pressable>
    </View>
  );
}

export function MessageState({ title, description, onRetry, retryLabel = 'إعادة المحاولة' }) {
  return (
    <View style={styles.message}>
      <Text style={styles.messageTitle}>{title}</Text>
      {description ? <Text style={styles.messageText}>{description}</Text> : null}
      {onRetry && <Pressable style={styles.retry} onPress={onRetry} accessibilityRole="button"><Text style={styles.retryText}>{retryLabel}</Text></Pressable>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.primary, paddingHorizontal: 14, paddingBottom: 10 },
  headerBar: { height: 57, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logoContainer: { borderRadius: 10, width: 142, height: 44, backgroundColor: '#fff', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  brandLogo: { width: 139, height: 42 },
  menuButton: { minWidth: 38, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  cartIcon: { position: 'relative', minWidth: 38, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  cartBadge: { position: 'absolute', top: 0, left: 0, borderRadius: 11, minWidth: 18, backgroundColor: colors.text, paddingHorizontal: 4 },
  cartBadgeText: { fontSize: 10, color: '#fff', textAlign: 'center' },
  searchBox: { height: 46, borderRadius: 24, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, gap: 8 },
  searchIcon: { color: colors.muted, fontSize: 22, marginRight: 7 },
  searchInput: { flex: 1, color: colors.text, fontSize: 13, paddingVertical: 0, writingDirection: 'rtl' },
  tagline: { color: '#fff', fontSize: 10, marginTop: 7, textAlign: 'right' },
  bottomBar: { backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.line, height: 72, flexDirection: 'row-reverse', justifyContent: 'space-around', alignItems: 'center' },
  tab: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 3, minHeight: 56 },
  tabIcon: { fontSize: 23, color: '#667085', textAlign: 'center', lineHeight: 27 },
  tabText: { fontSize: 11, color: colors.muted, textAlign: 'center' },
  activeText: { color: colors.primary, fontWeight: '800' },
  tabBadge: { position: 'absolute', top: -3, right: -9, borderRadius: 10, backgroundColor: colors.primary, minWidth: 15, paddingHorizontal: 2 },
  tabBadgeText: { color: '#fff', textAlign: 'center', fontSize: 10 },
  categoryStrip: { paddingVertical: 9, paddingHorizontal: 7, gap: 9, flexDirection: 'row-reverse' },
  categoryGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'space-between' },
  category: { borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', padding: 6, width: 119, alignItems: 'center' },
  categoryLarge: { width: '48%', marginBottom: 8 },
  categoryActive: { borderColor: colors.primary, backgroundColor: colors.soft },
  categoryImage: { width: '100%', height: 61, borderRadius: 9 },
  categoryLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center', color: colors.text, marginTop: 5 },
  sectionHeading: { marginTop: 14, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headingCopy: { alignItems: 'flex-end', flex: 1 },
  heading: { fontSize: 19, color: colors.text, fontWeight: '800', textAlign: 'right' },
  subtitle: { fontSize: 11, color: colors.muted, textAlign: 'right', marginTop: 3 },
  actionPill: { borderWidth: 1, borderColor: colors.line, borderRadius: 20, backgroundColor: '#fff', paddingVertical: 7, paddingHorizontal: 10, marginRight: 10 },
  actionText: { fontSize: 11, color: colors.primary, fontWeight: '600' },
  productCard: { backgroundColor: '#fff', borderRadius: 14, width: '48.4%', padding: 8, marginBottom: 12, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  productImageBox: { height: 145, backgroundColor: '#fff', borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  productImage: { height: '100%', width: '100%' },
  noImage: { fontSize: 10, color: colors.muted },
  discount: { position: 'absolute', top: 6, right: 6, backgroundColor: colors.primary, borderRadius: 6, paddingVertical: 3, paddingHorizontal: 5 },
  discountText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  favorite: { position: 'absolute', left: 13, top: 13, width: 32, height: 32, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line },
  favoriteText: { fontSize: 21, color: colors.text },
  productTitle: { color: colors.text, fontSize: 12, fontWeight: '700', height: 40, textAlign: 'right', marginTop: 9, writingDirection: 'rtl' },
  productPrice: { color: colors.primaryDark, textAlign: 'right', fontSize: 13, fontWeight: '800', marginTop: 4 },
  oldPrice: { textAlign: 'right', fontSize: 11, color: '#8F97A4', textDecorationLine: 'line-through' },
  addButton: { marginTop: 10, backgroundColor: colors.primary, borderRadius: 9, paddingVertical: 11, alignItems: 'center' },
  addButtonText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  disabled: { opacity: 0.45 },
  message: { paddingVertical: 40, paddingHorizontal: 20, alignItems: 'center' },
  messageTitle: { color: colors.text, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  messageText: { color: colors.muted, fontSize: 12, marginTop: 8, textAlign: 'center', lineHeight: 21 },
  retry: { backgroundColor: colors.primary, borderRadius: 9, paddingVertical: 11, paddingHorizontal: 18, marginTop: 16 },
  retryText: { color: '#fff', fontWeight: '700' },
});
