// Credit Book — Settings Store (Zustand)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useSettingsStore = create(
  persist(
    (set) => ({
      darkMode: null, // null = system, true = dark, false = light

      setDarkMode: (value) => {
        set({ darkMode: value });
        const root = document.documentElement;
        if (value === true) root.setAttribute('data-theme', 'dark');
        else if (value === false) root.setAttribute('data-theme', 'light');
        else root.removeAttribute('data-theme');
      },

      applyTheme: (darkMode) => {
        const root = document.documentElement;
        if (darkMode === true) root.setAttribute('data-theme', 'dark');
        else if (darkMode === false) root.setAttribute('data-theme', 'light');
        else root.removeAttribute('data-theme');
      },
    }),
    {
      name: 'creditbook-settings',
    }
  )
);

export default useSettingsStore;
