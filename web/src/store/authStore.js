// Credit Book — Auth Store (Zustand)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      login: (user, tokens) => {
        localStorage.setItem('cb_access_token', tokens.accessToken);
        localStorage.setItem('cb_refresh_token', tokens.refreshToken);
        set({ user, accessToken: tokens.accessToken, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('cb_access_token');
        localStorage.removeItem('cb_refresh_token');
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      setToken: (token) => {
        localStorage.setItem('cb_access_token', token);
        set({ accessToken: token });
      },
    }),
    {
      name: 'creditbook-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;
