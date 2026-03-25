import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    interceptorRegistered: false,
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
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        return this.user;
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },
    async fetchProfile() {
      try {
        const response = await axios.get('/api/users/me');
        this.user = response.data;
        localStorage.setItem('user', JSON.stringify(this.user));
        return this.user;
      } catch (error) {
        console.error('Fetch profile failed:', error);
      }
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
    },
    init() {
      // Setup global 401 interceptor if not already set
      if (!this.interceptorRegistered) {
        axios.interceptors.response.use(
          (response) => response,
          (error) => {
            if (error.response?.status === 401) {
              console.warn('Session expired or unauthorized. Logging out...');
              this.logout();
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
