import { LANG_NAMES, LANGS, type Lang, useLangStore, useT } from '../i18n';

// FR-18, L-23: 언어 선택. 내비게이션(내 정보 옆)과 로그인·회원가입 화면에서 쓴다.
export function LanguageSelect() {
  const t = useT();
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);
  return (
    <select
      className="lang-select"
      aria-label={t('lang.label')}
      value={lang}
      onChange={(e) => setLang(e.target.value as Lang)}
    >
      {LANGS.map((l) => (
        <option key={l} value={l}>
          {LANG_NAMES[l]}
        </option>
      ))}
    </select>
  );
}
