// ============================================
// Date Utilities
// ============================================

export function getToday() {
  return formatDate(new Date());
}

export function formatDate(date) {
  const d = new Date(date);
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
}

export function formatDateDisplay(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
}

export function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true
  });
}

export function getDaysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0,0,0,0);
  d2.setHours(0,0,0,0);
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

export function getStartOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1)); // Monday start
  return formatDate(d);
}

export function getStartOfMonth(date = new Date()) {
  const d = new Date(date);
  d.setDate(1);
  return formatDate(d);
}

export function getDaysInRange(startDate, endDate) {
  const days = [];
  let current = new Date(startDate);
  const end = new Date(endDate);
  while (current <= end) {
    days.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

export function isToday(date) {
  return formatDate(date) === getToday();
}

export function isYesterday(date) {
  return formatDate(date) === addDays(new Date(), -1);
}

export function getRelativeDay(date) {
  const d = formatDate(date);
  if (d === getToday()) return 'Today';
  if (d === addDays(new Date(), -1)) return 'Yesterday';
  if (d === addDays(new Date(), 1)) return 'Tomorrow';
  return formatDateDisplay(date);
}

export function getDayOfWeek(date) {
  return new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
}

export function getMonthName(monthIndex) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return months[monthIndex];
}

export function getLast365Days() {
  const days = [];
  for (let i = 364; i >= 0; i--) {
    days.push(addDays(new Date(), -i));
  }
  return days;
}

export function getLast30Days() {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    days.push(addDays(new Date(), -i));
  }
  return days;
}

export function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    days.push(addDays(new Date(), -i));
  }
  return days;
}
