import { useT } from '../i18n';
import { THEMES, type ThemePref } from '../lib/theme';
import { useThemeStore } from '../lib/themeStore';

// FR-19, L-23: 화면 모드 선택. 언어 선택 옆에 둔다.
export function ThemeSelect() {
  const t = useT();
  const pref = useThemeStore((s) => s.pref);
  const setPref = useThemeStore((s) => s.setPref);
  return (
    <select
      className="lang-select"
      aria-label={t('theme.label')}
      value={pref}
      onChange={(e) => setPref(e.target.value as ThemePref)}
    >
      {THEMES.map((p) => (
        <option key={p} value={p}>
          {t(`theme.${p}`)}
        </option>
      ))}
    </select>
  );
}
