import { themeConfig, type ThemeMode } from '@/config';

export function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  const themeVars = themeConfig.colors[theme];
  Object.entries(themeVars).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
}
