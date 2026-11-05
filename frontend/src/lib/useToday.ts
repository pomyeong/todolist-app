import { useEffect, useState } from 'react';
import { todayLocal } from './date';

// PD-10: 창 포커스·탭 복귀 시 오늘 재계산
export function useToday(): string {
  const [today, setToday] = useState(todayLocal);
  useEffect(() => {
    const update = () => setToday(todayLocal());
    const onVisible = () => {
      if (document.visibilityState === 'visible') update();
    };
    window.addEventListener('focus', update);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', update);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
  return today;
}
