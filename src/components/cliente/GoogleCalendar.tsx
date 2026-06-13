import React, { useState, useRef } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  eachDayOfInterval,
  isBefore,
  startOfDay,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { cn } from '../../lib/utils';

interface GoogleCalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

export default function GoogleCalendar({ selectedDate, onDateSelect }: GoogleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showFullMonth, setShowFullMonth] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);

  // ── Strip: 7 days starting today ──────────────────────────────────────────
  const today = startOfDay(new Date());
  const stripDays = Array.from({ length: 14 }, (_, i) => addDays(today, i));

  // ── Full month grid ────────────────────────────────────────────────────────
  const dayLabels = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarDays = eachDayOfInterval({
    start: startOfWeek(monthStart),
    end: endOfWeek(monthEnd),
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div className="bg-theme-bg rounded-[2rem] border border-theme-secondary/20 shadow-sm overflow-hidden text-theme-text">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <h3 className="text-lg font-black tracking-tight first-letter:uppercase">
          {showFullMonth
            ? format(currentMonth, 'MMMM yyyy', { locale: es })
            : format(today, 'MMMM yyyy', { locale: es })}
        </h3>
        <button
          onClick={() => setShowFullMonth(!showFullMonth)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all',
            showFullMonth
              ? 'bg-theme-primary text-white'
              : 'bg-theme-secondary/10 text-theme-text/70 hover:bg-theme-secondary/20',
          )}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          {showFullMonth ? 'Tira rápida' : 'Ver mes completo'}
        </button>
      </div>

      {showFullMonth ? (
        /* ── Full Month View ────────────────────────────────────────────────── */
        <div className="px-4 pb-6">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4 px-2">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-theme-secondary/10 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-theme-secondary/10 rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayLabels.map((d) => (
              <div
                key={d}
                className="text-center text-[10px] font-black text-theme-text/60 uppercase tracking-widest py-2"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
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
                    'relative h-12 flex flex-col items-center justify-center rounded-2xl text-sm font-bold transition-all',
                    isPast && 'text-theme-text/30 cursor-not-allowed opacity-50',
                    !isCurrentMonth && !isPast && 'text-theme-text/40',
                    isCurrentMonth && !isSelected && !isPast && 'text-theme-text/80 hover:bg-theme-secondary/10',
                    isSelected && 'bg-theme-primary text-white shadow-lg shadow-theme-primary/20',
                    isToday && !isSelected && 'text-theme-primary',
                  )}
                >
                  <span>{format(day, 'd')}</span>
                  {isToday && (
                    <div
                      className={cn(
                        'absolute bottom-2 w-1 h-1 rounded-full',
                        isSelected ? 'bg-white' : 'bg-theme-primary',
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* ── 7-Day Strip View ───────────────────────────────────────────────── */
        <div
          ref={stripRef}
          className="flex gap-3 overflow-x-auto px-5 pb-6 scrollbar-hide snap-x snap-mandatory"
        >
          {stripDays.map((day, idx) => {
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isToday = isSameDay(day, today);

            return (
              <button
                key={idx}
                onClick={() => onDateSelect(day)}
                className={cn(
                  'flex-shrink-0 snap-start flex flex-col items-center gap-1.5 w-14 py-3 rounded-[1.4rem] transition-all duration-300 border-2',
                  isSelected
                    ? 'bg-theme-primary text-white border-theme-primary shadow-lg shadow-theme-primary/20 scale-105'
                    : isToday
                    ? 'bg-theme-secondary/15 border-theme-secondary/30 text-theme-text'
                    : 'bg-transparent border-transparent text-theme-text/80 hover:bg-theme-secondary/10 hover:border-theme-secondary/20',
                )}
              >
                <span className="text-[10px] font-black uppercase tracking-widest opacity-70">
                  {format(day, 'EEE', { locale: es }).slice(0, 3)}
                </span>
                <span className="text-xl font-black leading-none">{format(day, 'd')}</span>
                {isToday && (
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      isSelected ? 'bg-white' : 'bg-theme-primary',
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
