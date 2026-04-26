'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getCalendarDays, formatDate, MONTH_NAMES, isBirthday, isAnniversaryDate } from '@/lib/dates';
import { supabase, type Event, type Gratitude } from '@/lib/supabase';

type Props = {
  onDateClick: (date: string) => void;
  filterOwner?: 'yubin' | 'munsung' | 'shared';
  selectedDate?: string | null;
};

export default function Calendar({ onDateClick, filterOwner, selectedDate }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<Event[]>([]);
  const [gratitudeDates, setGratitudeDates] = useState<Set<string>>(new Set());

  const fetchEvents = useCallback(async () => {
    const startDate = formatDate(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const endDate = formatDate(year, month, daysInMonth);

    let query = supabase
      .from('events')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');

    if (filterOwner) {
      query = query.eq('owner', filterOwner);
    }

    const { data } = await query;
    if (data) setEvents(data);
  }, [year, month, filterOwner]);

  const fetchGratitudes = useCallback(async () => {
    const startDate = formatDate(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const endDate = formatDate(year, month, daysInMonth);

    const { data } = await supabase
      .from('gratitude')
      .select('created_at')
      .gte('created_at', `${startDate}T00:00:00`)
      .lte('created_at', `${endDate}T23:59:59`);

    if (data) {
      const dates = new Set(data.map((g: Pick<Gratitude, 'created_at'>) => g.created_at.slice(0, 10)));
      setGratitudeDates(dates);
    }
  }, [year, month]);

  useEffect(() => {
    fetchEvents();
    fetchGratitudes();
  }, [fetchEvents, fetchGratitudes]);

  const days = getCalendarDays(year, month);
  const weekDays = ['일', '월', '화', '수', '목', '��', '토'];

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const getEventsForDay = (day: number) => {
    const dateStr = formatDate(year, month, day);
    return events.filter(e => e.date === dateStr);
  };

  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className="px-4 py-3">
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-line/50 active:bg-line transition-colors"
        >
          <ChevronLeft size={20} className="text-ink" />
        </button>
        <h2 className="text-xl font-semibold text-ink">
          {year}년 {MONTH_NAMES[month]}
        </h2>
        <button
          onClick={nextMonth}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-line/50 active:bg-line transition-colors"
        >
          <ChevronRight size={20} className="text-ink" />
        </button>
      </div>

      {/* 요일 헤��� */}
      <div className="grid grid-cols-7 mb-2 border-b border-dashed border-line pb-2">
        {weekDays.map((d, i) => (
          <div key={d} className={`text-center text-xs font-medium py-1 ${
            i === 0 ? 'text-[#A04848]' : i === 6 ? 'text-[#4A6B85]' : 'text-ink'
          }`}>
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-y-1">
        {days.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} />;

          const dateStr = formatDate(year, month, day);
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const dayEvents = getEventsForDay(day);
          const hasGratitude = gratitudeDates.has(dateStr);
          const date = new Date(year, month, day);
          const birthday = isBirthday(date);
          const isAnniversary = isAnniversaryDate(date);
          const dayOfWeek = (idx % 7);

          return (
            <button
              key={dateStr}
              onClick={() => onDateClick(dateStr)}
              className="relative flex flex-col items-center py-1.5 rounded-lg transition-all active:scale-90"
            >
              {/* 감사 점 (우측 상단) */}
              {hasGratitude && (
                <span className="absolute top-0.5 right-1 w-1.5 h-1.5 rounded-full bg-accent" />
              )}
              {/* 일정 점 (좌측 상단) */}
              {dayEvents.length > 0 && (
                <span className="absolute top-0.5 left-1 w-1.5 h-1.5 rounded-full bg-yubin" />
              )}
              <span className={`text-base font-medium w-8 h-8 flex items-center justify-center transition-all ${
                isSelected && isToday
                  ? 'bg-shared text-white rounded-full ring-2 ring-accent ring-offset-1'
                  : isSelected
                  ? 'bg-shared text-white rounded-full'
                  : isToday
                  ? 'border-2 border-accent rounded-full text-ink font-bold'
                  : dayOfWeek === 0 ? 'text-[#A04848]'
                  : dayOfWeek === 6 ? 'text-[#4A6B85]'
                  : 'text-ink'
              }`}>
                {day}
              </span>
              {(birthday || isAnniversary) && (
                <span className="text-[10px] leading-none">
                  {birthday ? '🎂' : '💜'}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
