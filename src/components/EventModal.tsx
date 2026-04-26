'use client';

import { useState } from 'react';
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
  const [startTime, setStartTime] = useState(event?.start_time || '');
  const [endTime, setEndTime] = useState(event?.end_time || '');
  const [memo, setMemo] = useState(event?.memo || '');
  const [owner, setOwner] = useState<Event['owner']>(event?.owner || user || 'yubin');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(event?.image_url || null);
  const [saving, setSaving] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!title.trim()) return;
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
      date,
      start_time: startTime || null,
      end_time: endTime || null,
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
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-white w-full max-w-[430px] rounded-t-3xl p-6 animate-slide-up max-h-[85dvh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg">{event ? '일정 수정' : '새 일정'}</h3>
          <div className="flex gap-2">
            {event && (
              <button onClick={handleDelete} className="p-2 text-red-400 hover:bg-red-50 rounded-full">
                <Trash2 size={18} />
              </button>
            )}
            <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-50 rounded-full">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 날짜 표시 */}
        <p className="text-sm text-gray-400 mb-4">{date}</p>

        {/* 소유자 선택 */}
        <div className="flex gap-2 mb-4">
          {ownerOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setOwner(opt.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                owner === opt.value
                  ? `${opt.color} text-white shadow-md`
                  : 'bg-gray-100 text-gray-500'
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
          className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm mb-3 outline-none focus:ring-2 focus:ring-shared/30"
        />

        {/* 시간 */}
        <div className="flex gap-3 mb-3">
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="flex-1 px-4 py-3 bg-gray-50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-shared/30"
          />
          <span className="self-center text-gray-300">~</span>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="flex-1 px-4 py-3 bg-gray-50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-shared/30"
          />
        </div>

        {/* 메모 */}
        <textarea
          placeholder="메모 (선택)"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm mb-3 outline-none resize-none focus:ring-2 focus:ring-shared/30"
        />

        {/* 이미지 업로드 */}
        <div className="mb-5">
          <label className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors">
            <ImageIcon size={18} className="text-gray-400" />
            <span className="text-sm text-gray-400">사진 첨부</span>
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
          {imagePreview && (
            <div className="mt-2 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="미리보기" className="w-full h-40 object-cover rounded-2xl" />
              <button
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleSave}
          disabled={!title.trim() || saving}
          className="w-full py-3.5 bg-shared text-white rounded-2xl font-bold text-sm disabled:opacity-50 active:scale-[0.98] transition-transform"
        >
          {saving ? '저장 중...' : event ? '수정하기' : '저장하기'}
        </button>
      </div>
    </div>
  );
}
