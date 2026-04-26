'use client';

import { getDDay, isBirthday } from '@/lib/dates';
import ProfilePhoto from './ProfilePhoto';

export default function DdayBanner() {
  const dday = getDDay();
  const today = new Date();
  const birthday = isBirthday(today);

  return (
    <div className="px-4 pt-3 space-y-2">
      <div className="bg-paper border border-line rounded-lg px-4 py-3 flex items-center gap-3 rotate-[-0.5deg] shadow-sm">
        <ProfilePhoto size={44} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-normal text-caption/70">유빈 & 문성</p>
          <p className="text-2xl font-bold text-yubin leading-tight">
            D+{dday} <span className="text-sm font-normal text-caption/50">💕</span>
          </p>
        </div>
      </div>
      {birthday && (
        <div className="bg-paper border border-line rounded-lg px-4 py-2.5 text-center animate-fade-in rotate-[0.5deg] shadow-sm">
          <p className="text-base font-bold text-ink">
            {birthday.emoji} {birthday.who} 생일 축하해! {birthday.emoji}
          </p>
        </div>
      )}
    </div>
  );
}
