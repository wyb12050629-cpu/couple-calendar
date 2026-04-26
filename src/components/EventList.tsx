'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock } from 'lucide-react';
import { supabase, type Event } from '@/lib/supabase';
import EventModal from './EventModal';

type Props = {
  date: string;
  filterOwner?: 'yubin' | 'munsung' | 'shared';
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

export default function EventList({ date, filterOwner }: Props) {
  const [events, setEvents] = useState<Event[]>([]);
  const [editEvent, setEditEvent] = useState<Event | null>(null);

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

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  if (events.length === 0) {
    return (
      <div className="px-4 py-6 text-center text-ink/30 text-sm">
        이 날은 일정이 없어요
      </div>
    );
  }

  return (
    <>
      <div className="px-4 space-y-2 pb-2">
        {events.map((ev) => (
          <button
            key={ev.id}
            onClick={() => setEditEvent(ev)}
            className={`w-full text-left bg-paper rounded-lg p-4 border-l-4 ${ownerColors[ev.owner]} border border-line shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-line/50 text-ink/60">
                  {ownerLabels[ev.owner]}
                </span>
                <h4 className="font-bold text-sm mt-1.5 text-ink">{ev.title}</h4>
                {ev.all_day ? (
                  <div className="flex items-center gap-1 mt-1 text-xs text-ink/40">
                    <Clock size={12} />
                    <span>하루 종일{ev.end_date ? ` (${ev.date} ~ ${ev.end_date})` : ''}</span>
                  </div>
                ) : ev.start_time ? (
                  <div className="flex items-center gap-1 mt-1 text-xs text-ink/40">
                    <Clock size={12} />
                    <span>
                      {ev.start_time.slice(0, 5)}
                      {ev.end_time ? ` ~ ${ev.end_time.slice(0, 5)}` : ''}
                    </span>
                  </div>
                ) : null}
                {ev.memo && (
                  <p className="text-xs text-ink/40 mt-1 line-clamp-2">{ev.memo}</p>
                )}
              </div>
              {ev.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ev.image_url} alt="" className="w-12 h-12 rounded-lg object-cover ml-3" />
              )}
            </div>
          </button>
        ))}
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
