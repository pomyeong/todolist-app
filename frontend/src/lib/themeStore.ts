import { create } from 'zustand';
import { parseThemePref, resolveTheme, type ThemePref } from './theme';

const KEY = 'theme';
const media = window.matchMedia('(prefers-color-scheme: dark)');

function load(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null; // 저장소가 막혀도 화면은 동작해야 한다
  }
}

// P-29: <html data-theme>만 바꾸면 global.css 토큰이 모드별 값으로 바뀐다
function apply(pref: ThemePref) {
  document.documentElement.dataset.theme = resolveTheme(pref, media.matches);
}

const initial = parseThemePref(load());
apply(initial);

export const useThemeStore = create<{ pref: ThemePref; setPref(pref: ThemePref): void }>((set) => ({
  pref: initial,
  setPref: (pref) => {
    try {
      localStorage.setItem(KEY, pref);
    } catch {
      // 저장 실패는 무시: 이번 방문 동안만 유지
    }
    apply(pref);
    set({ pref });
  },
}));

// '시스템'이면 OS 설정이 바뀔 때 바로 따라간다
media.addEventListener('change', () => apply(useThemeStore.getState().pref));
