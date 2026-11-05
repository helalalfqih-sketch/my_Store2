import React, { useEffect, useRef, useState } from 'react';
import {
  AppState, Image, Pressable, ScrollView, StyleSheet,
  Text, View, useWindowDimensions,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { colors, homeMotion, promoSlides, promoTiles } from '../theme/indexesTheme';
import { isTrustedShopifyMedia, nextCarouselIndex, safeAutoplayInterval } from '../theme/homeMediaUtils';

/** Stop playback and automatic scrolling whenever the application is backgrounded. */
function useAppForeground() {
  const [foreground, setForeground] = useState(AppState.currentState !== 'background');
  useEffect(() => {
    const sub = AppState.addEventListener('change', next => {
      setForeground(next === 'active');
    });
    return () => sub.remove();
  }, []);
  return foreground;
}

function FallbackImage({ uri, style, alt }) {
  return (
    <Image
      source={{ uri }}
      style={style}
      resizeMode="contain"
      accessibilityLabel={alt}
      accessibilityIgnoresInvertColors
    />
  );
}

/**
 * A React Native port of sections/indexes-home-carousel.liquid.
 * The three READY public video sources and their original ordering come
 * directly from Shopify Admin theme 162512797781's templates/index.json.
 */
export function HomeVideoCarousel({ onNavigate }) {
  const { width: windowWidth } = useWindowDimensions();
  const [width, setWidth] = useState(Math.max(200, windowWidth - 24));
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [videoErrors, setVideoErrors] = useState({});
  const foreground = useAppForeground();
  const listRef = useRef(null);

  const jumpTo = index => {
    const next = nextCarouselIndex(index, promoSlides.length, 0);
    setActive(next);
    listRef.current?.scrollTo({ x: next * width, animated: true });
  };

  useEffect(() => {
    if (paused || dragging || !foreground || promoSlides.length <= 1) return undefined;
    const timer = setInterval(() => {
      setActive(previous => {
        const next = nextCarouselIndex(previous, promoSlides.length);
        listRef.current?.scrollTo({ x: next * width, animated: true });
        return next;
      });
    }, safeAutoplayInterval(homeMotion.bannerIntervalMs));
    return () => clearInterval(timer);
  }, [active, paused, dragging, foreground, width]);

  useEffect(() => {
    // Preserve the active slide across rotation and screen size changes.
    listRef.current?.scrollTo({ x: active * width, animated: false });
  }, [width]);

  return (
    <View accessibilityLabel="العروض الرئيسية بالفيديو" style={styles.hero}>
      <View
        style={styles.heroViewport}
        onLayout={event => {
          const next = event.nativeEvent.layout.width;
          if (next > 0 && Math.abs(next - width) > 1) setWidth(next);
        }}
      >
        <ScrollView
          ref={listRef}
          style={styles.heroScroller}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScrollBeginDrag={() => setDragging(true)}
          onMomentumScrollEnd={event => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setActive(nextCarouselIndex(index, promoSlides.length, 0));
            setDragging(false);
          }}
          onScrollEndDrag={() => setDragging(false)}
          scrollEventThrottle={16}
          contentContainerStyle={styles.heroTrack}
        >
          {promoSlides.map((slide, index) => {
            const canVideo = isTrustedShopifyMedia(slide.video) && !videoErrors[slide.key];
            const selected = index === active;
            return (
              <View key={slide.key} style={[styles.heroSlide, { width }]}>
                {canVideo && selected ? (
                  <Video
                    source={{ uri: slide.video }}
                    usePoster
                    posterSource={{ uri: slide.poster }}
                    posterStyle={styles.fill}
                    resizeMode={ResizeMode.CONTAIN}
                    shouldPlay={!paused && !dragging && foreground}
                    isLooping
                    isMuted
                    useNativeControls={false}
                    style={styles.fill}
                    onError={() => setVideoErrors(previous => ({ ...previous, [slide.key]: true }))}
                  />
                ) : (
                  <FallbackImage
                    uri={slide.poster || slide.thumbnail}
                    alt={slide.title}
                    style={styles.fill}
                  />
                )}
                <Pressable
                  onPress={() => onNavigate(slide.handle, slide.handle ? 'home' : 'categories')}
                  accessibilityRole="button"
                  accessibilityLabel={slide.title}
                  style={styles.heroLink}
                />
              </View>
            );
          })}
        </ScrollView>
      </View>
      <View style={styles.heroControls}>
        <Pressable
          style={styles.heroControlButton}
          accessibilityLabel="الشريحة السابقة"
          accessibilityRole="button"
          onPress={() => jumpTo(active - 1)}
        >
          <Ionicons name="arrow-forward" size={20} color={colors.text} />
        </Pressable>
        <View style={styles.heroDots}>
          {promoSlides.map((slide, index) => (
            <Pressable
              key={slide.key}
              style={styles.dotTouch}
              accessibilityRole="button"
              accessibilityLabel={'الشريحة ' + (index + 1) + ': ' + slide.title}
              accessibilityState={{ selected: index === active }}
              onPress={() => jumpTo(index)}
            >
              <View style={[styles.dot, index === active && styles.dotActive]} />
            </Pressable>
          ))}
        </View>
        <Pressable
          style={styles.heroControlButton}
          accessibilityLabel="الشريحة التالية"
          accessibilityRole="button"
          onPress={() => jumpTo(active + 1)}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <Pressable
          style={styles.heroControlButton}
          accessibilityRole="button"
          accessibilityLabel={paused ? 'تشغيل فيديوهات العروض' : 'إيقاف فيديوهات العروض'}
          accessibilityState={{ pressed: paused }}
          onPress={() => setPaused(previous => !previous)}
        >
          <Ionicons name={paused ? 'play-outline' : 'pause-outline'} size={21} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

/**
 * The published draft enables one image promo and one video promo, both
 * targeting Electronics. The Gifts tile is disabled in Shopify Admin.
 */
export function HomePromoTiles({ onNavigate }) {
  const foreground = useAppForeground();
  const [videoPaused, setVideoPaused] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  return (
    <View style={styles.promos} accessibilityLabel="أقسام مختارة">
      {promoTiles.map(tile => {
        const canPlay = tile.kind === 'video' && isTrustedShopifyMedia(tile.video) && !videoFailed;
        return (
          <View key={tile.key} style={styles.promoTile}>
            {canPlay ? (
              <Video
                source={{ uri: tile.video }}
                usePoster
                posterSource={{ uri: tile.poster || tile.image }}
                posterStyle={styles.fill}
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay={!videoPaused && foreground}
                isMuted
                isLooping
                useNativeControls={false}
                style={styles.fill}
                onError={() => setVideoFailed(true)}
              />
            ) : (
              <FallbackImage uri={tile.image} alt={tile.title} style={styles.fill} />
            )}
            <Pressable
              onPress={() => onNavigate(tile.handle)}
              style={styles.heroLink}
              accessibilityLabel={tile.title}
              accessibilityRole="button"
            />
            {canPlay && (
              <Pressable
                style={styles.promoVideoControl}
                accessibilityRole="button"
                accessibilityLabel={videoPaused ? 'تشغيل الفيديو الترويجي' : 'إيقاف الفيديو الترويجي'}
                onPress={() => setVideoPaused(previous => !previous)}
              >
                <Ionicons name={videoPaused ? 'play' : 'pause'} color="#fff" size={17} />
              </Pressable>
            )}
          </View>
        );
      })}
    </View>
  );
}

/**
 * Native horizontal category rail matching the draft's enabled 4.5s
 * autoplay setting. Manual scrolling pauses movement until re-enabled.
 */
export function AutoCategoryRail({ items, onSelect, selectedHandle }) {
  const scrollRef = useRef(null);
  const position = useRef(0);
  const maxPosition = useRef(0);
  const [containerWidth, setContainerWidth] = useState(320);
  const [contentWidth, setContentWidth] = useState(320);
  const [paused, setPaused] = useState(false);
  const foreground = useAppForeground();
  const step = 167;

  useEffect(() => {
    maxPosition.current = Math.max(0, contentWidth - containerWidth);
  }, [contentWidth, containerWidth]);

  useEffect(() => {
    if (paused || !foreground || items.length < 3 || maxPosition.current <= 0) return undefined;
    const timer = setInterval(() => {
      const next = position.current + step > maxPosition.current
        ? 0
        : position.current + step;
      position.current = next;
      scrollRef.current?.scrollTo({ x: next, animated: true });
    }, safeAutoplayInterval(homeMotion.categoryIntervalMs));
    return () => clearInterval(timer);
  }, [paused, foreground, items.length, contentWidth, containerWidth]);

  return (
    <View style={styles.categoriesContainer}>
      <View style={styles.categoriesToolbar}>
        <Pressable
          onPress={() => setPaused(value => !value)}
          accessibilityRole="button"
          accessibilityLabel={paused ? 'استئناف تحريك الأقسام' : 'إيقاف تحريك الأقسام'}
          accessibilityState={{ pressed: paused }}
          style={styles.categoryPause}
        >
          <Ionicons name={paused ? 'play-outline' : 'pause-outline'} size={18} color={colors.primary} />
          <Text style={styles.categoryPauseLabel}>{paused ? 'تشغيل' : 'إيقاف'}</Text>
        </Pressable>
      </View>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesTrack}
        onLayout={event => setContainerWidth(event.nativeEvent.layout.width)}
        onContentSizeChange={w => setContentWidth(w)}
        onScrollBeginDrag={() => setPaused(true)}
        onMomentumScrollEnd={event => { position.current = event.nativeEvent.contentOffset.x; }}
        scrollEventThrottle={16}
      >
        {items.map(item => (
          <Pressable
            key={item.handle}
            onPress={() => onSelect(item.handle)}
            style={[styles.categoryCard, item.handle === selectedHandle && styles.categorySelected]}
            accessibilityLabel={'تصفح قسم ' + item.title}
            accessibilityRole="button"
          >
            <FallbackImage uri={item.image} alt={item.title} style={styles.categoryArt} />
            <Text numberOfLines={1} style={styles.categoryTitle}>{item.title}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  hero: { backgroundColor: '#fff', borderRadius: 23, marginTop: 4, overflow: 'hidden' },
  heroViewport: { aspectRatio: 1711 / 919, width: '100%', backgroundColor: '#fff', borderRadius: 23, overflow: 'hidden' },
  heroScroller: { flex: 1 },
  heroTrack: { flexDirection: 'row' },
  heroSlide: { height: '100%', backgroundColor: '#fff', overflow: 'hidden' },
  heroLink: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
  heroControls: { minHeight: 48, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 },
  heroControlButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  heroDots: { flexDirection: 'row', gap: 0, alignItems: 'center' },
  dotTouch: { width: 36, height: 44, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: 4, backgroundColor: '#999' },
  dotActive: { width: 9, height: 9, borderRadius: 6, backgroundColor: colors.primary },
  promos: { flexDirection: 'row-reverse', gap: 9, marginTop: 12 },
  promoTile: { flex: 1, aspectRatio: 1635 / 962, backgroundColor: '#fff', borderRadius: 13, overflow: 'hidden' },
  promoVideoControl: { position: 'absolute', bottom: 7, left: 7, zIndex: 3, padding: 7, backgroundColor: '#0009', borderRadius: 20 },
  categoriesContainer: { paddingVertical: 5 },
  categoriesToolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', minHeight: 24 },
  categoryPause: { flexDirection: 'row', gap: 4, alignItems: 'center', minHeight: 34, paddingHorizontal: 9, borderRadius: 20, borderColor: colors.line, borderWidth: 1, backgroundColor: '#fff' },
  categoryPauseLabel: { color: colors.primary, fontSize: 10, fontWeight: '700' },
  categoriesTrack: { flexDirection: 'row-reverse', gap: 8, paddingVertical: 6, paddingHorizontal: 2 },
  categoryCard: { width: 159, padding: 5, borderWidth: 1, borderColor: colors.line, borderRadius: 13, backgroundColor: colors.surface },
  categorySelected: { borderColor: colors.primary, backgroundColor: colors.soft },
  categoryArt: { width: '100%', aspectRatio: 1774 / 887, borderRadius: 8, backgroundColor: '#fff' },
  categoryTitle: { fontWeight: '700', fontSize: 11, textAlign: 'center', color: colors.text, paddingVertical: 6 },
});
