import { useEffect, RefObject } from 'react';

export function useCalendarScrollGestures(
  scrollRef: RefObject<HTMLDivElement>,
  onStepWeek: (direction: 'up' | 'down') => void
) {
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    let touchStartY = 0;
    let touchStartTime = 0;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 50) {
        e.preventDefault();
        onStepWeek(e.deltaY < 0 ? 'up' : 'down');
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndTime = Date.now();
      const deltaY = touchStartY - touchEndY;
      const deltaTime = touchEndTime - touchStartTime;

      if (Math.abs(deltaY) > 80 && deltaTime < 300) {
        e.preventDefault();
        onStepWeek(deltaY > 0 ? 'down' : 'up');
      }
    };

    scrollEl.addEventListener('wheel', handleWheel, { passive: false });
    scrollEl.addEventListener('touchstart', handleTouchStart, { passive: true });
    scrollEl.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      scrollEl.removeEventListener('wheel', handleWheel);
      scrollEl.removeEventListener('touchstart', handleTouchStart);
      scrollEl.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scrollRef, onStepWeek]);
}
