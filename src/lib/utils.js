import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'
import { id } from 'date-fns/locale'

// Shadcn/UI class merge utility
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Format date to readable Indonesian format
export function formatDate(date, pattern = 'dd MMMM yyyy') {
  if (!date) return '-'
  return format(new Date(date), pattern, { locale: id })
}

// Format datetime
export function formatDateTime(date) {
  if (!date) return '-'
  return format(new Date(date), 'dd MMM yyyy HH:mm', { locale: id })
}

// Format time only
export function formatTime(date) {
  if (!date) return '-'
  return format(new Date(date), 'HH:mm')
}

// Relative time (e.g. "2 menit yang lalu")
export function timeAgo(date) {
  if (!date) return '-'
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: id })
}

// Check if date is today
export function checkIsToday(date) {
  return isToday(new Date(date))
}

// Get status badge color
export function getStatusColor(status) {
  const colors = {
    present: 'bg-green-100 text-green-800',
    late: 'bg-yellow-100 text-yellow-800',
    absent: 'bg-red-100 text-red-800',
    leave: 'bg-blue-100 text-blue-800',
    permit: 'bg-purple-100 text-purple-800',
    pending: 'bg-gray-100 text-gray-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

// Get user from localStorage
export function getUser() {
  try {
    const user = localStorage.getItem('hris_user')
    return user ? JSON.parse(user) : null
  } catch {
    return null
  }
}

// Get token from localStorage
export function getToken() {
  return localStorage.getItem('hris_token') || null
}

// Calculate work hours from checkin/checkout
export function calcWorkHours(checkin, checkout) {
  if (!checkin || !checkout) return '0j 0m'
  const diff = new Date(checkout) - new Date(checkin)
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  return `${hours}j ${minutes}m`
}
