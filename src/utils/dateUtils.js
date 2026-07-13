/**
 * Date utility functions for shift schedule calendar
 */

export function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

export function getWeekEnd(date) {
  const start = getWeekStart(date);
  return new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
}

export function getMonthStart(date) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function getMonthEnd(date) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function format(date, formatStr) {
  const d = new Date(date);
  
  if (formatStr === 'yyyy-MM-dd') {
    return d.toISOString().split('T')[0];
  }
  
  if (formatStr === 'MMM yyyy') {
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
  
  if (formatStr === 'EEE') {
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  }
  
  if (formatStr === 'd') {
    return d.getDate();
  }
  
  return d.toLocaleDateString();
}

export function isToday(date) {
  const today = new Date();
  const d = new Date(date);
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

export function parseISO(dateString) {
  return new Date(dateString);
}
