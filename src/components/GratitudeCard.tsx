'use client';

import type { Gratitude } from '@/lib/supabase';

const userNames: Record<string, string> = {
  yubin: '유빈',
  munsung: '문성',
};

const userColors: Record<string, string> = {
  yubin: 'text-yubin',
  munsung: 'text-munsung',
};

export default function GratitudeCard({ gratitude }: { gratitude: Gratitude }) {
  const date = new Date(gratitude.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-paper rounded-lg p-4 shadow-sm border border-line animate-fade-in rotate-[-0.3deg]">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-semibold ${userColors[gratitude.from_user]}`}>
          {userNames[gratitude.from_user]}
        </span>
        <span className="text-[10px] font-normal text-caption/60">{date}</span>
      </div>
      <p className="text-sm text-ink leading-relaxed font-normal">{gratitude.message}</p>
    </div>
  );
}
