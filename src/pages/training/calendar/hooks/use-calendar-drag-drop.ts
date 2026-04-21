import { useState } from 'react';
import { Workout } from '@/types/training';

interface DragOverInfo {
  date: string;
  index: number;
}

export function useCalendarDragDrop(
  onWorkoutMove: (workoutId: string, newDate: string, newOrder: number) => void,
  onEventMove: (eventId: string, newDate: string) => void,
) {
  const [isDraggingId, setIsDraggingId] = useState<string | null>(null);
  const [dragOverInfo, setDragOverInfo] = useState<DragOverInfo | null>(null);

  const handleDragStart = (e: React.DragEvent, workout: Workout) => {
    e.dataTransfer.setData('workoutId', workout.id);
    setIsDraggingId(workout.id);
  };

  const handleDragEnd = () => {
    setIsDraggingId(null);
    setDragOverInfo(null);
  };

  const handleDragOverCell = (
    e: React.DragEvent,
    date: string,
    itemCount: number,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const target = e.currentTarget as HTMLElement;
    const container = target.querySelector('[data-drop-container]');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const items = Array.from(container.querySelectorAll('[data-drop-item]'));

    let insertIndex = itemCount;
    for (let i = 0; i < items.length; i++) {
      const itemRect = items[i].getBoundingClientRect();
      const itemMiddle = itemRect.top + itemRect.height / 2 - rect.top;
      if (y < itemMiddle) {
        insertIndex = i;
        break;
      }
    }

    setDragOverInfo({ date, index: insertIndex });
  };

  const handleDrop = (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    e.stopPropagation();

    const workoutId = e.dataTransfer.getData('workoutId');
    const eventId = e.dataTransfer.getData('eventId');

    if (workoutId) {
      const newOrder = dragOverInfo?.index ?? 0;
      onWorkoutMove(workoutId, targetDate, newOrder);
    } else if (eventId) {
      onEventMove(eventId, targetDate);
    }

    setIsDraggingId(null);
    setDragOverInfo(null);
  };

  return {
    isDraggingId,
    dragOverInfo,
    handleDragStart,
    handleDragEnd,
    handleDragOverCell,
    handleDrop,
    setDragOverInfo,
    setIsDraggingId,
  };
}
