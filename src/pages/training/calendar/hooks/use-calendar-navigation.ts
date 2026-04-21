import { useMemo, useState } from 'react';
import {
  addDays,
  addWeeks,
  eachDayOfInterval,
  startOfMonth,
  startOfWeek,
  subWeeks,
} from 'date-fns';

export interface CalendarWeek {
  weeks: Date[][];
  predominantMonth: number;
  predominantYear: number;
}

export function useCalendarNavigation() {
  const [baseDate, setBaseDate] = useState(new Date());
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideOffset, setSlideOffset] = useState(0);

  const gridData = useMemo((): CalendarWeek => {
    const monthStart = startOfMonth(baseDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = addDays(calendarStart, 41);
    const allDays = eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    });

    const weeks: Date[][] = [];
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }

    return {
      weeks,
      predominantMonth: baseDate.getMonth(),
      predominantYear: baseDate.getFullYear(),
    };
  }, [baseDate]);

  const stepWeek = (direction: 'up' | 'down') => {
    setIsAnimating(true);
    const offset = direction === 'up' ? -100 : 100;
    setSlideOffset(offset);

    setTimeout(() => {
      setBaseDate((prev) =>
        direction === 'up' ? subWeeks(prev, 1) : addWeeks(prev, 1),
      );
      setSlideOffset(0);
      setIsAnimating(false);
    }, 300);
  };

  const stepMonth = (direction: 'up' | 'down') => {
    const weeks = direction === 'up' ? -4 : 4;
    setBaseDate((prev) => addWeeks(prev, weeks));
  };

  const goToToday = () => {
    setBaseDate(new Date());
  };

  return {
    baseDate,
    gridData,
    isAnimating,
    slideOffset,
    stepWeek,
    stepMonth,
    goToToday,
  };
}
