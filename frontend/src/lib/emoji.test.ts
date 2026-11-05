import { describe, expect, it } from 'vitest';
import { DEFAULT_EMOJI, emojiFor } from './emoji';

describe('emojiFor (P-27)', () => {
  it.each([
    ['점심 약속', '🍱'], // '약속'(🗓️)보다 '점심'이 먼저
    ['전철타기', '🚇'],
    ['해외여행 준비', '✈️'], // '여행'보다 '해외'가 먼저
    ['여행 준비', '🧳'],
    ['아침 운동', '🏃'], // '아침'만으로는 식사가 아니다
    ['아침 식사', '🍱'],
    ['시험 공부', '✏️'],
    ['토익 공부', '🗣️'],
    ['보고서 작성', '📝'],
    ['분기 실적 발표', '📊'],
    ['장보기', '🛒'],
    ['팀 회의', '💼'],
    ['송년 회식', '🎉'], // 모임 종류(송년)가 먹고 마시기보다 먼저
    ['금요일 회식', '🍻'],
    ['치과 예약', '🦷'],
    ['강아지 산책시키기', '🐾'], // 반려동물이 산책보다 먼저
    ['빨래 개기', '🧺'],
    ['KTX 예매', '🚇'],
    ['ktx 예매', '🚇'],
    ['Lunch with Kim', '🍱'],
    ['Gym', '🏋️'],
    ['잠실 가기', DEFAULT_EMOJI], // 한 글자 '잠'은 규칙에 없다
  ])('%s → %s', (title, emoji) => {
    expect(emojiFor(title)).toBe(emoji);
  });

  it('제목에 맞는 단어가 없으면 설명에서 찾는다', () => {
    expect(emojiFor('김 대리랑', '12시 점심 먹기')).toBe('🍱');
    expect(emojiFor('출발', '인천공항 3시')).toBe('✈️');
  });

  it('제목이 설명보다 우선한다', () => {
    expect(emojiFor('팀 회의', '끝나고 점심')).toBe('💼');
  });

  it('제목·설명 모두 맞는 단어가 없으면 기본 이모지', () => {
    expect(emojiFor('무언가 하기')).toBe(DEFAULT_EMOJI);
    expect(emojiFor('무언가 하기', null)).toBe(DEFAULT_EMOJI);
    expect(emojiFor('', '')).toBe(DEFAULT_EMOJI);
  });
});
