/**
 * Chart color palette derived to read well in both light and dark schemes.
 * These are fixed, accessible hues (not theme-reactive) so series identity stays
 * stable across a scheme switch; axis/label colors adapt via `axisTextColor()`.
 */
export const CHART_COLORS = [
  '#6366f1', // indigo
  '#22c55e', // green
  '#f59e0b', // amber
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#8b5cf6', // violet
  '#ef4444', // red
  '#14b8a6'  // teal
];

export function chartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

/** Read a CSS variable from :root for theme-aware chart chrome. */
function cssVar(name: string, fallback: string): string {
  if (typeof getComputedStyle === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export function axisTextColor(isDark: boolean): string {
  return isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)';
}

export function gridLineColor(isDark: boolean): string {
  return isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
}

export function tooltipTheme(isDark: boolean) {
  return {
    backgroundColor: isDark ? '#1f2430' : '#ffffff',
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    textStyle: { color: isDark ? '#e6e8ee' : '#1f2937' }
  };
}

/** Convert a hex color to an rgba string. */
export function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
