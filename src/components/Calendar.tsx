'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getCalendarDays, formatDate, MONTH_NAMES, isBirthday, isAnniversaryDate } from '@/lib/dates';
import { supabase, type Event } from '@/lib/supabase';

type Props = {
  onDateClick: (date: string) => void;
  filterOwner?: 'yubin' | 'munsung' | 'shared';
};

export default function Calendar({ onDateClick, filterOwner }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<Event[]>([]);

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

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const days = getCalendarDays(year, month);
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

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
        <button onClick={prevMonth} className="p-2 rounded-full hover:bg-pink-50 active:bg-pink-100 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h2 className="font-header text-xl text-shared">
          {year}년 {MONTH_NAMES[month]}
        </h2>
        <button onClick={nextMonth} className="p-2 rounded-full hover:bg-pink-50 active:bg-pink-100 transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((d, i) => (
          <div key={d} className={`text-center text-xs font-semibold py-1 ${
            i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
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
          const dayEvents = getEventsForDay(day);
          const date = new Date(year, month, day);
          const birthday = isBirthday(date);
          const isAnniversary = isAnniversaryDate(date);
          const dayOfWeek = (idx % 7);

          return (
            <button
              key={dateStr}
              onClick={() => onDateClick(dateStr)}
              className={`relative flex flex-col items-center py-1.5 rounded-xl transition-all active:scale-95 ${
                isToday ? 'bg-shared/10 ring-2 ring-shared/30' : 'hover:bg-pink-50'
              }`}
            >
              <span className={`text-sm font-medium ${
                isToday ? 'text-shared font-bold' :
                dayOfWeek === 0 ? 'text-red-400' :
                dayOfWeek === 6 ? 'text-blue-400' : 'text-gray-700'
              }`}>
                {day}
              </span>
              {(birthday || isAnniversary) && (
                <span className="text-[10px] leading-none">
                  {birthday ? '🎂' : '💜'}
                </span>
              )}
              {/* 일정 도트 */}
              {dayEvents.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayEvents.slice(0, 3).map((ev) => (
                    <div
                      key={ev.id}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor:
                          ev.owner === 'yubin' ? '#FF6B8A' :
                          ev.owner === 'munsung' ? '#6B9EFF' : '#B06BFF',
                      }}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
