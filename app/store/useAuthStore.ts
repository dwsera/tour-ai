import { create } from "zustand";

type AuthStore = {
  isLoggedIn: boolean;
  user: null | { id: string; name: string; email: string };
  login: (userData: { id: string; name: string; email: string }) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
};

export const useAuthStore = create<AuthStore>((set) => ({
  isLoggedIn: false,
  user: null,

  login: (userData) => set({ isLoggedIn: true, user: userData }),

  logout: () => {
    localStorage.removeItem("auth-token");
    set({ isLoggedIn: false, user: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem("auth-token");

    if (!token) {
      set({ isLoggedIn: false, user: null });
      return false;
    }

    try {
      const response = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Unauthorized");

      const userData = await response.json();
      set({ isLoggedIn: true, user: userData });
      return true;
    } catch (error) {
      set({ isLoggedIn: false, user: null });
      return false;
    }
  },
}));
