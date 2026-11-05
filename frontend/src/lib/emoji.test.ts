import { describe, expect, it } from 'vitest';
import { DEFAULT_EMOJI, emojiFor } from './emoji';

describe('emojiFor (P-27)', () => {
  it.each([
    ['점심 약속', '🍱'],
    ['전철타기', '🚇'],
    ['해외여행 준비', '✈️'], // '여행'보다 '해외'가 먼저
    ['여행 준비', '🧳'],
    ['아침 운동', '🏃'], // '아침'만으로는 식사가 아니다
    ['아침 식사', '🍱'],
    ['시험 공부', '📚'],
    ['보고서 작성', '📝'],
    ['장보기', '🛒'],
    ['팀 회의', '💼'],
    ['KTX 예매', '🚇'],
    ['ktx 예매', '🚇'],
  ])('%s → %s', (title, emoji) => {
    expect(emojiFor(title)).toBe(emoji);
  });

  it('맞는 단어가 없으면 기본 이모지', () => {
    expect(emojiFor('무언가 하기')).toBe(DEFAULT_EMOJI);
    expect(emojiFor('')).toBe(DEFAULT_EMOJI);
  });
});
