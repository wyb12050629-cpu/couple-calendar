const ANNIVERSARY = new Date(2026, 1, 7); // 2026-02-07

export function getDDay(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const anniversary = new Date(ANNIVERSARY);
  anniversary.setHours(0, 0, 0, 0);
  const diff = today.getTime() - anniversary.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

export function isBirthday(date: Date): { who: string; emoji: string } | null {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if (month === 12 && day === 5) return { who: '유빈', emoji: '🎂' };
  if (month === 4 && day === 19) return { who: '문성', emoji: '🎂' };
  return null;
}

export function isAnniversaryDate(date: Date): boolean {
  return date.getMonth() === 1 && date.getDate() === 7;
}

export function getCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  return days;
}

export function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export const MONTH_NAMES = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
];
