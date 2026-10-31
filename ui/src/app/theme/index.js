import { create } from "zustand";

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem("orange-theme");

  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  return prefersDark ? "dark" : "light";
};

const applyTheme = (theme) => {
  const root = document.documentElement;

  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  localStorage.setItem("orange-theme", theme);
};

const initialTheme = getInitialTheme();

applyTheme(initialTheme);

export const useThemeStore = create((set) => ({
  theme: initialTheme,

  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },

  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === "light" ? "dark" : "light";

      applyTheme(nextTheme);

      return {
        theme: nextTheme,
      };
    }),
}));
