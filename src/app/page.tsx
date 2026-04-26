'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import Onboarding from '@/components/Onboarding';
import BottomNav from '@/components/BottomNav';
import DdayBanner from '@/components/DdayBanner';
import Calendar from '@/components/Calendar';
import EventList from '@/components/EventList';
import EventModal from '@/components/EventModal';

export default function Home() {
  const { user, isLoading } = useUser();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-shared font-header text-2xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) return <Onboarding />;

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="pb-20">
      <DdayBanner />
      <Calendar
        key={refreshKey}
        onDateClick={(date) => setSelectedDate(date)}
      />

      {selectedDate && (
        <div className="px-4 mb-2">
          <h3 className="font-bold text-sm text-gray-600 mb-2">
            {selectedDate} 일정
          </h3>
        </div>
      )}
      {selectedDate && <EventList date={selectedDate} key={`list-${selectedDate}-${refreshKey}`} />}

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
          onSaved={() => {
            setShowAddModal(false);
            setRefreshKey((k) => k + 1);
          }}
        />
      )}

      <BottomNav />
    </div>
  );
}
