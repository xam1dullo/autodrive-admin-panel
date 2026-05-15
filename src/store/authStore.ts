import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/user';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  /** Active company a dev user is currently viewing-as. Empty string = cross-company view. */
  activeCompanyId: string;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  setActiveCompanyId: (id: string) => void;
  isOwner: () => boolean;
  isDev: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      activeCompanyId: '',
      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false, activeCompanyId: '' }),
      setActiveCompanyId: (id) => set({ activeCompanyId: id }),
      isOwner: () => get().user?.role === 'owner',
      isDev: () => get().user?.role === 'dev',
    }),
    {
      name: 'autodrive-auth',
      // token is NOT persisted — it lives in memory only.
      // Session is maintained via httpOnly cookie; Bearer is kept for
      // in-session requests where the in-memory token is still available.
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        activeCompanyId: state.activeCompanyId,
      }),
    }
  )
);
