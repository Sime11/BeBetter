import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false
  }),

  getters: {
    getUser: (state) => state.user,
    getToken: (state) => state.token,
    isLoggedIn: (state) => state.isAuthenticated
  },

  actions: {
    async login(email, password) {
      try {
        const response = await api.post('/api/login', { email, password });
        this.user = response.data.user;
        this.token = response.data.token;
        this.isAuthenticated = true;
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        Notify.create({
          type: 'positive',
          message: 'Uspješna prijava!'
        });
        return true;
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.error || 'Greška pri prijavi'
        });
        return false;
      }
    },

    async register(ime, prezime, email, password) {
      try {
        await api.post('/api/register', { ime, prezime, email, password });
        Notify.create({
          type: 'positive',
          message: 'Uspješna registracija! Možete se prijaviti.'
        });
        return true;
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.error || 'Greška pri registraciji'
        });
        return false;
      }
    },

    async updateProfile(userData) {
      try {
        const response = await api.put('/api/profile', userData);
        if (userData.username || userData.email) {
          this.user = { ...this.user, ...userData };
          localStorage.setItem('user', JSON.stringify(this.user));
        }
        Notify.create({
          type: 'positive',
          message: 'Profil uspješno ažuriran!'
        });
        return true;
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.error || 'Greška pri ažuriranju profila'
        });
        return false;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
    },

    initializeAuth() {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
          const user = JSON.parse(userStr);
          if (user && typeof user === 'object') {
            this.token = token;
            this.user = user;
            this.isAuthenticated = true;
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          } else {
            this.logout(); // Ako su podaci neispravni, odjavi korisnika
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        this.logout(); // U slučaju greške, odjavi korisnika
      }
    }
  }
});
