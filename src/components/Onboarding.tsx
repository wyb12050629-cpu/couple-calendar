'use client';

import { useUser } from '@/context/UserContext';
import type { Owner } from '@/lib/supabase';
import { subscribeToPush } from '@/lib/push';

export default function Onboarding() {
  const { setUser } = useUser();

  const select = async (owner: Owner) => {
    setUser(owner);
    // 알림 구독을 약간 딜레이 후 요청 (UX 개선)
    setTimeout(() => {
      subscribeToPush(owner);
    }, 2000);
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-bg-pink px-6">
      <h1 className="font-header text-3xl text-shared mb-2">Our Calendar</h1>
      <p className="text-gray-500 mb-10 text-sm">누구인지 알려주세요!</p>

      <div className="flex gap-6">
        <button
          onClick={() => select('yubin')}
          className="flex flex-col items-center gap-3 p-8 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          <span className="text-5xl">🔴</span>
          <span className="text-lg font-bold text-yubin">유빈</span>
        </button>

        <button
          onClick={() => select('munsung')}
          className="flex flex-col items-center gap-3 p-8 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          <span className="text-5xl">🔵</span>
          <span className="text-lg font-bold text-munsung">문성</span>
        </button>
      </div>
    </div>
  );
}
