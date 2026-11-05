import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, FlatList, Image, Pressable, RefreshControl,
  ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { fetchCollectionProducts, fetchProducts } from './storefrontClient';
import { categories, colors, promoSlides, promoTiles } from './src/theme/indexesTheme';
import { CategoryRail, MessageState, ProductCard, SectionHeading } from './src/components/StorefrontUI';

export default function ProductListScreen({
  mode = 'home', search = '', selectedCategory = null, favorites = [],
  onCategory, onFavorite, onOpenProduct, onAddToCart, cartBusy = false,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState(search.trim());

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(handle);
  }, [search]);

  useEffect(() => {
    if (mode === 'wishlist') {
      setLoading(false);
      setRefreshing(false);
      setError('');
      return undefined;
    }
    let alive = true;
    setLoading(true);
    setError('');
    const request = selectedCategory && !debouncedSearch
      ? fetchCollectionProducts(selectedCategory)
      : fetchProducts({ query: debouncedSearch || null });
    request
      .then(result => { if (alive) setProducts(result); })
      .catch(reason => { if (alive) { setError(reason.message || 'تعذر تحميل المنتجات.'); setProducts([]); } })
      .finally(() => { if (alive) { setLoading(false); setRefreshing(false); } });
    return () => { alive = false; };
  }, [mode, selectedCategory, debouncedSearch, refreshVersion]);

  const items = mode === 'wishlist' ? favorites : products;
  const activeCategory = categories.find(item => item.handle === selectedCategory);
  const home = mode === 'home' && !selectedCategory && !debouncedSearch;
  const categoriesPage = mode === 'categories' && !selectedCategory && !debouncedSearch;

  const header = (
    <View>
      {home && (
        <>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.promoStrip} contentContainerStyle={styles.promoStripInner}>
            {promoSlides.map(slide => (
              <Pressable key={slide.key} style={styles.promoCard} onPress={() => onCategory(slide.handle)} accessibilityRole="button" accessibilityLabel={slide.title}>
                <Image source={{ uri: slide.image }} style={styles.promoImage} resizeMode="contain" />
              </Pressable>
            ))}
          </ScrollView>
          <View style={styles.promoTiles}>
            {promoTiles.map(tile => (
              <Pressable key={tile.key} onPress={() => onCategory(tile.handle)} style={styles.promoTile} accessibilityRole="button" accessibilityLabel={tile.title}>
                <Image source={{ uri: tile.image }} style={styles.tileImage} resizeMode="contain" />
              </Pressable>
            ))}
          </View>
          <SectionHeading title="الأقسام الرئيسية" action="عرض الكل" onAction={() => onCategory(null, 'categories')} />
          <CategoryRail onPress={onCategory} selectedHandle={selectedCategory} />
        </>
      )}
      {categoriesPage && (
        <>
          <SectionHeading title="الأقسام الرئيسية" subtitle="تسوق حسب القسم المناسب لك" />
          <CategoryRail grid selectedHandle={selectedCategory} onPress={onCategory} />
        </>
      )}
      <SectionHeading
        title={mode === 'wishlist' ? 'المنتجات المفضلة' : debouncedSearch ? 'نتائج البحث' : activeCategory?.title || 'منتجات مختارة لك'}
        subtitle={mode === 'wishlist' ? 'المنتجات التي حفظتها' : debouncedSearch ? 'نتائج البحث في Shopify' : 'تصفح أحدث المنتجات المتاحة'}
        action={selectedCategory ? 'كل المنتجات' : null}
        onAction={() => onCategory(null)}
      />
      {loading && mode !== 'wishlist' && <ActivityIndicator size="large" color={colors.primary} style={styles.indicator} />}
      {error && <MessageState title="تعذر عرض المنتجات" description={error} onRetry={() => setRefreshVersion(value => value + 1)} />}
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.list}
      data={loading || error ? [] : items}
      keyExtractor={item => item.id}
      numColumns={2}
      columnWrapperStyle={styles.columns}
      ListHeaderComponent={header}
      ListEmptyComponent={!loading && !error ? (
        <MessageState
          title={mode === 'wishlist' ? 'لم تضف منتجات للمفضلة بعد' : 'لا توجد منتجات لعرضها'}
          description={mode === 'wishlist' ? 'اضغط على القلب في بطاقة المنتج لحفظه هنا.' : 'جرّب قسمًا آخر أو غيّر عبارة البحث.'}
        />
      ) : null}
      renderItem={({ item }) => (
        <ProductCard
          product={item}
          favorite={favorites.some(favorite => favorite.id === item.id)}
          onFavorite={onFavorite}
          onOpen={onOpenProduct}
          onAdd={onAddToCart}
          busy={cartBusy}
        />
      )}
      refreshControl={mode === 'wishlist' ? undefined : (
        <RefreshControl refreshing={refreshing} tintColor={colors.primary} onRefresh={() => {
          setRefreshing(true);
          setRefreshVersion(value => value + 1);
        }} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  list: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 24 },
  columns: { justifyContent: 'space-between' },
  promoStrip: { marginHorizontal: -12 },
  promoStripInner: { gap: 9, paddingHorizontal: 12 },
  promoCard: { width: 310, height: 170, borderRadius: 14, backgroundColor: '#fff', overflow: 'hidden' },
  promoImage: { width: '100%', height: '100%' },
  promoTiles: { flexDirection: 'row-reverse', gap: 10, marginTop: 12 },
  promoTile: { flex: 1, backgroundColor: '#fff', borderRadius: 11, overflow: 'hidden', height: 99 },
  tileImage: { width: '100%', height: '100%' },
  indicator: { marginVertical: 22 },
});
