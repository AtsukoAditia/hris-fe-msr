import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useNotificationStore = create(
  persist(
    (set, _get) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            { ...notification, id: Date.now(), read: false, createdAt: new Date().toISOString() },
            ...state.notifications,
          ],
          unreadCount: state.unreadCount + 1,
        })),

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),

      clearNotifications: () =>
        set({ notifications: [], unreadCount: 0 }),
    }),
    { name: 'notification-store' }
  )
)
