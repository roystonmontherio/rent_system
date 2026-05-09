import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  account_no?: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  role: 'public_user' | 'owner' | 'broker';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      login: (user, token) => set({ user, token }),
      logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem('auth-storage');
      },
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'auth-storage',
    }
  )
);
