'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bird, Plus } from 'lucide-react';
import { supabase, type Gratitude } from '@/lib/supabase';
import { useUser } from '@/context/UserContext';
import BottomNav from '@/components/BottomNav';
import GratitudeCard from '@/components/GratitudeCard';
import GratitudeModal from '@/components/GratitudeModal';
import ReconcileMode from '@/components/ReconcileMode';

type Tab = 'yubin-to-munsung' | 'munsung-to-yubin';

export default function GratitudePage() {
  useUser(); // ensure context is available
  const [tab, setTab] = useState<Tab>('yubin-to-munsung');
  const [messages, setMessages] = useState<Gratitude[]>([]);
  const [showWrite, setShowWrite] = useState(false);
  const [showReconcile, setShowReconcile] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchMessages = useCallback(async () => {
    const [from, to] = tab === 'yubin-to-munsung'
      ? ['yubin', 'munsung']
      : ['munsung', 'yubin'];

    const { data } = await supabase
      .from('gratitude')
      .select('*')
      .eq('from_user', from)
      .eq('to_user', to)
      .order('created_at', { ascending: false });

    if (data) setMessages(data);
  }, [tab]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages, refreshKey]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'yubin-to-munsung', label: '유빈 → 문성' },
    { key: 'munsung-to-yubin', label: '문성 → 유빈' },
  ];

  return (
    <div className="pb-20">
      {/* 헤더 */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="font-header text-xl text-shared mb-1">
          우리가 쌓은 따뜻한 순간들 🫶
        </h1>
      </div>

      {/* 화해 모드 버튼 */}
      <div className="px-4 mb-4">
        <button
          onClick={() => setShowReconcile(true)}
          className="w-full py-3 bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl text-sm font-bold text-shared flex items-center justify-center gap-2 hover:from-pink-200 hover:to-purple-200 transition-all active:scale-[0.98]"
        >
          <Bird size={18} />
          화해 모드 켜기 🕊️
        </button>
      </div>

      {/* 탭 */}
      <div className="flex px-4 gap-2 mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all ${
              tab === t.key
                ? 'bg-shared text-white shadow-md'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 메시지 리스트 */}
      <div className="px-4 space-y-3 pb-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-300 py-12 text-sm">
            아직 메시지가 없어요<br />첫 감사를 전해보세요! 💌
          </div>
        ) : (
          messages.map((m) => <GratitudeCard key={m.id} gratitude={m} />)
        )}
      </div>

      {/* 작성 버튼 */}
      <button
        onClick={() => setShowWrite(true)}
        className="fixed bottom-20 right-4 md:right-auto md:left-1/2 md:translate-x-[170px] h-14 px-5 bg-shared text-white rounded-full shadow-lg flex items-center justify-center gap-2 hover:shadow-xl active:scale-90 transition-all z-40 text-sm font-bold"
      >
        <Plus size={18} />
        감사한 순간 기록하기
      </button>

      {showWrite && (
        <GratitudeModal
          onClose={() => setShowWrite(false)}
          onSaved={() => {
            setShowWrite(false);
            setRefreshKey((k) => k + 1);
          }}
        />
      )}

      {showReconcile && <ReconcileMode onClose={() => setShowReconcile(false)} />}

      <BottomNav />
    </div>
  );
}
