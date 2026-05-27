import { create } from 'zustand'
import { notificationService } from '../services/notificationService'

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,

  fetch: async () => {
    try {
      const { data } = await notificationService.getAll()
      set({ notifications: data, unreadCount: data.filter((n) => !n.read).length })
    } catch {}
  },

  markRead: async (id) => {
    await notificationService.markRead(id)
    set((s) => ({
      notifications: s.notifications.map((n) => n._id === id ? { ...n, read: true } : n),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }))
  },

  markAllRead: async () => {
    await notificationService.markAllRead()
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }))
  },

  remove: async (id) => {
    const n = get().notifications.find((x) => x._id === id)
    await notificationService.delete(id)
    set((s) => ({
      notifications: s.notifications.filter((x) => x._id !== id),
      unreadCount: n && !n.read ? Math.max(0, s.unreadCount - 1) : s.unreadCount,
    }))
  },
}))

export default useNotificationStore
