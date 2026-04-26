'use client';

import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/context/UserContext';

type Props = {
  onClose: () => void;
  onSaved: () => void;
};

export default function GratitudeModal({ onClose, onSaved }: Props) {
  const { user } = useUser();
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [showHearts, setShowHearts] = useState(false);

  const toUser = user === 'yubin' ? 'munsung' : 'yubin';
  const toName = toUser === 'yubin' ? '유빈' : '문성';
  const fromName = user === 'yubin' ? '유빈' : '문성';

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleSave = async () => {
    if (!message.trim() || !user) return;
    setSaving(true);

    const { data, error } = await supabase.from('gratitude').insert({
      from_user: user,
      to_user: toUser,
      message: message.trim(),
    }).select().single();

    if (error) {
      console.error('Failed to save gratitude:', error);
      setSaving(false);
      return;
    }

    if (data) {
      triggerPushNotification(toUser, fromName).catch(console.error);
    }

    setShowHearts(true);
    setTimeout(() => {
      setSaving(false);
      onSaved();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-ink/40 z-[55] flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-paper w-full max-w-[430px] rounded-t-2xl animate-slide-up relative border-t border-line flex flex-col"
        style={{ maxHeight: 'calc(100dvh - 40px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 하트 파티클 */}
        {showHearts && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {Array.from({ length: 12 }).map((_, i) => (
              <span
                key={i}
                className="heart-particle absolute text-lg"
                style={{
                  left: `${10 + Math.random() * 80}%`,
                  top: `${40 + Math.random() * 40}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                }}
              >
                {['💕', '💗', '💖', '✨', '🌸'][Math.floor(Math.random() * 5)]}
              </span>
            ))}
          </div>
        )}

        {/* 헤더: [X 취소]  제목  [기록하기] */}
        <div className="flex items-center justify-between px-4 pt-5 pb-3 flex-shrink-0 border-b border-line">
          <button onClick={onClose} className="p-2 text-ink/50 hover:bg-line/50 rounded-lg">
            <X size={20} />
          </button>
          <h3 className="font-bold text-base text-ink">감사한 순간</h3>
          <button
            onClick={handleSave}
            disabled={!message.trim() || saving}
            className="px-4 py-1.5 bg-shared text-white rounded-lg text-sm font-semibold disabled:opacity-40 active:scale-[0.97] transition-all"
          >
            {saving ? '저장 중' : '기록하기'}
          </button>
        </div>

        {/* 본문 - 스크롤 */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4" style={{ WebkitOverflowScrolling: 'touch' }}>
          <p className="text-sm text-caption mb-4">
            {toName}에게 전하는 마음 💌
          </p>

          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 200))}
              placeholder="어제 2시간 달려와 줘서 고마워 💕"
              rows={6}
              className="w-full px-4 py-3 bg-paper border border-line rounded-lg text-sm outline-none resize-none focus:ring-2 focus:ring-shared/30 text-ink placeholder:text-ink/30"
            />
            <span className="absolute bottom-3 right-3 text-[10px] text-caption/50">
              {message.length}/200
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

async function triggerPushNotification(toUser: string, fromName: string) {
  try {
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_name', toUser);

    if (!subs || subs.length === 0) return;

    await supabase.functions.invoke('send-gratitude-push', {
      body: {
        to_user: toUser,
        from_name: fromName,
      },
    });
  } catch (e) {
    console.error('Push notification failed:', e);
  }
}
