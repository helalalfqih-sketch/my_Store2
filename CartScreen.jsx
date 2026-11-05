import React, { useEffect, useState } from 'react';
import {
  Alert, Image, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { useShopifyCheckoutSheet } from '@shopify/checkout-sheet-kit';
import { colors } from './src/theme/indexesTheme';
import { cartQuantity, money } from './src/theme/catalogUtils';
import { MessageState } from './src/components/StorefrontUI';

export default function CartScreen({
  cart, loading, busy, restoreError, onRetryRestore, onUpdateQuantity,
  onRemoveLine, onOrderComplete, onBrowse,
}) {
  const checkout = useShopifyCheckoutSheet();
  const [presenting, setPresenting] = useState(false);
  const lines = cart?.lines?.nodes || [];
  const count = cartQuantity(cart);

  useEffect(() => {
    const completed = checkout.addEventListener('completed', event => {
      setPresenting(false);
      onOrderComplete(event);
    });
    const closed = checkout.addEventListener('close', () => setPresenting(false));
    const failed = checkout.addEventListener('error', error => {
      setPresenting(false);
      Alert.alert('تعذر إتمام الدفع', error?.message || 'حاول مرة أخرى.');
    });
    return () => {
      completed.remove();
      closed.remove();
      failed.remove();
    };
  }, [checkout, onOrderComplete]);

  const presentCheckout = async () => {
    if (!cart?.checkoutUrl || !count || presenting) return;
    try {
      setPresenting(true);
      await checkout.present(cart.checkoutUrl);
      // The completed / close / error listeners own the terminal state.
    } catch (error) {
      setPresenting(false);
      Alert.alert('تعذر فتح الدفع', error?.message || 'حاول مرة أخرى.');
    }
  };

  if (loading) return <MessageState title="جارٍ استعادة سلة التسوق..." />;
  if (restoreError) return <MessageState title="تعذر استعادة السلة" description={restoreError} onRetry={onRetryRestore} />;
  if (!lines.length) return (
    <View style={styles.empty}>
      <MessageState title="سلة التسوق فارغة" description="اختر المنتجات التي تعجبك، ثم أضفها إلى السلة." onRetry={onBrowse} retryLabel="تصفح المنتجات" />
    </View>
  );

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>سلة التسوق ({count})</Text>
      {lines.map(line => {
        const product = line.merchandise?.product;
        const image = line.merchandise?.image?.url || product?.featuredImage?.url;
        return (
          <View style={styles.item} key={line.id}>
            {image ? <Image source={{ uri: image }} resizeMode="contain" style={styles.itemImage} /> : <View style={styles.itemImage} />}
            <View style={styles.itemBody}>
              <Text style={styles.itemName} numberOfLines={2}>{product?.title || 'منتج'}</Text>
              {line.merchandise?.title && line.merchandise.title !== 'Default Title' && (
                <Text style={styles.variantName}>{line.merchandise.title}</Text>
              )}
              <Text style={styles.itemPrice}>{money(line.cost?.totalAmount)}</Text>
              <View style={styles.itemActions}>
                <Pressable onPress={() => onRemoveLine(line.id)} disabled={busy} accessibilityRole="button" accessibilityLabel="حذف المنتج" style={styles.remove}>
                  <Text style={styles.removeText}>حذف</Text>
                </Pressable>
                <View style={styles.stepper}>
                  <Pressable disabled={busy || line.quantity >= 100} onPress={() => onUpdateQuantity(line.id, line.quantity + 1)} accessibilityLabel="زيادة الكمية" accessibilityRole="button" style={styles.step}><Text style={styles.stepText}>+</Text></Pressable>
                  <Text style={styles.quantity}>{line.quantity}</Text>
                  <Pressable disabled={busy} onPress={() => line.quantity <= 1 ? onRemoveLine(line.id) : onUpdateQuantity(line.id, line.quantity - 1)} accessibilityRole="button" accessibilityLabel="تقليل الكمية" style={styles.step}><Text style={styles.stepText}>−</Text></Pressable>
                </View>
              </View>
            </View>
          </View>
        );
      })}
      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>ملخص السلة</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.amount}>{money(cart.cost?.subtotalAmount)}</Text>
          <Text style={styles.label}>المجموع الفرعي</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.total}>{money(cart.cost?.totalAmount)}</Text>
          <Text style={styles.totalLabel}>المجموع الحالي</Text>
        </View>
        <Text style={styles.disclaimer}>يتم تأكيد الشحن والضرائب ووسائل الدفع المتاحة داخل Shopify Checkout.</Text>
        <Pressable style={[styles.checkoutButton, (busy || presenting) && styles.disabled]} onPress={presentCheckout} disabled={busy || presenting} accessibilityRole="button" accessibilityLabel="المتابعة إلى الدفع">
          <Text style={styles.checkoutText}>{presenting ? 'جارٍ فتح الدفع...' : 'المتابعة إلى الدفع'}</Text>
        </Pressable>
        <Pressable onPress={onBrowse} style={styles.continueButton} accessibilityRole="button"><Text style={styles.continueText}>متابعة التسوق</Text></Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: { padding: 14, paddingBottom: 28 },
  empty: { flex: 1, backgroundColor: colors.background, justifyContent: 'center' },
  heading: { color: colors.text, fontWeight: '800', fontSize: 22, textAlign: 'right', marginBottom: 15 },
  item: { flexDirection: 'row-reverse', padding: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: 14, marginBottom: 10, gap: 11 },
  itemImage: { width: 95, height: 95, borderRadius: 10, backgroundColor: '#F4F5F7' },
  itemBody: { flex: 1, alignItems: 'flex-end' },
  itemName: { fontWeight: '800', fontSize: 13, color: colors.text, textAlign: 'right' },
  variantName: { fontSize: 11, color: colors.muted, textAlign: 'right', marginTop: 4 },
  itemPrice: { fontWeight: '800', color: colors.primaryDark, marginTop: 8, fontSize: 14 },
  itemActions: { marginTop: 9, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  remove: { paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: '#FFD5D9', borderRadius: 8 },
  removeText: { color: colors.primaryDark, fontSize: 11 },
  stepper: { flexDirection: 'row', borderWidth: 1, borderColor: colors.line, borderRadius: 8, alignItems: 'center' },
  step: { width: 32, height: 30, alignItems: 'center', justifyContent: 'center' },
  stepText: { color: colors.text, fontSize: 18 },
  quantity: { width: 29, textAlign: 'center', fontSize: 12, fontWeight: '800', color: colors.text },
  summary: { marginTop: 11, borderRadius: 16, padding: 17, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line },
  summaryTitle: { fontWeight: '800', fontSize: 18, textAlign: 'right', color: colors.text, marginBottom: 14 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9 },
  label: { color: colors.muted, fontSize: 13 },
  amount: { color: colors.text, fontSize: 14 },
  totalLabel: { color: colors.text, fontWeight: '800', fontSize: 15 },
  total: { color: colors.primaryDark, fontWeight: '800', fontSize: 18 },
  disclaimer: { textAlign: 'right', color: colors.muted, fontSize: 11, lineHeight: 19, marginTop: 10 },
  checkoutButton: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 15, alignItems: 'center', marginTop: 16 },
  checkoutText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  disabled: { opacity: 0.5 },
  continueButton: { paddingVertical: 14, alignItems: 'center' },
  continueText: { color: colors.primaryDark, fontWeight: '700' },
});
