import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo, AppState, Image, Pressable, ScrollView,
  StyleSheet, Text, useWindowDimensions, View,
} from 'react-native';
import { ResizeMode, Video } from 'expo-av';
import { colors, homepageDraft } from '../theme/indexesTheme';

/**
 * The URLs and section configuration originate from Shopify theme
 * 162512797781; video sources were resolved against READY Files records.
 * Only the visible slide is mounted as a video decoder. All media is
 * muted; images remain visible if playback is unavailable or fails.
 */
function usePlaybackAvailability() {
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then(value => { if (mounted) setReduceMotion(Boolean(value)); })
      .catch(() => {});
    const app = AppState.addEventListener('change', state => {
      setForeground(state === 'active');
    });
    const motion = AccessibilityInfo.addEventListener?.('reduceMotionChanged', value => {
      setReduceMotion(Boolean(value));
    });
    return () => {
      mounted = false;
      app.remove();
      motion?.remove?.();
    };
  }, []);

  return { foreground, reduceMotion };
}

function VideoLayer({ video, poster, playing, onError }) {
  return (
    <Video
      source={{ uri: video }}
      style={StyleSheet.absoluteFill}
      resizeMode={ResizeMode.CONTAIN}
      posterSource={{ uri: poster }}
      posterStyle={styles.videoPoster}
      usePoster
      isMuted
      isLooping
      shouldPlay={playing}
      useNativeControls={false}
      onError={onError}
      accessibilityLabel="فيديو إعلاني بدون صوت"
    />
  );
}

export function HomepageVideoCarousel({
  slides, visible = true, onSelect, intervalMs = homepageDraft.carouselIntervalMs,
}) {
  const { width } = useWindowDimensions();
  const pageWidth = Math.max(1, width);
  const scroll = useRef(null);
  const [index, setIndex] = useState(0);
  const [manualPlayback, setManualPlayback] = useState(null);
  const [failed, setFailed] = useState({});
  const { foreground, reduceMotion } = usePlaybackAvailability();

  const playAllowed = manualPlayback === null ? !reduceMotion : manualPlayback;
  const playing = Boolean(visible && foreground && playAllowed);
  const slideCount = slides?.length || 0;

  const showSlide = next => {
    if (slideCount < 2) return;
    const target = ((next % slideCount) + slideCount) % slideCount;
    setIndex(target);
    scroll.current?.scrollTo({ x: target * pageWidth, animated: true });
  };

  useEffect(() => {
    if (!playing || slideCount < 2 || !homepageDraft.carouselAutoplay) return undefined;
    const ticker = setInterval(() => showSlide(index + 1), intervalMs);
    return () => clearInterval(ticker);
  }, [playing, slideCount, index, pageWidth, intervalMs]);

  if (!slideCount) return null;

  return (
    <View style={styles.carouselRoot} accessibilityLabel="عارض فيديوهات اندكس ستور">
      <ScrollView
        ref={scroll}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={80}
        onMomentumScrollEnd={event => {
          const next = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
          setIndex(Math.max(0, Math.min(slideCount - 1, next)));
        }}
        accessibilityRole="adjustable"
        accessibilityLabel="بنرات الفيديو الرئيسية"
      >
        {slides.map((slide, slideIndex) => {
          const active = index === slideIndex;
          return (
            <View style={[styles.slidePage, { width: pageWidth }]} key={slide.key}>
              <View style={styles.slideMedia}>
                <Image
                  source={{ uri: slide.poster }}
                  style={StyleSheet.absoluteFill}
                  resizeMode="contain"
                  accessibilityIgnoresInvertColors
                />
                {active && !failed[slide.key] && playing && (
                  <VideoLayer
                    video={slide.video}
                    poster={slide.poster}
                    playing={playing}
                    onError={() => setFailed(previous => ({ ...previous, [slide.key]: true }))}
                  />
                )}
                <Pressable
                  style={StyleSheet.absoluteFill}
                  onPress={() => onSelect(slide)}
                  accessibilityRole="button"
                  accessibilityLabel={slide.title}
                />
              </View>
            </View>
          );
        })}
      </ScrollView>
      {slideCount > 1 && (
        <View style={styles.carouselControls}>
          <Pressable style={styles.control} onPress={() => showSlide(index - 1)} accessibilityRole="button" accessibilityLabel="البنر السابق">
            <Text style={styles.controlText}>‹</Text>
          </Pressable>
          <View style={styles.dots}>
            {slides.map((slide, slideIndex) => (
              <Pressable
                key={slide.key}
                onPress={() => showSlide(slideIndex)}
                accessibilityRole="button"
                accessibilityLabel={'عرض البنر ' + (slideIndex + 1) + ': ' + slide.title}
                accessibilityState={{ selected: slideIndex === index }}
                style={styles.dotButton}
              >
                <View style={[styles.dot, slideIndex === index && styles.dotSelected]} />
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.control} onPress={() => showSlide(index + 1)} accessibilityRole="button" accessibilityLabel="البنر التالي">
            <Text style={styles.controlText}>›</Text>
          </Pressable>
          <Pressable
            style={styles.control}
            onPress={() => setManualPlayback(!playAllowed)}
            accessibilityRole="button"
            accessibilityLabel={playAllowed ? 'إيقاف تشغيل البنرات' : 'تشغيل البنرات'}
            accessibilityState={{ checked: playAllowed }}
          >
            <Text style={styles.playbackIcon}>{playAllowed ? 'Ⅱ' : '▶'}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function PromoTile({ promo, onSelect, visible, foreground, reduceMotion }) {
  const [manualPlayback, setManualPlayback] = useState(null);
  const [error, setError] = useState(false);
  const playAllowed = manualPlayback === null ? !reduceMotion : manualPlayback;
  const playing = Boolean(promo.video && visible && foreground && playAllowed && !error);
  return (
    <View style={styles.promoCard}>
      <Image
        source={{ uri: promo.image || promo.poster }}
        style={StyleSheet.absoluteFill}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
      {playing && (
        <VideoLayer
          video={promo.video}
          poster={promo.poster}
          playing={playing}
          onError={() => setError(true)}
        />
      )}
      <Pressable
        onPress={() => onSelect(promo)}
        style={StyleSheet.absoluteFill}
        accessibilityRole="button"
        accessibilityLabel={promo.title}
      />
      {promo.video && (
        <Pressable
          style={styles.promoToggle}
          onPress={() => { setError(false); setManualPlayback(!playAllowed); }}
          accessibilityRole="button"
          accessibilityLabel={playing ? 'إيقاف فيديو العرض' : 'تشغيل فيديو العرض'}
        >
          <Text style={styles.promoToggleText}>{playing ? 'Ⅱ' : '▶'}</Text>
        </Pressable>
      )}
    </View>
  );
}

export function HomepagePromoTiles({ promos, visible = true, onSelect }) {
  const { foreground, reduceMotion } = usePlaybackAvailability();
  return (
    <View style={styles.promoGrid} accessibilityLabel="أقسام مختارة">
      {promos.map(promo => (
        <PromoTile
          key={promo.key}
          promo={promo}
          onSelect={onSelect}
          visible={visible}
          foreground={foreground}
          reduceMotion={reduceMotion}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  carouselRoot: { marginHorizontal: -12, marginBottom: 8 },
  slidePage: { paddingHorizontal: 12 },
  slideMedia: {
    width: '100%', aspectRatio: 1711 / 919, borderRadius: 20,
    overflow: 'hidden', backgroundColor: '#fff',
  },
  videoPoster: { width: '100%', height: '100%', resizeMode: 'contain' },
  carouselControls: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    flexWrap: 'wrap', minHeight: 44, paddingHorizontal: 8,
  },
  control: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  controlText: { color: colors.text, fontSize: 30, fontWeight: '400' },
  playbackIcon: { color: colors.text, fontSize: 17, fontWeight: '700' },
  dots: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  dotButton: { width: 36, height: 44, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 6, height: 6, backgroundColor: colors.muted, borderRadius: 6 },
  dotSelected: { width: 9, height: 9, backgroundColor: colors.primary },
  promoGrid: { flexDirection: 'row-reverse', gap: 10, marginBottom: 2 },
  promoCard: {
    flex: 1, aspectRatio: 1635 / 962, backgroundColor: '#fff',
    borderRadius: 12, overflow: 'hidden',
  },
  promoToggle: {
    position: 'absolute', bottom: 5, right: 5,
    width: 44, height: 44, borderRadius: 24,
    backgroundColor: 'rgba(18,25,34,0.75)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)',
  },
  promoToggleText: { color: '#fff', fontSize: 19, fontWeight: '700' },
});
