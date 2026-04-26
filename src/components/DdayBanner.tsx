'use client';

import { getDDay, isBirthday } from '@/lib/dates';

export default function DdayBanner() {
  const dday = getDDay();
  const today = new Date();
  const birthday = isBirthday(today);

  return (
    <div className="px-4 pt-4 space-y-2">
      <div className="bg-paper border border-line rounded-lg p-4 text-center rotate-[-0.5deg] shadow-sm">
        <p className="text-xs text-ink/50 mb-1 font-handwriting text-base">유빈 & 문성</p>
        <p className="text-2xl font-header font-bold text-shared">
          D+{dday} <span className="text-base">💕</span>
        </p>
      </div>
      {birthday && (
        <div className="bg-paper border border-line rounded-lg p-3 text-center animate-fade-in rotate-[0.5deg] shadow-sm">
          <p className="text-lg font-header font-bold text-ink">
            {birthday.emoji} {birthday.who} 생일 축하해! {birthday.emoji}
          </p>
        </div>
      )}
    </div>
  );
}
