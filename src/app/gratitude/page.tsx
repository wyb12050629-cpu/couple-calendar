'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bird, Plus } from 'lucide-react';
import { supabase, type Gratitude } from '@/lib/supabase';
import { useUser } from '@/context/UserContext';
import BottomNav from '@/components/BottomNav';
import GratitudeCard from '@/components/GratitudeCard';
import GratitudeModal from '@/components/GratitudeModal';
import GratitudeSkeleton from '@/components/GratitudeSkeleton';
import ReconcileMode from '@/components/ReconcileMode';
import Toast from '@/components/Toast';

type Tab = 'yubin-to-munsung' | 'munsung-to-yubin';

export default function GratitudePage() {
  const { user } = useUser();
  const [tab, setTab] = useState<Tab>('yubin-to-munsung');
  const [messages, setMessages] = useState<Gratitude[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showWrite, setShowWrite] = useState(false);
  const [showReconcile, setShowReconcile] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchMessages = useCallback(async () => {
    const [from, to] = tab === 'yubin-to-munsung'
      ? ['yubin', 'munsung']
      : ['munsung', 'yubin'];

    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('gratitude')
        .select('*')
        .eq('from_user', from)
        .eq('to_user', to)
        .order('created_at', { ascending: false });

      if (err) throw err;
      if (data) setMessages(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '메시지를 불러오지 못했어요');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages, refreshKey]);

  const handleDeleted = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    setToast({ message: '삭제되었어요', type: 'success' });
  };

  const handleUpdated = (id: string, message: string) => {
    setMessages((prev) =>
      prev.map((m) => m.id === id ? { ...m, message, updated_at: new Date().toISOString() } : m)
    );
  };

  const handleError = (msg: string) => {
    setToast({ message: msg, type: 'error' });
    // Refetch to restore correct state
    fetchMessages();
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'yubin-to-munsung', label: '유빈 → 문성' },
    { key: 'munsung-to-yubin', label: '문성 → 유빈' },
  ];

  return (
    <div className="pb-20">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}

      {/* 헤더 */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold text-shared mb-1">
          우리가 쌓은 따뜻한 순간��� 🫶
        </h1>
      </div>

      {/* 화해 모드 버튼 */}
      <div className="px-4 mb-4">
        <button
          onClick={() => setShowReconcile(true)}
          className="w-full py-2.5 bg-paper border border-line rounded-lg text-sm font-medium text-shared flex items-center justify-center gap-2 hover:bg-line/30 transition-all active:scale-[0.98]"
        >
          <Bird size={16} />
          화해 모드 켜기 🕊️
        </button>
      </div>

      {/* 탭 */}
      <div className="flex px-4 gap-2 mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all border ${
              tab === t.key
                ? 'bg-shared text-white border-shared shadow-sm'
                : 'bg-paper text-caption border-line hover:border-ink/20'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 메시지 리스트 */}
      <div className="px-4 pb-4 animate-fade-switch" key={`${tab}-${refreshKey}`}>
        {loading ? (
          <GratitudeSkeleton />
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-sm text-yubin mb-3">{error}</p>
            <button
              onClick={fetchMessages}
              className="text-sm font-medium text-shared hover:text-shared/80 transition-colors"
            >
              다시 시도
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-caption/60 py-8">
            <p className="text-3xl mb-3">��</p>
            <p className="text-sm mb-1">첫 감사 메시지를 적어볼까요?</p>
            <button
              onClick={() => setShowWrite(true)}
              className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-shared hover:text-shared/80 transition-colors"
            >
              <Plus size={14} /> 새로운 감사 ��기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m, i) => (
              <GratitudeCard
                key={m.id}
                gratitude={m}
                currentUser={user}
                index={i}
                onDeleted={handleDeleted}
                onUpdated={handleUpdated}
                onError={handleError}
              />
            ))}
          </div>
        )}
      </div>

      {/* 작성 버튼 */}
      <button
        onClick={() => setShowWrite(true)}
        className="fixed bottom-24 right-4 md:right-auto md:left-1/2 md:translate-x-[170px] h-14 px-5 bg-yubin text-white rounded-full shadow-lg flex items-center justify-center gap-2 active:scale-90 transition-all z-40 text-sm font-medium"
        style={{ boxShadow: '0 4px 14px rgba(184, 95, 95, 0.35)' }}
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
