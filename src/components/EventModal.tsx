'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Trash2, Image as ImageIcon } from 'lucide-react';
import { supabase, type Event } from '@/lib/supabase';
import { useUser } from '@/context/UserContext';

type Props = {
  date: string;
  event?: Event | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function EventModal({ date, event, onClose, onSaved }: Props) {
  const { user } = useUser();
  const [title, setTitle] = useState(event?.title || '');
  const [startDate, setStartDate] = useState(event?.date || date);
  const [endDate, setEndDate] = useState(event?.end_date || event?.date || date);
  const [allDay, setAllDay] = useState(event?.all_day ?? false);
  const [startTime, setStartTime] = useState(event?.start_time || '');
  const [endTime, setEndTime] = useState(event?.end_time || '');
  const [memo, setMemo] = useState(event?.memo || '');
  const [owner, setOwner] = useState<Event['owner']>(event?.owner || user || 'yubin');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(event?.image_url || null);
  const [saving, setSaving] = useState(false);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // ESC key to close
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!title.trim()) return;

    // 검증: 종료 날짜가 시작 날짜보다 이전인지
    if (endDate < startDate) {
      alert('종료 날짜가 시작 날짜보다 빠를 수 없어요.');
      return;
    }

    // 검증: 같은 날이고 시간이 있으면 종료시간 체크
    if (!allDay && startDate === endDate && startTime && endTime && endTime < startTime) {
      alert('종료 시간이 시작 시간보다 빠를 수 없어요.');
      return;
    }

    setSaving(true);

    let imageUrl = event?.image_url || null;

    if (imageFile) {
      const ext = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${ext}`;
      const { data } = await supabase.storage
        .from('event-images')
        .upload(fileName, imageFile);
      if (data) {
        const { data: urlData } = supabase.storage
          .from('event-images')
          .getPublicUrl(data.path);
        imageUrl = urlData.publicUrl;
      }
    }

    const payload = {
      title: title.trim(),
      date: startDate,
      end_date: endDate !== startDate ? endDate : null,
      start_time: allDay ? null : (startTime || null),
      end_time: allDay ? null : (endTime || null),
      all_day: allDay,
      memo: memo.trim() || null,
      owner,
      image_url: imageUrl,
    };

    if (event) {
      await supabase.from('events').update(payload).eq('id', event.id);
    } else {
      await supabase.from('events').insert(payload);
    }

    setSaving(false);
    onSaved();
  };

  const handleDelete = async () => {
    if (!event) return;
    await supabase.from('events').delete().eq('id', event.id);
    onSaved();
  };

  const ownerOptions: { value: Event['owner']; label: string; color: string }[] = [
    { value: 'yubin', label: '유빈', color: 'bg-yubin' },
    { value: 'munsung', label: '문성', color: 'bg-munsung' },
    { value: 'shared', label: '공동', color: 'bg-shared' },
  ];

  return (
    <div className="fixed inset-0 bg-ink/40 z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-paper w-full max-w-[430px] rounded-t-2xl animate-slide-up border-t border-line flex flex-col"
        style={{ maxHeight: '90dvh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 - 고정 */}
        <div className="flex items-center justify-between px-6 pt-6 pb-3 flex-shrink-0">
          <h3 className="font-header font-bold text-xl text-ink">{event ? '일정 수정' : '새 일정'}</h3>
          <div className="flex gap-2">
            {event && (
              <button onClick={handleDelete} className="p-2 text-yubin hover:bg-yubin/10 rounded-lg">
                <Trash2 size={18} />
              </button>
            )}
            <button onClick={onClose} className="p-2 text-ink/40 hover:bg-line/50 rounded-lg">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 본문 - 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6">
          {/* 소유자 선택 */}
          <div className="flex gap-2 mb-4">
            {ownerOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setOwner(opt.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                  owner === opt.value
                    ? `${opt.color} text-white shadow-sm border-transparent`
                    : 'bg-paper text-ink/50 border-line hover:border-ink/20'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* 제목 */}
          <input
            type="text"
            placeholder="일정 제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-paper border border-line rounded-lg text-sm mb-3 outline-none focus:ring-2 focus:ring-shared/30 text-ink placeholder:text-ink/30"
          />

          {/* 날짜 */}
          <div className="flex gap-3 mb-3">
            <div className="flex-1">
              <label className="text-[11px] text-ink/40 mb-1 block">시작 날짜</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (endDate < e.target.value) setEndDate(e.target.value);
                }}
                className="w-full px-4 py-3 bg-paper border border-line rounded-lg text-sm outline-none focus:ring-2 focus:ring-shared/30 text-ink"
              />
            </div>
            <span className="self-end pb-3 text-ink/30">~</span>
            <div className="flex-1">
              <label className="text-[11px] text-ink/40 mb-1 block">종료 날짜</label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 bg-paper border border-line rounded-lg text-sm outline-none focus:ring-2 focus:ring-shared/30 text-ink"
              />
            </div>
          </div>

          {/* 하루 종일 토글 */}
          <label className="flex items-center gap-2 mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="w-4 h-4 rounded border-line text-shared focus:ring-shared/30 accent-shared"
            />
            <span className="text-sm text-ink/60">하루 종일</span>
          </label>

          {/* 시간 */}
          {!allDay && (
            <div className="flex gap-3 mb-3">
              <div className="flex-1">
                <label className="text-[11px] text-ink/40 mb-1 block">시작 시간</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-3 bg-paper border border-line rounded-lg text-sm outline-none focus:ring-2 focus:ring-shared/30 text-ink"
                />
              </div>
              <span className="self-end pb-3 text-ink/30">~</span>
              <div className="flex-1">
                <label className="text-[11px] text-ink/40 mb-1 block">종료 시간</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-3 bg-paper border border-line rounded-lg text-sm outline-none focus:ring-2 focus:ring-shared/30 text-ink"
                />
              </div>
            </div>
          )}

          {/* 메모 */}
          <textarea
            placeholder="메모 (선택)"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-paper border border-line rounded-lg text-sm mb-3 outline-none resize-none focus:ring-2 focus:ring-shared/30 text-ink placeholder:text-ink/30"
          />

          {/* 이미지 업로드 */}
          <div className="mb-4">
            <label className="flex items-center gap-2 px-4 py-3 bg-paper border border-line rounded-lg cursor-pointer hover:bg-line/30 transition-colors">
              <ImageIcon size={18} className="text-ink/40" />
              <span className="text-sm text-ink/40">사진 첨부</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
            {imagePreview && (
              <div className="mt-2 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="미리보기" className="w-full h-40 object-cover rounded-lg" />
                <button
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 p-1 bg-ink/50 rounded-full text-white"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 푸터 - 고정 */}
        <div className="flex-shrink-0 px-6 pt-3 pb-6" style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="w-full py-3.5 bg-paper border-2 border-shared text-shared rounded-lg font-bold text-sm disabled:opacity-50 active:scale-[0.98] transition-all hover:bg-shared hover:text-white"
          >
            {saving ? '저장 중...' : event ? '수정하기' : '저장하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
