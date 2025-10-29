/**
 * Notifications Slice - In-app notification management
 * Brokmang. v1.1
 */

import { StateCreator } from 'zustand';
import type { Notification } from '../types';

export interface NotificationsSlice {
  // State
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  
  // Filters
  filter: 'all' | 'alerts' | 'system';
  
  // Actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  setFilter: (filter: 'all' | 'alerts' | 'system') => void;
  setLoading: (loading: boolean) => void;
  
  // Computed
  getUnreadNotifications: () => Notification[];
  getFilteredNotifications: () => Notification[];
  getNotificationById: (id: string) => Notification | undefined;
}

export const createNotificationsSlice: StateCreator<NotificationsSlice> = (set, get) => ({
  // Initial state
  notifications: [],
  unreadCount: 0,
  loading: false,
  filter: 'all',
  
  // Actions
  setNotifications: (notifications) => {
    const unread = notifications.filter(n => !n.is_read).length;
    set({ notifications, unreadCount: unread });
  },
  
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: !notification.is_read ? state.unreadCount + 1 : state.unreadCount,
    }));
  },
  
  markAsRead: (notificationId) => {
    set((state) => {
      const notification = state.notifications.find(n => n.id === notificationId);
      if (!notification || notification.is_read) {
        return state;
      }
      
      return {
        notifications: state.notifications.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    });
  },
  
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, is_read: true })),
      unreadCount: 0,
    }));
  },
  
  deleteNotification: (notificationId) => {
    set((state) => {
      const notification = state.notifications.find(n => n.id === notificationId);
      const wasUnread = notification && !notification.is_read;
      
      return {
        notifications: state.notifications.filter(n => n.id !== notificationId),
        unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      };
    });
  },
  
  setFilter: (filter) => set({ filter }),
  
  setLoading: (loading) => set({ loading }),
  
  // Computed
  getUnreadNotifications: () => {
    return get().notifications.filter(n => !n.is_read);
  },
  
  getFilteredNotifications: () => {
    const { notifications, filter } = get();
    
    if (filter === 'all') {
      return notifications;
    }
    
    if (filter === 'alerts') {
      return notifications.filter(n => 
        ['MISSED_LOG', 'KPI_ALERT', 'BREAK_EVEN_WARNING'].includes(n.type)
      );
    }
    
    if (filter === 'system') {
      return notifications.filter(n => 
        ['SYSTEM', 'TAX_REMINDER'].includes(n.type)
      );
    }
    
    return notifications;
  },
  
  getNotificationById: (id) => {
    return get().notifications.find(n => n.id === id);
  },
});

