import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert, BackHandler, Linking, Pressable, SafeAreaView,
  StatusBar, StyleSheet, Text, View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProductListScreen from './ProductListScreen';
import ProductDetailScreen from './ProductDetailScreen';
import CartScreen from './CartScreen';
import {
  SHOP_DOMAIN, addCartLines, createCart, fetchCart, removeCartLine, updateCartLine,
} from './storefrontClient';
import { cleanWishlist, cartQuantity } from './src/theme/catalogUtils';
import { colors } from './src/theme/indexesTheme';
import { BottomNavigation, StoreHeader } from './src/components/StorefrontUI';

const STORAGE_CART_ID = 'indexes.mobile.cartId.v1';
const STORAGE_WISHLIST = 'indexes.mobile.wishlist.v1';

function AccountScreen() {
  const openAccount = async () => {
    if (SHOP_DOMAIN === 'your-shop.myshopify.com') {
      Alert.alert('إعداد المتجر', 'يجب ضبط نطاق Shopify أولًا لفتح حساب العميل.');
      return;
    }
    try {
      await Linking.openURL('https://' + SHOP_DOMAIN + '/account');
    } catch (_) {
      Alert.alert('تعذر فتح الحساب', 'تحقق من اتصال الإنترنت وحاول مرة أخرى.');
    }
  };
  return (
    <View style={styles.accountPage}>
      <Text style={styles.accountSymbol}>♙</Text>
      <Text style={styles.accountHeading}>حسابي</Text>
      <Text style={styles.accountBody}>لأمان بياناتك، يفتح تسجيل الدخول في حساب Shopify الرسمي للمتجر. المصادقة الأصلية داخل التطبيق تحتاج إعداد Customer Account API منفصلًا.</Text>
      <Pressable style={styles.accountButton} onPress={openAccount} accessibilityRole="button">
        <Text style={styles.accountButtonText}>فتح حسابي في المتجر</Text>
      </Pressable>
    </View>
  );
}

function App() {
  const [tab, setTab] = useState('home');
  const [category, setCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState('');
  const [cartBusy, setCartBusy] = useState(false);
  const cartRef = useRef(null);
  const busyRef = useRef(false);

  const restoreCart = useCallback(async () => {
    setCartLoading(true);
    setCartError('');
    try {
      const storedId = await AsyncStorage.getItem(STORAGE_CART_ID);
      if (storedId) {
        const saved = await fetchCart(storedId);
        cartRef.current = saved;
        setCart(saved);
        if (!saved) await AsyncStorage.removeItem(STORAGE_CART_ID);
      } else {
        cartRef.current = null;
        setCart(null);
      }
    } catch (error) {
      setCartError(error.message || 'تعذر استعادة سلة التسوق.');
    } finally {
      setCartLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_WISHLIST);
        if (raw && mounted) setFavorites(cleanWishlist(JSON.parse(raw)));
      } catch (_) {
        // Invalid or unavailable local storage must not prevent storefront startup.
      }
    })();
    restoreCart();
    return () => { mounted = false; };
  }, [restoreCart]);

  useEffect(() => {
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      if (selectedProduct) {
        setSelectedProduct(null);
        return true;
      }
      if (tab !== 'home') {
        setTab('home');
        setCategory(null);
        return true;
      }
      return false;
    });
    return () => listener.remove();
  }, [selectedProduct, tab]);

  const persistCart = async next => {
    cartRef.current = next;
    setCart(next);
    setCartError('');
    try {
      if (next?.id) await AsyncStorage.setItem(STORAGE_CART_ID, next.id);
      else await AsyncStorage.removeItem(STORAGE_CART_ID);
    } catch (_) {
      Alert.alert('تنبيه', 'تم تعديل السلة لكن تعذر حفظها على الجهاز.');
    }
  };

  const performCartMutation = async operation => {
    if (busyRef.current || cartLoading || cartError) {
      if (cartError) Alert.alert('تعذر تحديث السلة', 'أعد محاولة استعادة السلة أولًا.');
      return;
    }
    busyRef.current = true;
    setCartBusy(true);
    try {
      const updated = await operation(cartRef.current);
      await persistCart(updated);
      setSelectedProduct(null);
      setTab('cart');
    } catch (error) {
      Alert.alert('تعذر تحديث السلة', error.message || 'حاول مرة أخرى.');
    } finally {
      busyRef.current = false;
      setCartBusy(false);
    }
  };

  const addProduct = (product, variantId, quantity) => {
    performCartMutation(existing => existing?.id
      ? addCartLines(existing.id, variantId, quantity)
      : createCart(variantId, quantity));
  };

  const changeLine = (lineId, quantity) => {
    performCartMutation(existing => updateCartLine(existing.id, lineId, quantity));
  };

  const removeLine = lineId => {
    performCartMutation(existing => removeCartLine(existing.id, lineId));
  };

  const toggleFavorite = product => {
    setFavorites(previous => {
      const next = previous.some(item => item.id === product.id)
        ? previous.filter(item => item.id !== product.id)
        : cleanWishlist([...previous, product]);
      AsyncStorage.setItem(STORAGE_WISHLIST, JSON.stringify(next)).catch(() => {
        Alert.alert('تنبيه', 'تعذر حفظ المفضلة على الجهاز.');
      });
      return next;
    });
  };

  const selectTab = next => {
    setSelectedProduct(null);
    setTab(next);
    setSearch('');
    setCategory(null);
  };

  const selectCategory = (handle, nextTab) => {
    setSelectedProduct(null);
    setSearch('');
    setCategory(handle);
    setTab(nextTab || 'home');
  };

  const setSearchQuery = value => {
    setSearch(value);
    setSelectedProduct(null);
    setCategory(null);
    setTab('home');
  };

  const cartCount = cartQuantity(cart);
  const mode = tab === 'wishlist' ? 'wishlist' : tab === 'categories' ? 'categories' : 'home';

  return (
      <SafeAreaView style={styles.safe}>
        <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
        <StoreHeader
          search={search}
          onSearch={setSearchQuery}
          onHome={() => selectTab('home')}
          onCategories={() => selectTab('categories')}
          onCart={() => selectTab('cart')}
          cartCount={cartCount}
        />
        <View style={styles.body}>
          {selectedProduct ? (
            <ProductDetailScreen
              key={selectedProduct.id}
              product={selectedProduct}
              favorite={favorites.some(item => item.id === selectedProduct.id)}
              onFavorite={toggleFavorite}
              onAddToCart={addProduct}
              onBack={() => setSelectedProduct(null)}
              busy={cartBusy || cartLoading || Boolean(cartError)}
            />
          ) : tab === 'cart' ? (
            <CartScreen
              cart={cart}
              loading={cartLoading}
              busy={cartBusy}
              restoreError={cartError}
              onRetryRestore={restoreCart}
              onUpdateQuantity={changeLine}
              onRemoveLine={removeLine}
              onBrowse={() => selectTab('home')}
            />
          ) : tab === 'account' ? (
            <AccountScreen />
          ) : (
            <ProductListScreen
              mode={mode}
              selectedCategory={category}
              search={search}
              favorites={favorites}
              onCategory={selectCategory}
              onFavorite={toggleFavorite}
              onOpenProduct={setSelectedProduct}
              onAddToCart={addProduct}
              cartBusy={cartBusy || cartLoading || Boolean(cartError)}
            />
          )}
        </View>
        <BottomNavigation selected={tab} onSelect={selectTab} cartCount={cartCount} />
      </SafeAreaView>
  );
}

export default App;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  body: { flex: 1, backgroundColor: colors.background },
  accountPage: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 25, backgroundColor: colors.background },
  accountSymbol: { fontSize: 45, color: colors.primary },
  accountHeading: { fontSize: 22, fontWeight: '800', marginTop: 10, color: colors.text },
  accountBody: { color: colors.muted, fontSize: 13, textAlign: 'center', writingDirection: 'rtl', lineHeight: 24, marginVertical: 18 },
  accountButton: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 21, paddingVertical: 15 },
  accountButtonText: { color: '#fff', fontWeight: '800' },
});
