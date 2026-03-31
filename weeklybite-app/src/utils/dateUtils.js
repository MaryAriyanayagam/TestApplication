import { format, startOfWeek, addDays, parseISO, differenceInDays } from 'date-fns';

export const getWeekDays = (weekStartDate) => {
  const start = startOfWeek(new Date(weekStartDate), { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

export const formatDate = (date) => format(new Date(date), 'yyyy-MM-dd');

export const formatDisplayDate = (date) => format(new Date(date), 'EEE, MMM d');

export const formatFullDate = (date) => format(new Date(date), 'MMMM d, yyyy');

export const getMonday = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return format(d, 'yyyy-MM-dd');
};

export const daysUntilExpiry = (expirationDate) => {
  if (!expirationDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = parseISO(expirationDate);
  return differenceInDays(expiry, today);
};

export const isExpired = (expirationDate) => {
  if (!expirationDate) return false;
  const days = daysUntilExpiry(expirationDate);
  return days !== null && days < 0;
};

export const isExpiringSoon = (expirationDate, days = 3) => {
  if (!expirationDate) return false;
  const remaining = daysUntilExpiry(expirationDate);
  return remaining !== null && remaining >= 0 && remaining <= days;
};
