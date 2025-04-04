import type { EnhancedIdentifyPayload } from "../types";

export function getEnhancedIdentity(
  keyListOrToggle?: boolean | null | (keyof EnhancedIdentifyPayload)[],
  defaultValue = "unknown"
): Partial<EnhancedIdentifyPayload> {
  const isArray = Array.isArray(keyListOrToggle);

  if (!keyListOrToggle || (isArray && keyListOrToggle.length === 0)) {
    return {};
  }

  const matchMedia = (query: string) => window.matchMedia(query).matches;

  const allValues: EnhancedIdentifyPayload = {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: -new Date().getTimezoneOffset(),
    ect: (navigator as any).connection?.effectiveType || defaultValue,
    systemTheme: matchMedia("(prefers-color-scheme: dark)") ? "dark" : "light",
    prefersReducedMotion: matchMedia("(prefers-reduced-motion: reduce)"),
    isTouchDevice: "ontouchstart" in window || navigator.maxTouchPoints > 0 || matchMedia("(pointer: coarse)"),
    zoomLevel: Math.round(window.outerWidth / window.innerWidth * 100)
  };

  if (keyListOrToggle === true) {
    return allValues;
  }

  if (isArray) {
    return keyListOrToggle.reduce(
      (acc, key) => {
        acc[key] = allValues[key];
        return acc;
      },
      {} as Record<string, any>
    );
  }

  return {};
}
