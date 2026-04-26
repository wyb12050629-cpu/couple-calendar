'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock, Plus } from 'lucide-react';
import { supabase, type Event, type Gratitude } from '@/lib/supabase';
import EventModal from './EventModal';

type Props = {
  date: string;
  filterOwner?: 'yubin' | 'munsung' | 'shared';
  onAddClick?: () => void;
};

const ownerColors: Record<string, string> = {
  yubin: 'border-l-yubin',
  munsung: 'border-l-munsung',
  shared: 'border-l-shared',
};

const ownerLabels: Record<string, string> = {
  yubin: '유빈',
  munsung: '문성',
  shared: '공동',
};

export default function EventList({ date, filterOwner, onAddClick }: Props) {
  const [events, setEvents] = useState<Event[]>([]);
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [todayGratitude, setTodayGratitude] = useState<Gratitude | null>(null);

  const fetchEvents = useCallback(async () => {
    let query = supabase
      .from('events')
      .select('*')
      .eq('date', date)
      .order('start_time', { ascending: true });

    if (filterOwner) {
      query = query.eq('owner', filterOwner);
    }

    const { data } = await query;
    if (data) setEvents(data);
  }, [date, filterOwner]);

  const fetchGratitude = useCallback(async () => {
    const { data } = await supabase
      .from('gratitude')
      .select('*')
      .gte('created_at', `${date}T00:00:00`)
      .lte('created_at', `${date}T23:59:59`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (data && data.length > 0) setTodayGratitude(data[0]);
    else setTodayGratitude(null);
  }, [date]);

  useEffect(() => {
    fetchEvents();
    fetchGratitude();
  }, [fetchEvents, fetchGratitude]);

  return (
    <>
      <div className="px-4 pb-2">
        {/* 오늘의 감사 카드 */}
        {todayGratitude && (
          <div className="bg-accent/10 border border-accent/30 rounded-lg px-3 py-2 mb-2">
            <p className="text-[10px] font-medium text-accent mb-0.5">오늘의 감사</p>
            <p className="text-xs text-ink/70 line-clamp-1">{todayGratitude.message}</p>
          </div>
        )}

        {/* 일정 리스트 */}
        {events.length === 0 ? (
          <div className="py-3 text-center">
            <p className="text-sm text-caption/60 mb-2">일정이 없어요</p>
            {onAddClick && (
              <button
                onClick={onAddClick}
                className="inline-flex items-center gap-1 text-xs font-medium text-shared hover:text-shared/80 transition-colors"
              >
                <Plus size={14} />
                일정 추가하기
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {events.map((ev) => (
              <button
                key={ev.id}
                onClick={() => setEditEvent(ev)}
                className={`w-full text-left bg-paper rounded-lg p-3 border-l-4 ${ownerColors[ev.owner]} border border-line shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-line/50 text-caption">
                      {ownerLabels[ev.owner]}
                    </span>
                    <h4 className="font-medium text-sm mt-1 text-ink">{ev.title}</h4>
                    {ev.all_day ? (
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-caption/70">
                        <Clock size={11} />
                        <span>하루 종일{ev.end_date ? ` (${ev.date} ~ ${ev.end_date})` : ''}</span>
                      </div>
                    ) : ev.start_time ? (
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-caption/70">
                        <Clock size={11} />
                        <span>
                          {ev.start_time.slice(0, 5)}
                          {ev.end_time ? ` ~ ${ev.end_time.slice(0, 5)}` : ''}
                        </span>
                      </div>
                    ) : null}
                    {ev.memo && (
                      <p className="text-xs text-caption/60 mt-0.5 line-clamp-2">{ev.memo}</p>
                    )}
                  </div>
                  {ev.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ev.image_url} alt="" className="w-11 h-11 rounded-lg object-cover ml-2" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {editEvent && (
        <EventModal
          date={date}
          event={editEvent}
          onClose={() => setEditEvent(null)}
          onSaved={() => { setEditEvent(null); fetchEvents(); }}
        />
      )}
    </>
  );
}
