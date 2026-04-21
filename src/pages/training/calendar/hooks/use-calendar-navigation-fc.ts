import { useState, useCallback } from 'react';
import { addMonths, subMonths } from 'date-fns';

export function useCalendarNavigationFC() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAnimating, setIsAnimating] = useState(false);

  const goToMonth = useCallback((date: Date) => {
    setCurrentDate(new Date(date));
  }, []);

  const stepMonth = useCallback((direction: 'prev' | 'next') => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentDate((prev) =>
        direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
      );
      setIsAnimating(false);
    }, 150);
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  return {
    currentDate,
    isAnimating,
    stepMonth,
    goToMonth,
    goToToday,
  };
}
