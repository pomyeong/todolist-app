import { describe, expect, it } from 'vitest';
import { parseThemePref, resolveTheme } from './theme';

describe('parseThemePref (P-29)', () => {
  it.each([
    ['light', 'light'],
    ['dark', 'dark'],
    ['system', 'system'],
    [null, 'system'], // 저장값 없음
    ['blue', 'system'], // 잘못된 저장값
  ])('%s → %s', (stored, pref) => {
    expect(parseThemePref(stored)).toBe(pref);
  });
});

describe('resolveTheme (P-29)', () => {
  it('시스템은 OS 설정을 따른다', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });
  it('주간·다크는 OS 설정과 무관', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });
});
