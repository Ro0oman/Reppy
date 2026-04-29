import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: (!import.meta.env.SSR && JSON.parse(localStorage.getItem('user'))) || null,
    token: (!import.meta.env.SSR && localStorage.getItem('token')) || null,
    interceptorRegistered: false,
    lastFetch: 0,
    fetchPromise: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: { 
    async signup(data) {
      try {
        const response = await axios.post('/api/auth/signup', data);
        this.token = response.data.token;
        this.user = response.data.user;
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        localStorage.setItem('reppy_last_visit', Date.now().toString());
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        return this.user;
      } catch (error) {
        const errorCode = error.response?.data?.code || 'ERR_SERVER';
        console.error('Signup failed:', errorCode);
        throw new Error(errorCode);
      }
    },
    async login(data) {
      try {
        const response = await axios.post('/api/auth/login', data);
        this.token = response.data.token;
        this.user = response.data.user;
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        localStorage.setItem('reppy_last_visit', Date.now().toString());
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        return this.user;
      } catch (error) {
        const errorCode = error.response?.data?.code || 'ERR_SERVER';
        console.error('Login failed:', errorCode);
        throw new Error(errorCode);
      }
    },
    async loginWithGoogle(googleToken) {
      try {
        const response = await axios.post('/api/auth/google', {
          token: googleToken,
        });
        
        this.token = response.data.token;
        this.user = response.data.user;
        
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        localStorage.setItem('reppy_last_visit', Date.now().toString());
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        return this.user;
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },
    async fetchProfile(force = false) {
      // 1. If already fetching, return the existing promise
      if (this.fetchPromise) return this.fetchPromise;

      const now = Date.now();
      if (!force && this.lastFetch && now - this.lastFetch < 10000) {
        return this.user;
      }

      this.fetchPromise = (async () => {
        try {
          const response = await axios.get('/api/users/me');
          this.lastFetch = Date.now();
          const oldLevel = this.user?.current_level;
          this.user = response.data;
          localStorage.setItem('user', JSON.stringify(this.user));
          
          if (oldLevel && this.user.current_level > oldLevel) {
            const { useAudioStore } = await import('./audio');
            const audioStore = useAudioStore();
            audioStore.play('level_up');
          }
          
          return this.user;
        } catch (error) {
          console.error('Fetch profile failed:', error);
          throw error;
        } finally {
          this.fetchPromise = null;
        }
      })();

      return this.fetchPromise;
    },
    async updateProfile(data) {
      try {
        const response = await axios.patch('/api/users/profile', data);
        this.user = response.data;
        localStorage.setItem('user', JSON.stringify(this.user));
        return this.user;
      } catch (error) {
        console.error('Update profile failed:', error);
        throw error;
      }
    },
    async updateAvatar(avatarUrl) {
      try {
        const response = await axios.patch('/api/users/avatar', { avatar_url: avatarUrl });
        this.user = response.data;
        localStorage.setItem('user', JSON.stringify(this.user));
        return this.user;
      } catch (error) {
        console.error('Update avatar failed:', error);
        throw error;
      }
    },
    async deleteAccount() {
      try {
        await axios.delete('/api/users/me');
        this.logout();
      } catch (error) {
        console.error('Delete account failed:', error);
        throw error;
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      if (!import.meta.env.SSR) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      delete axios.defaults.headers.common['Authorization'];
    },
    init() {
      if (import.meta.env.SSR) return;

      // 1. Check for stale session (> 30 days) to avoid cached component errors
      const lastVisit = localStorage.getItem('reppy_last_visit');
      const now = Date.now();
      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

      if (lastVisit && this.token) {
        const diff = now - parseInt(lastVisit);
        if (diff > THIRTY_DAYS) {
          console.warn('[AUTH_STORE] Stale session detected (>30d). Forcing logout and refresh...');
          this.logout();
          window.location.reload(); 
          return;
        }
      }

      // Update visit timestamp
      localStorage.setItem('reppy_last_visit', now.toString());

      // Setup global 401 interceptor if not already set
      if (!this.interceptorRegistered) {
        axios.interceptors.response.use(
          (response) => response,
          (error) => {
            const url = error.config?.url || '';
            // Shop routes use 4xx for business logic (insufficient gems, item restrictions, etc.)
            // Only trigger logout for auth/profile endpoints, not shop/social/etc.
            const isShopOrBusinessRoute = url.includes('/api/shop') || url.includes('/api/social') || url.includes('/api/blog') || url.includes('/api/missions');
            if (!isShopOrBusinessRoute && error.response?.status === 401) {
              console.warn('Session expired. Logging out...');
              this.logout();
              if (!import.meta.env.SSR) window.location.reload();
            }
            return Promise.reject(error);
          }
        );
        this.interceptorRegistered = true;
      }

      if (this.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        // Verify session silently. Use .catch() to ignore 401 as it's handled by interceptor
        this.fetchProfile().catch(() => {});
      }
    }
  },
})
