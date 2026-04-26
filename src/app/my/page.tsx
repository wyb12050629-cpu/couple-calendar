'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import BottomNav from '@/components/BottomNav';
import Calendar from '@/components/Calendar';
import EventList from '@/components/EventList';
import EventModal from '@/components/EventModal';

export default function MyPage() {
  const { user } = useUser();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const displayName = user === 'yubin' ? '유빈' : '문성';
  const color = user === 'yubin' ? 'text-yubin' : 'text-munsung';
  const profileImg = user === 'yubin' ? '/images/profile_yubin.png' : '/images/profile_munsung.png';

  return (
    <div className="pb-20">
      <div className="px-4 pt-4">
        <h1 className={`text-xl font-bold ${color}`}>{displayName}의 일정</h1>
      </div>

      <Calendar
        key={refreshKey}
        onDateClick={(date) => setSelectedDate(date)}
        filterOwner={user || undefined}
        selectedDate={selectedDate}
      />

      {selectedDate && (
        <div className="px-4 mb-1">
          <h3 className="font-semibold text-sm text-caption">{selectedDate}</h3>
        </div>
      )}
      {selectedDate && (
        <EventList
          date={selectedDate}
          filterOwner={user || undefined}
          key={`list-${selectedDate}-${refreshKey}`}
          onAddClick={() => setShowAddModal(true)}
        />
      )}

      {/* 프로필 캐릭터 */}
      <div className="flex justify-center pt-4 pb-2 opacity-60">
        <Image
          src={profileImg}
          alt={displayName}
          width={120}
          height={120}
          className="rotate-[2deg]"
        />
      </div>

      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-4 md:right-auto md:left-1/2 md:translate-x-[170px] w-14 h-14 bg-yubin text-white rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-all z-40"
        style={{ boxShadow: '0 4px 14px rgba(184, 95, 95, 0.35)' }}
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {showAddModal && (
        <EventModal
          date={selectedDate || todayStr}
          onClose={() => setShowAddModal(false)}
          onSaved={() => { setShowAddModal(false); setRefreshKey(k => k + 1); }}
        />
      )}

      <BottomNav />
    </div>
  );
}
