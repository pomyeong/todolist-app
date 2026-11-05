import { describe, expect, it } from 'vitest';
import { DICTS, detectLang, LANGS, translateMessage } from './messages';

describe('사전 (P-31)', () => {
  it('세 언어 사전의 키가 같고 빈 문구가 없다', () => {
    const keys = Object.keys(DICTS.ko).sort();
    for (const lang of LANGS) {
      expect(Object.keys(DICTS[lang]).sort()).toEqual(keys);
      for (const v of Object.values(DICTS[lang])) {
        if (typeof v === 'string') expect(v.length).toBeGreaterThan(0);
      }
    }
  });

  it('요일은 언어마다 7개, 일요일부터', () => {
    expect(DICTS.ko.weekdays[0]).toBe('일');
    expect(DICTS.ja.weekdays[0]).toBe('日');
    expect(DICTS.en.weekdays).toHaveLength(7);
  });

  it('주차 표기', () => {
    expect([
      DICTS.ko['cal.weekNo'](45),
      DICTS.ja['cal.weekNo'](45),
      DICTS.en['cal.weekNo'](45),
    ]).toEqual(['45주차', '第45週', 'W45']);
  });
});

describe('translateMessage', () => {
  it('ko는 그대로', () => {
    expect(translateMessage('필수 항목입니다.', 'ko')).toBe('필수 항목입니다.');
  });
  it('알려진 서버 문구를 번역', () => {
    expect(translateMessage('필수 항목입니다.', 'en')).toBe('This field is required.');
    expect(translateMessage('이메일 또는 비밀번호가 올바르지 않습니다.', 'ja')).toBe(
      'メールアドレスまたはパスワードが正しくありません。',
    );
  });
  it('숫자가 들어간 길이 문구', () => {
    expect(translateMessage('8자 이상 64자 이하여야 합니다.', 'en')).toBe(
      'Must be 8–64 characters.',
    );
    expect(translateMessage('1000자 이하여야 합니다.', 'ja')).toBe(
      '1000文字以下で入力してください。',
    );
  });
  it('모르는 문구는 그대로', () => {
    expect(translateMessage('처음 보는 문구', 'en')).toBe('처음 보는 문구');
  });
});

describe('detectLang', () => {
  it.each([
    ['ja', 'en-US', 'ja'], // 저장값 우선
    [null, 'en-US', 'en'],
    [null, 'ja-JP', 'ja'],
    [null, 'fr-FR', 'ko'], // 지원하지 않으면 ko
    ['xx', 'ko-KR', 'ko'], // 잘못된 저장값은 무시
    [null, undefined, 'ko'],
  ])('stored=%s browser=%s → %s', (stored, browser, lang) => {
    expect(detectLang(stored, browser)).toBe(lang);
  });
});
