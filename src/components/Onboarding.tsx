'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useUser } from '@/context/UserContext';
import type { Owner } from '@/lib/supabase';
import { subscribeToPush } from '@/lib/push';

export default function Onboarding() {
  const { setUser } = useUser();
  const [fading, setFading] = useState(false);

  const select = (owner: Owner) => {
    setFading(true);
    setTimeout(() => {
      setUser(owner);
      // 알림 구독을 약간 딜레이 후 요청 (UX 개선)
      setTimeout(() => {
        subscribeToPush(owner);
      }, 2000);
    }, 500);
  };

  return (
    <div
      className={`min-h-dvh flex flex-col items-center justify-center px-6 relative overflow-hidden transition-opacity duration-500 ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* 배경 데코 요소 */}
      <span className="absolute top-8 left-6 text-2xl opacity-30 rotate-[-15deg]">✦</span>
      <span className="absolute top-16 right-8 text-xl opacity-25 rotate-[10deg]">♥</span>
      <span className="absolute top-32 left-12 text-lg opacity-20 rotate-[20deg]">⭐</span>
      <span className="absolute bottom-32 right-10 text-2xl opacity-25 rotate-[-8deg]">🌸</span>
      <span className="absolute bottom-20 left-8 text-xl opacity-20 rotate-[15deg]">✦</span>

      {/* 테이프 장식 (상단) */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-16 h-5 bg-accent/30 rotate-[-2deg] rounded-sm" />

      {/* 헤더 */}
      <div className="text-center mb-10 relative z-10">
        <h1 className="text-4xl font-bold text-ink mb-3 tracking-tight">
          Our Calendar
        </h1>
        <p className="text-base font-normal text-caption leading-relaxed">
          반가워요! 오늘은 누가 기록하나요?
        </p>
      </div>

      {/* 프로필 선택 카드 */}
      <div className="flex gap-5 relative z-10">
        {/* 유빈 카드 */}
        <button
          onClick={() => select('yubin')}
          className="group flex flex-col items-center gap-3 p-5 pb-4 bg-paper rounded-2xl border-2 border-yubin/30 shadow-sm transition-all duration-300 ease-out hover:shadow-lg hover:scale-105 hover:-translate-y-1 active:scale-95 rotate-[-2deg] hover:rotate-0"
        >
          {/* 테이프 */}
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-10 h-4 bg-yubin/20 rounded-sm rotate-[1deg]" />
          <div className="w-28 h-28 rounded-xl overflow-hidden border-2 border-yubin/20 shadow-inner bg-white">
            <Image
              src="/images/profile_yubin.png"
              alt="유빈"
              width={112}
              height={112}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-lg font-semibold text-yubin">유빈</span>
        </button>

        {/* 문성 카드 */}
        <button
          onClick={() => select('munsung')}
          className="group flex flex-col items-center gap-3 p-5 pb-4 bg-paper rounded-2xl border-2 border-munsung/30 shadow-sm transition-all duration-300 ease-out hover:shadow-lg hover:scale-105 hover:-translate-y-1 active:scale-95 rotate-[2deg] hover:rotate-0"
        >
          {/* 테이프 */}
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-10 h-4 bg-munsung/20 rounded-sm rotate-[-1deg]" />
          <div className="w-28 h-28 rounded-xl overflow-hidden border-2 border-munsung/20 shadow-inner bg-white">
            <Image
              src="/images/profile_munsung.png"
              alt="문성"
              width={112}
              height={112}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-lg font-semibold text-munsung">문성</span>
        </button>
      </div>

      {/* 하단 메시지 */}
      <p className="mt-10 text-xs font-normal text-caption/50 relative z-10">
        선택하면 바로 시작돼요 ✨
      </p>
    </div>
  );
}
