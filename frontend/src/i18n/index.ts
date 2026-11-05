import { create } from 'zustand';
import { DICTS, type Dict, detectLang, type Lang, translateMessage } from './messages';

export { LANG_NAMES, LANGS, type Lang } from './messages';

const KEY = 'lang';
// 사생활 모드 등에서 localStorage 접근이 막혀도 화면은 동작해야 한다
function load(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function apply(lang: Lang) {
  document.documentElement.lang = lang;
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    // 저장 실패는 무시: 이번 방문 동안만 유지
  }
}

const initial = detectLang(load(), navigator.language);
document.documentElement.lang = initial;

export const useLangStore = create<{ lang: Lang; setLang(lang: Lang): void }>((set) => ({
  lang: initial,
  setLang: (lang) => {
    apply(lang);
    set({ lang });
  },
}));

// 화면 문구: t('nav.todos'), 인자가 있으면 t('cal.weekNo')(45)
export function useT() {
  const lang = useLangStore((s) => s.lang);
  return <K extends keyof Dict>(key: K): Dict[K] => DICTS[lang][key];
}

// 서버가 준 한국어 문구를 선택한 언어로(FormError·FieldError)
export function useTranslateMessage() {
  const lang = useLangStore((s) => s.lang);
  return (message: string) => translateMessage(message, lang);
}

// '기본' 카테고리는 서버가 만든 이름이라 표시할 때만 언어별 이름으로(P-31)
export function useCategoryLabel() {
  const t = useT();
  return (name: string) => (name === '기본' ? t('category.default') : name);
}
