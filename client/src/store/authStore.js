import { create } from 'zustand';
import axios from 'axios';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('beezpell_user') || 'null'),
  token: localStorage.getItem('beezpell_token') || null,
  loading: false,
  error: null,

  // ── Google SSO ──
  loginWithGoogle: async (credential) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post('/api/auth/google', { credential });
      const { user, token, needsRoleChoice, needsOnboarding } = res.data;
      localStorage.setItem('beezpell_user', JSON.stringify(user));
      localStorage.setItem('beezpell_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      set({ user, token, loading: false });
      return { user, needsRoleChoice, needsOnboarding };
    } catch (err) {
      set({ loading: false, error: err.response?.data?.error || 'Login failed' });
      return null;
    }
  },

  // ── Choose Role (first-time after Google SSO) ──
  chooseRole: async (userId, role) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post('/api/auth/choose-role', { userId, role });
      const { user, token } = res.data;
      localStorage.setItem('beezpell_user', JSON.stringify(user));
      localStorage.setItem('beezpell_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      set({ user, token, loading: false });
      return { user };
    } catch (err) {
      set({ loading: false, error: err.response?.data?.error || 'Failed to set role' });
      return null;
    }
  },

  // ── Learner Login (Classroom Code + Name + PIN) ──
  loginLearner: async (classCode, name, pin) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post('/api/auth/learner-login', { class_code: classCode, name, pin });
      const { user, token, classroom, guideName } = res.data;
      localStorage.setItem('beezpell_user', JSON.stringify(user));
      localStorage.setItem('beezpell_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      set({ user, token, loading: false });
      return { user, classroom, guideName };
    } catch (err) {
      set({ loading: false, error: err.response?.data?.error || 'Login failed' });
      return null;
    }
  },

  // ── Guide Onboarding ──
  onboardGuide: async (schoolName, classroomName, grade) => {
    set({ loading: true, error: null });
    try {
      const userId = get().user?.id;
      const res = await axios.post('/api/auth/onboard-guide', { userId, schoolName, classroomName, grade });
      const { user, token, classroom } = res.data;
      localStorage.setItem('beezpell_user', JSON.stringify(user));
      localStorage.setItem('beezpell_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      set({ user, token, loading: false });
      return { success: true, classCode: classroom.class_code, classroom };
    } catch (err) {
      set({ loading: false, error: err.response?.data?.error || 'Onboarding failed' });
      return { success: false };
    }
  },

  // ── Demo login (username + password for admin/testing) ──
  loginDemo: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post('/api/auth/login', { username, password });
      const { user, token } = res.data;
      localStorage.setItem('beezpell_user', JSON.stringify(user));
      localStorage.setItem('beezpell_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      set({ user, token, loading: false });
      return { user };
    } catch (err) {
      set({ loading: false, error: err.response?.data?.error || 'Login failed' });
      return null;
    }
  },

  // ── Check auth on page load ──
  checkAuth: () => {
    const token = localStorage.getItem('beezpell_token');
    const user = JSON.parse(localStorage.getItem('beezpell_user') || 'null');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    set({ token, user });
  },

  // ── Logout ──
  logout: () => {
    localStorage.removeItem('beezpell_user');
    localStorage.removeItem('beezpell_token');
    delete axios.defaults.headers.common['Authorization'];
    set({ user: null, token: null });
  },
}));
