import { defineStore } from 'pinia';
import axios from 'axios';

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    loading: false
  }),
  
  getters: {
    unreadCount: (state) => state.notifications.filter(n => !n.is_read).length
  },
  
  actions: {
    async fetchNotifications() {
      this.loading = true;
      try {
        const res = await axios.get('/api/notifications');
        this.notifications = res.data;
      } catch (e) {
        console.error('Error fetching notifications:', e);
      } finally {
        this.loading = false;
      }
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
