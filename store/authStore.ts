// store/authStore.ts
import { create } from 'zustand'

interface AuthState {
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean

  setTokens: (accessToken: string, refreshToken: string) => void
  logout: () => void
  initFromStorage: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)

     // Lưu vào cookie để middleware đọc được
    document.cookie = `accessToken=${accessToken}; path=/; max-age=${60 * 15}; SameSite=Lax`
    set({ accessToken, isAuthenticated: true })
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        // Gọi logout API để revoke token
        const { api } = await import('@/lib/api')
        await api.post('/api/auth/logout', { refreshToken })
      }
    } catch {
      // Bỏ qua lỗi khi logout
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')

      // Xoá cookie
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      set({ accessToken: null, isAuthenticated: false })
    }
  },

  initFromStorage: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')
    //    if (token) {
    //   document.cookie = `accessToken=${token}; path=/; max-age=${60 * 15}; SameSite=Lax`
    // }
      set({
        accessToken: token,
        isAuthenticated: !!token,
        isLoading: false,
      })
    } else {
      set({ isLoading: false })
    }
  },
}))