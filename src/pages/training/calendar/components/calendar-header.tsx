import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarHeaderProps {
  monthName: string;
  year: number;
  viewMode: 'calendar' | 'summary';
  showLibrary: boolean;
  onStepMonth: (direction: 'up' | 'down') => void;
  onGoToToday: () => void;
  onViewModeChange: (mode: 'calendar' | 'summary') => void;
  onToggleLibrary: () => void;
}

export function CalendarHeader({
  monthName,
  year,
  viewMode,
  showLibrary,
  onStepMonth,
  onGoToToday,
  onViewModeChange,
  onToggleLibrary,
}: CalendarHeaderProps) {
  return (
    <header className="z-[70] flex w-full shrink-0 flex-col items-center justify-between gap-3 overflow-hidden px-4 lg:flex-row lg:px-4">
      <div className="flex w-full shrink-0 items-center justify-between gap-2 lg:w-auto lg:gap-4">
        <h2 className="truncate text-lg font-black lowercase tracking-tighter lg:text-3xl">
          {monthName} {year}
        </h2>
        <div className="bg-muted flex shrink-0 items-center gap-0.5 rounded-xl border p-1 shadow-sm lg:gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onStepMonth('up')}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onGoToToday}
            className="px-2 text-[10px] font-black uppercase"
          >
            today
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onStepMonth('down')}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex w-full justify-between gap-1.5 lg:w-auto lg:justify-end lg:gap-3">
        <div className="bg-muted flex rounded-xl p-0.5 shadow-sm lg:p-1">
          <Button
            variant={viewMode === 'calendar' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('calendar')}
            className="text-[10px] font-black uppercase"
          >
            grid
          </Button>
          <Button
            variant={viewMode === 'summary' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('summary')}
            className="text-[10px] font-black uppercase"
          >
            stats
          </Button>
        </div>

        <div className="flex items-center gap-1.5 lg:gap-2">
          <Button
            variant={showLibrary ? 'primary' : 'outline'}
            size="sm"
            onClick={onToggleLibrary}
            className="gap-2"
          >
            <BookOpen className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest lg:hidden">
              lib
            </span>
            <span className="hidden text-[10px] font-black uppercase tracking-widest lg:inline">
              library
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
