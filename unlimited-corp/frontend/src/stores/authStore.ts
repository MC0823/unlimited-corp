import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, TokenPair } from '@/types'

interface AuthState {
  user: User | null
  token: TokenPair | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  setToken: (token: TokenPair) => void
  login: (user: User, token: TokenPair) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      setUser: (user) => set({ user }),
      
      setToken: (token) => set({ token }),
      
      login: (user, token) => set({
        user,
        token,
        isAuthenticated: true,
      }),
      
      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
      }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
