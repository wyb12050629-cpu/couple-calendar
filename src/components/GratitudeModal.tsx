'use client';

import { useState } from 'react';
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

  const handleSave = async () => {
    if (!message.trim() || !user) return;
    setSaving(true);

    await supabase.from('gratitude').insert({
      from_user: user,
      to_user: toUser,
      message: message.trim(),
    });

    setShowHearts(true);
    setTimeout(() => {
      setSaving(false);
      onSaved();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-ink/40 z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-paper w-full max-w-[430px] rounded-t-2xl p-6 animate-slide-up relative overflow-hidden border-t border-line"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 하트 파티클 */}
        {showHearts && (
          <div className="absolute inset-0 pointer-events-none">
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

        <div className="flex items-center justify-between mb-4">
          <h3 className="font-header font-bold text-xl text-ink">감사한 순간 기록하기</h3>
          <button onClick={onClose} className="p-2 text-ink/40 hover:bg-line/50 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-ink/40 mb-4 font-handwriting text-base">
          {toName}에게 전하는 마음 💌
        </p>

        <div className="relative mb-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 200))}
            placeholder="어제 2시간 달려와 줘서 고마워 💕"
            rows={4}
            className="w-full px-4 py-3 bg-paper border border-line rounded-lg text-sm outline-none resize-none focus:ring-2 focus:ring-shared/30 text-ink placeholder:text-ink/30"
          />
          <span className="absolute bottom-3 right-3 text-[10px] text-ink/30">
            {message.length}/200
          </span>
        </div>

        <button
          onClick={handleSave}
          disabled={!message.trim() || saving}
          className="w-full py-3.5 bg-paper border-2 border-shared text-shared rounded-lg font-bold text-sm disabled:opacity-50 active:scale-[0.98] transition-all hover:bg-shared hover:text-white"
        >
          {saving ? '저장 중... 💕' : '마음 전하기'}
        </button>
      </div>
    </div>
  );
}
