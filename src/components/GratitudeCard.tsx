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
    <div className="bg-white rounded-2xl p-4 shadow-sm animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-bold ${userColors[gratitude.from_user]}`}>
          {userNames[gratitude.from_user]}
        </span>
        <span className="text-[10px] text-gray-300">{date}</span>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{gratitude.message}</p>
    </div>
  );
}
