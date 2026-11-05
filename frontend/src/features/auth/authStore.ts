import { create } from 'zustand';
import type { User } from '../../api/types';

interface AuthState {
  user: User | null;
  status: 'unknown' | 'authed' | 'guest';
  setUser(u: User): void;
  reset(): void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'unknown',
  setUser: (user) => set({ user, status: 'authed' }),
  reset: () => set({ user: null, status: 'guest' }),
}));
