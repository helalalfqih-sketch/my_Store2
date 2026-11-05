#!/usr/bin/env bash
# End-to-end Android UI smoke test. Keep all commands in a single bash process:
# android-emulator-runner executes individual multiline 'script' lines independently.
set -euo pipefail

mkdir -p smoke
capture_diagnostics() {
  adb logcat -d -v brief > smoke/logcat.txt 2>/dev/null || true
  adb shell screencap -p /sdcard/smoke-last.png >/dev/null 2>&1 || true
  adb pull /sdcard/smoke-last.png smoke/last.png >/dev/null 2>&1 || true
}
trap capture_diagnostics EXIT

APK="$(find apk-files -type f -name app-release.apk -print -quit)"
test -s "$APK" || { echo "Artifact contains no installable APK"; exit 10; }
adb wait-for-device
adb install "$APK"
adb logcat -c
adb shell am start -W -n com.indexesstore.mobile/.MainActivity
sleep 16
adb shell pidof com.indexesstore.mobile

home_ok=0
for attempt in 1 2 3 4; do
  if adb shell uiautomator dump /sdcard/window.xml >/dev/null 2>&1 \
    && adb pull /sdcard/window.xml smoke/home.xml >/dev/null 2>&1 \
    && python3 scripts/android-smoke-ui.py --file smoke/home.xml --expect "البحث في المنتجات"; then
    home_ok=1
    break
  fi
  sleep 3
done
test "$home_ok" -eq 1 || { echo "Homepage did not become accessible"; exit 20; }
adb shell screencap -p /sdcard/home.png
adb pull /sdcard/home.png smoke/home.png

# Confirm the Android app, not merely a CI HTTP client, renders real products.
# The Shopify storefront homepage has large video/category rails above its FlatList.
# Scroll vertically until at least one accessible native ProductCard appears.
products_ok=0
for attempt in 1 2 3 4 5 6 7; do
  if adb shell uiautomator dump /sdcard/products.xml >/dev/null 2>&1 \
    && adb pull /sdcard/products.xml smoke/products.xml >/dev/null 2>&1 \
    && python3 scripts/android-smoke-ui.py --file smoke/products.xml --expect-product; then
    products_ok=1
    break
  fi
  adb shell input swipe 160 505 160 180 400
  sleep 2
done
test "$products_ok" -eq 1 || {
  echo "Shopify is reachable, but Android did not render a product card."
  echo "Inspect smoke/products.xml and smoke/logcat.txt."
  exit 21
}
adb shell screencap -p /sdcard/products.png
adb pull /sdcard/products.png smoke/products.png

# Inertia from scrolling the product list can consume the first tab tap.
# Resolve the tab's current bounds from a fresh Android UI tree and retry,
# then assert the categories-only subtitle (not the shared homepage heading).
categories_ok=0
for attempt in 1 2 3 4; do
  adb shell uiautomator dump /sdcard/window.xml >/dev/null
  adb pull /sdcard/window.xml smoke/before-categories.xml >/dev/null
  read -r x y < <(python3 scripts/android-smoke-ui.py --file smoke/before-categories.xml --tap "الأقسام")
  adb shell input tap "$x" "$y"
  sleep 3
  adb shell uiautomator dump /sdcard/window.xml >/dev/null
  adb pull /sdcard/window.xml smoke/categories.xml >/dev/null
  if python3 scripts/android-smoke-ui.py --file smoke/categories.xml --expect "تسوق حسب القسم المناسب لك"; then
    categories_ok=1
    break
  fi
done
test "$categories_ok" -eq 1 || { echo "Could not switch to the categories tab"; exit 22; }
adb shell screencap -p /sdcard/categories.png
adb pull /sdcard/categories.png smoke/categories.png

read -r x y < <(python3 scripts/android-smoke-ui.py --file smoke/categories.xml --tap "السلة")
adb shell input tap "$x" "$y"
sleep 3
adb shell uiautomator dump /sdcard/window.xml >/dev/null
adb pull /sdcard/window.xml smoke/cart.xml
python3 scripts/android-smoke-ui.py --file smoke/cart.xml --expect "سلة التسوق فارغة"
adb shell screencap -p /sdcard/cart.png
adb pull /sdcard/cart.png smoke/cart.png

adb logcat -d -v brief > smoke/logcat.txt
if grep -q 'FATAL EXCEPTION' smoke/logcat.txt; then
  echo "Android recorded a fatal exception during the native smoke test."
  exit 30
fi
adb shell pidof com.indexesstore.mobile
printf '%s\n' "catalog_products=PASS" "home=PASS" "categories=PASS" "empty_cart=PASS" "fatal_exceptions=NONE" > smoke/result.txt
echo "Native Android smoke tests passed."
