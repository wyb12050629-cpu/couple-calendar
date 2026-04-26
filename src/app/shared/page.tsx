'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Calendar from '@/components/Calendar';
import EventList from '@/components/EventList';
import EventModal from '@/components/EventModal';

export default function SharedPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="pb-20">
      <div className="px-4 pt-4">
        <h1 className="font-header text-2xl text-shared">우리의 공동 일정 💜</h1>
      </div>

      <Calendar
        key={refreshKey}
        onDateClick={(date) => setSelectedDate(date)}
        filterOwner="shared"
      />

      {selectedDate && (
        <div className="px-4 mb-2">
          <h3 className="font-bold text-sm text-gray-600 mb-2">{selectedDate}</h3>
        </div>
      )}
      {selectedDate && (
        <EventList
          date={selectedDate}
          filterOwner="shared"
          key={`list-${selectedDate}-${refreshKey}`}
        />
      )}

      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-20 right-4 md:right-auto md:left-1/2 md:translate-x-[170px] w-14 h-14 bg-shared text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl active:scale-90 transition-all z-40"
      >
        <Plus size={24} />
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
