import React, { useState } from 'react';
import {
  Image, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { colors } from './src/theme/indexesTheme';
import { discountPercent, firstAvailableVariant, money } from './src/theme/catalogUtils';

export default function ProductDetailScreen({
  product, favorite, onFavorite, onAddToCart, onBack, busy,
}) {
  const variants = product?.variants?.nodes || [];
  const [variantId, setVariantId] = useState(firstAvailableVariant(product)?.id);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const variant = variants.find(item => item.id === variantId) || variants[0];
  const photos = product?.images?.nodes?.length
    ? product.images.nodes
    : product?.featuredImage ? [product.featuredImage] : [];
  const activeImage = photos[selectedImage]?.url || product?.featuredImage?.url;
  const buyable = Boolean(variant?.availableForSale && Number(variant.price?.amount) > 0);
  const discount = discountPercent(variant);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.toolbar}>
        <Pressable onPress={() => onFavorite(product)} accessibilityLabel={favorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'} accessibilityRole="button" style={styles.toolbarButton}>
          <Text style={[styles.toolbarIcon, favorite && styles.favorite]}>{favorite ? '♥' : '♡'}</Text>
        </Pressable>
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="العودة إلى المنتجات" style={styles.toolbarButton}>
          <Text style={styles.toolbarIcon}>‹</Text>
        </Pressable>
      </View>
      <View style={styles.gallery}>
        {activeImage ? <Image source={{ uri: activeImage }} style={styles.mainImage} resizeMode="contain" /> : <Text style={styles.placeholder}>لا تتوفر صورة للمنتج</Text>}
        {discount > 0 && <View style={styles.discount}><Text style={styles.discountText}>خصم {discount}%</Text></View>}
        {photos.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnails}>
            {photos.map((photo, index) => (
              <Pressable key={photo.url} onPress={() => setSelectedImage(index)} accessibilityLabel={'الصورة رقم ' + (index + 1)} accessibilityRole="button">
                <Image source={{ uri: photo.url }} style={[styles.thumb, selectedImage === index && styles.thumbActive]} />
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
      <View style={styles.details}>
        <Text style={styles.title}>{product.title}</Text>
        <View style={styles.prices}>
          {discount > 0 && <Text style={styles.oldPrice}>{money(variant?.compareAtPrice)}</Text>}
          <Text style={styles.price}>{money(variant?.price)}</Text>
        </View>
        {variants.length > 1 && (
          <>
            <Text style={styles.fieldTitle}>اختر النوع</Text>
            <View style={styles.variants}>
              {variants.map(item => (
                <Pressable
                  key={item.id}
                  onPress={() => setVariantId(item.id)}
                  style={[styles.variant, item.id === variant?.id && styles.variantActive, !item.availableForSale && styles.variantDisabled]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: item.id === variant?.id, disabled: !item.availableForSale }}
                  disabled={!item.availableForSale}
                >
                  <Text style={[styles.variantText, item.id === variant?.id && styles.variantTextActive]}>{item.title}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
        <Text style={styles.fieldTitle}>الكمية</Text>
        <View style={styles.quantity}>
          <Pressable onPress={() => setQuantity(value => Math.min(100, value + 1))} accessibilityRole="button" accessibilityLabel="زيادة الكمية" style={styles.quantityButton}><Text style={styles.quantitySymbol}>+</Text></Pressable>
          <Text style={styles.quantityValue}>{quantity}</Text>
          <Pressable onPress={() => setQuantity(value => Math.max(1, value - 1))} accessibilityRole="button" accessibilityLabel="تقليل الكمية" style={styles.quantityButton}><Text style={styles.quantitySymbol}>−</Text></Pressable>
        </View>
        <Pressable
          disabled={!buyable || busy}
          onPress={() => onAddToCart(product, variant.id, quantity)}
          accessibilityRole="button"
          accessibilityLabel="إضافة المنتج إلى السلة"
          style={[styles.add, (!buyable || busy) && styles.addDisabled]}
        >
          <Text style={styles.addText}>{busy ? 'جارٍ تحديث السلة...' : buyable ? 'إضافة إلى السلة' : 'غير متوفر حاليًا'}</Text>
        </Pressable>
        {product.description ? (
          <View style={styles.description}>
            <Text style={styles.descriptionTitle}>تفاصيل المنتج</Text>
            <Text style={styles.descriptionText}>{product.description}</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: { padding: 12, paddingBottom: 30 },
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  toolbarButton: { width: 40, height: 40, borderRadius: 22, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  toolbarIcon: { fontSize: 27, color: colors.text },
  favorite: { color: colors.primary },
  gallery: { backgroundColor: '#fff', borderRadius: 16, padding: 10, borderColor: colors.line, borderWidth: 1 },
  mainImage: { width: '100%', height: 285, backgroundColor: '#F4F5F7', borderRadius: 12 },
  placeholder: { height: 285, textAlignVertical: 'center', textAlign: 'center', color: colors.muted },
  thumbnails: { flexDirection: 'row-reverse', gap: 7, marginTop: 10 },
  thumb: { width: 62, height: 62, borderRadius: 9, borderWidth: 1, borderColor: colors.line },
  thumbActive: { borderWidth: 2, borderColor: colors.primary },
  discount: { position: 'absolute', top: 16, right: 16, backgroundColor: colors.primary, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 6 },
  discountText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  details: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginTop: 12, borderWidth: 1, borderColor: colors.line },
  title: { fontSize: 23, fontWeight: '800', textAlign: 'right', writingDirection: 'rtl', color: colors.text },
  prices: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 10, marginTop: 14 },
  price: { color: colors.primaryDark, fontSize: 23, fontWeight: '800' },
  oldPrice: { color: '#9399A5', textDecorationLine: 'line-through', fontSize: 13 },
  fieldTitle: { marginTop: 21, marginBottom: 9, textAlign: 'right', fontWeight: '800', fontSize: 13, color: colors.text },
  variants: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  variant: { borderRadius: 30, paddingHorizontal: 13, paddingVertical: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line },
  variantActive: { backgroundColor: colors.soft, borderColor: colors.primary },
  variantDisabled: { opacity: 0.4 },
  variantText: { color: colors.text, fontSize: 12 },
  variantTextActive: { color: colors.primary, fontWeight: '800' },
  quantity: { flexDirection: 'row', alignSelf: 'flex-end', alignItems: 'center', borderWidth: 1, borderColor: colors.line, borderRadius: 10 },
  quantityButton: { width: 44, height: 42, alignItems: 'center', justifyContent: 'center' },
  quantitySymbol: { fontSize: 22, color: colors.text },
  quantityValue: { minWidth: 40, textAlign: 'center', color: colors.text, fontWeight: '800' },
  add: { backgroundColor: colors.primary, borderRadius: 10, marginTop: 22, paddingVertical: 15, alignItems: 'center' },
  addDisabled: { opacity: 0.45 },
  addText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  description: { marginTop: 22, paddingTop: 13, borderTopWidth: 1, borderColor: colors.line },
  descriptionTitle: { textAlign: 'right', fontWeight: '800', fontSize: 15, color: colors.text },
  descriptionText: { textAlign: 'right', marginTop: 9, lineHeight: 24, fontSize: 13, color: colors.muted, writingDirection: 'rtl' },
});
