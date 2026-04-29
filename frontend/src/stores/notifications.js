import { defineStore } from 'pinia';
import axios from 'axios';

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    loading: false,
    lastFetch: 0
  }),
  
  getters: {
    unreadCount: (state) => state.notifications.filter(n => !n.is_read).length
  },
  
  actions: {
    async fetchNotifications(force = false) {
      if (this.fetchPromise) return this.fetchPromise;

      const now = Date.now();
      if (!force && this.lastFetch && now - this.lastFetch < 10000) {
        return;
      }

      this.loading = true;
      this.fetchPromise = (async () => {
        try {
          const res = await axios.get('/api/notifications');
          this.notifications = res.data;
          this.lastFetch = Date.now();
        } catch (e) {
          console.error('Error fetching notifications:', e);
        } finally {
          this.loading = false;
          this.fetchPromise = null;
        }
      })();

      return this.fetchPromise;
    },
    
    async markAsRead(id) {
      const notification = this.notifications.find(n => n.id === id);
      if (notification && !notification.is_read) {
        notification.is_read = true;
        try {
          await axios.put(`/api/notifications/read/${id}`);
        } catch (e) {
          console.error('Error marking as read:', e);
          notification.is_read = false;
        }
      }
    },
    
    async markAllAsRead() {
      const unreadIds = this.notifications.filter(n => !n.is_read).map(n => n.id);
      if (unreadIds.length === 0) return;
      
      // Optimistic update
      this.notifications.forEach(n => n.is_read = true);
      
      try {
        await axios.put('/api/notifications/read-all');
      } catch (e) {
        console.error('Error marking all as read:', e);
        this.fetchNotifications(); // Rollback to server state
      }
    }
  }
});
