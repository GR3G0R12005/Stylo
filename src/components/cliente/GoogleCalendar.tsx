import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, eachDayOfInterval, isBefore, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface GoogleCalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

export default function GoogleCalendar({ selectedDate, onDateSelect }: GoogleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div className="bg-white rounded-[2rem] border border-zinc-100 p-6 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black tracking-tight first-letter:uppercase">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h3>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map(day => (
          <div key={day} className="text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, idx) => {
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());
          const isPast = isBefore(day, startOfDay(new Date()));

          return (
            <button
              key={idx}
              onClick={() => !isPast && onDateSelect(day)}
              disabled={isPast}
              className={cn(
                "relative h-12 flex flex-col items-center justify-center rounded-2xl text-sm font-bold transition-all",
                isPast ? "text-zinc-300 cursor-not-allowed opacity-50" : "",
                !isCurrentMonth && !isPast && "text-zinc-300",
                isCurrentMonth && !isSelected && !isPast && "text-zinc-600 hover:bg-zinc-50",
                isSelected && "bg-theme-primary text-white shadow-lg shadow-theme-primary/20",
                isToday && !isSelected && "text-theme-primary"
              )}
            >
              <span>{format(day, 'd')}</span>
              {isToday && (
                <div className={cn(
                  "absolute bottom-2 w-1 h-1 rounded-full",
                  isSelected ? "bg-white" : "bg-theme-primary"
                )} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
