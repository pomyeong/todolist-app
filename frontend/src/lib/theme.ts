// P-29: 화면 모드 판정(순수 함수). 저장·적용은 themeStore.ts, 첫 화면 전 적용은 index.html이 같은 규칙으로 한다.
export const THEMES = ['system', 'light', 'dark'] as const;
export type ThemePref = (typeof THEMES)[number];
export type Theme = 'light' | 'dark';

export function parseThemePref(stored: string | null): ThemePref {
  return (THEMES as readonly string[]).includes(stored ?? '') ? (stored as ThemePref) : 'system';
}

export function resolveTheme(pref: ThemePref, systemDark: boolean): Theme {
  if (pref === 'system') return systemDark ? 'dark' : 'light';
  return pref;
}
