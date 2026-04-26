'use client';

import { getDDay, isBirthday } from '@/lib/dates';

export default function DdayBanner() {
  const dday = getDDay();
  const today = new Date();
  const birthday = isBirthday(today);

  return (
    <div className="px-4 pt-4 space-y-2">
      <div className="bg-gradient-to-r from-yubin/20 to-munsung/20 rounded-2xl p-4 text-center">
        <p className="text-xs text-gray-500 mb-1">유빈 & 문성</p>
        <p className="text-2xl font-bold text-shared">
          D+{dday} <span className="text-base">💕</span>
        </p>
      </div>
      {birthday && (
        <div className="bg-gradient-to-r from-yellow-100 to-pink-100 rounded-2xl p-3 text-center animate-fade-in">
          <p className="text-lg font-bold">
            {birthday.emoji} {birthday.who} 생일 축하해! {birthday.emoji}
          </p>
        </div>
      )}
    </div>
  );
}
