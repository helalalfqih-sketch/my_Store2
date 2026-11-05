import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/indexesTheme';

const quickCategories = [
  { key: 'all', title: 'الكل', handle: null },
  { key: 'car', title: 'مستلزمات السيارات', handle: 'السيارات-وملحقاتها' },
  { key: 'home', title: 'المنزل والمطبخ', handle: 'المنزل-والمطبخ' },
  { key: 'electronics', title: 'الإلكترونيات', handle: 'الإلكترونيات-والهواتف' },
  { key: 'tools', title: 'الأدوات والمعدات', handle: 'الأدوات-والمعدات' },
];

export function HomepageFeaturedCategoryLinks({ onCategory }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.quickLinks}
      accessibilityLabel="الأقسام السريعة للمنتجات"
    >
      {quickCategories.map(item => (
        <Pressable
          key={item.key}
          onPress={() => onCategory(item.handle)}
          accessibilityRole="button"
          accessibilityLabel={'عرض ' + item.title}
          style={[styles.quickLink, !item.handle && styles.quickLinkAll]}
        >
          <Text style={[styles.quickLinkText, !item.handle && styles.quickLinkAllText]}>{item.title}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// Titles/descriptions are the actual locale keys used by the draft's
// sections/indexes-home-services.liquid and locales/ar.json.
// No WhatsApp number is embedded because the draft does not configure one.
const services = [
  {
    key: 'delivery', title: 'معلومات التوصيل',
    text: 'تواصل معنا لمعرفة إمكانية التوصيل إلى منطقتك وتكلفته وموعده قبل تأكيد الطلب.',
  },
  {
    key: 'payment', title: 'الدفع عند الاستلام',
    text: 'فتح واتساب لا يؤكد الطلب. يُؤكَّد الطلب بالتواصل مع المتجر، والدفع عند الاستلام.',
    action: 'عرض السلة',
  },
  { key: 'contact', title: 'تواصل معنا', text: '' },
];

export function HomepageServices({ onOpenCart }) {
  const [expanded, setExpanded] = useState(null);
  return (
    <View style={styles.services} accessibilityLabel="معلومات الطلب والتوصيل">
      <Text style={styles.servicesHeading}>معلومات الطلب والتوصيل</Text>
      {services.map(service => (
        <View key={service.key} style={styles.service}>
          <Pressable
            onPress={() => setExpanded(previous => previous === service.key ? null : service.key)}
            accessibilityRole="button"
            accessibilityState={{ expanded: expanded === service.key }}
            accessibilityLabel={service.title}
            style={styles.serviceHeader}
          >
            <Text style={styles.chevron}>{expanded === service.key ? '⌃' : '⌄'}</Text>
            <Text style={styles.serviceTitle}>{service.title}</Text>
          </Pressable>
          {expanded === service.key && (
            <View style={styles.serviceBody}>
              {service.text ? <Text style={styles.serviceDescription}>{service.text}</Text> : null}
              {service.action && (
                <Pressable
                  onPress={onOpenCart}
                  style={styles.cartLink}
                  accessibilityRole="button"
                  accessibilityLabel={service.action}
                >
                  <Text style={styles.cartLinkText}>{service.action}</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  quickLinks: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, paddingBottom: 12, paddingTop: 2 },
  quickLink: { backgroundColor: '#fff', borderRadius: 22, borderWidth: 1, borderColor: colors.line, paddingVertical: 11, paddingHorizontal: 14, minHeight: 44, justifyContent: 'center' },
  quickLinkAll: { backgroundColor: colors.primary, borderColor: colors.primary },
  quickLinkText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  quickLinkAllText: { color: '#fff' },
  services: { marginTop: 18, marginBottom: 22, padding: 12, backgroundColor: '#fff', borderRadius: 16, borderColor: colors.line, borderWidth: 1 },
  servicesHeading: { fontSize: 17, fontWeight: '800', color: colors.text, textAlign: 'right', marginBottom: 10 },
  service: { borderTopWidth: 1, borderTopColor: colors.line },
  serviceHeader: { minHeight: 48, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  serviceTitle: { color: colors.text, fontSize: 13, fontWeight: '700', textAlign: 'right' },
  chevron: { color: colors.primary, fontSize: 22 },
  serviceBody: { paddingBottom: 13, alignItems: 'flex-end' },
  serviceDescription: { color: colors.muted, fontSize: 12, textAlign: 'right', lineHeight: 22 },
  cartLink: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 12, marginTop: 8, backgroundColor: colors.soft, borderRadius: 8 },
  cartLinkText: { color: colors.primaryDark, fontWeight: '800', fontSize: 12 },
});
