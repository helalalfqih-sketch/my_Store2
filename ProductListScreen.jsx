import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, FlatList, RefreshControl, StyleSheet, View,
} from 'react-native';
import { fetchCollectionProductsPage, fetchCollections, fetchProductsPage } from './storefrontClient';
import { categories, colors } from './src/theme/indexesTheme';
import { HomeVideoCarousel, HomePromoTiles, AutoCategoryRail } from './src/components/HomeMedia';
import { CategoryRail, MessageState, ProductCard, SectionHeading } from './src/components/StorefrontUI';

export default function ProductListScreen({
  mode = 'home', search = '', selectedCategory = null, favorites = [],
  onCategory, onFavorite, onOpenProduct, onAddToCart, cartBusy = false,
}) {
  const [products, setProducts] = useState([]);
  const [publishedCollections, setPublishedCollections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [pageInfo, setPageInfo] = useState({ hasNextPage: false, endCursor: null });
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState('');
  const loadingMoreRef = useRef(false);
  const [debouncedSearch, setDebouncedSearch] = useState(search.trim());

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(handle);
  }, [search]);

  const requestKey = [mode, selectedCategory, debouncedSearch, refreshVersion].join('|');
  const currentKey = useRef(requestKey);
  currentKey.current = requestKey;

  useEffect(() => {
    if (mode === 'wishlist') {
      setLoading(false);
      setRefreshing(false);
      setError('');
      return undefined;
    }
    let alive = true;
    loadingMoreRef.current = false;
    setLoading(true);
    setLoadingMore(false);
    setLoadMoreError('');
    setPageInfo({ hasNextPage: false, endCursor: null });
    setError('');
    const request = selectedCategory && !debouncedSearch
      ? fetchCollectionProductsPage(selectedCategory)
      : fetchProductsPage({ query: debouncedSearch || null });
    request
      .then(page => {
        if (alive) {
          setProducts(page.items);
          setPageInfo(page.pageInfo);
        }
      })
      .catch(reason => { if (alive) { setError(reason.message || 'تعذر تحميل المنتجات.'); setProducts([]); } })
      .finally(() => { if (alive) { setLoading(false); setRefreshing(false); } });
    return () => { alive = false; };
  }, [mode, selectedCategory, debouncedSearch, refreshVersion]);

  const loadMore = () => {
    if (mode === 'wishlist' || loading || loadingMoreRef.current || !pageInfo.hasNextPage || !pageInfo.endCursor || error) return;
    const key = requestKey;
    loadingMoreRef.current = true;
    setLoadingMoreError('');
    setLoadingMore(true);
    const request = selectedCategory && !debouncedSearch
      ? fetchCollectionProductsPage(selectedCategory, { after: pageInfo.endCursor })
      : fetchProductsPage({ query: debouncedSearch || null, after: pageInfo.endCursor });
    request.then(page => {
      if (currentKey.current !== key) return;
      setProducts(previous => {
        const ids = new Set(previous.map(product => product.id));
        return [...previous, ...page.items.filter(product => !ids.has(product.id))];
      });
      setPageInfo(page.pageInfo);
    }).catch(reason => {
      if (currentKey.current === key) setLoadMoreError(reason.message || 'تعذر تحميل المزيد.');
    }).finally(() => {
      loadingMoreRef.current = false;
      if (currentKey.current === key) setLoadingMore(false);
    });
  };

  useEffect(() => {
    let alive = true;
    fetchCollections().then(items => {
      if (alive) setPublishedCollections(items);
    }).catch(() => {
      if (alive) setPublishedCollections(null);
    });
    return () => { alive = false; };
  }, [refreshVersion]);

  const shownCategories = publishedCollections === null ? categories : categories.filter(item => publishedCollections.some(collection => collection.handle === item.handle));
  const items = mode === 'wishlist' ? favorites : products;
  const activeCategory = categories.find(item => item.handle === selectedCategory);
  const home = mode === 'home' && !selectedCategory && !debouncedSearch;
  const categoriesPage = mode === 'categories' && !selectedCategory && !debouncedSearch;

  const header = (
    <View>
      {home && (
        <>
          <HomeVideoCarousel onNavigate={onCategory} />
          <HomePromoTiles onNavigate={onCategory} />
          <SectionHeading
            title="الأقسام الرئيسية"
            action="عرض الكل"
            onAction={() => onCategory(null, 'categories')}
          />
          <AutoCategoryRail
            items={shownCategories}
            onSelect={onCategory}
            selectedHandle={selectedCategory}
          />
        </>
      )}
      {categoriesPage && (
        <>
          <SectionHeading title="الأقسام الرئيسية" subtitle="تسوق حسب القسم المناسب لك" />
          <CategoryRail grid selectedHandle={selectedCategory} onPress={onCategory} items={shownCategories} />
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
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.primary} style={styles.indicator} /> : loadMoreError ? <MessageState title="تعذر تحميل المزيد" description={loadMoreError} onRetry={loadMore} /> : null}
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
  indicator: { marginVertical: 22 },
});
