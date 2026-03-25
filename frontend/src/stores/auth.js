import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
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
        console.error('Signup failed:', error);
        throw error;
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
        console.error('Login failed:', error);
        throw error;
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
      if (this.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
      }
    }
  },
})
