// store/authStore.ts
import { create } from 'zustand'
import Cookies from 'js-cookie'

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
     Cookies.set('accessToken', accessToken, { expires: 15 / 1440, path: '/' })
    // Refresh token sống 7 ngày
    Cookies.set('refreshToken', refreshToken, { expires: 7, path: '/' })
    // document.cookie = `accessToken=${accessToken}; path=/; max-age=${60 * 15}; SameSite=Lax`
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
      Cookies.remove('accessToken', { path: '/' })
      Cookies.remove('refreshToken', { path: '/' })
      set({ accessToken: null, isAuthenticated: false })
    }
  },

  initFromStorage: () => {
    if (typeof window !== 'undefined') {
    
      const accessToken = Cookies.get('accessToken')
      const refreshToken = Cookies.get('refreshToken')
   
    // Nếu còn 1 trong 2 thì vẫn tính là auth (để vào trong Axios sẽ tự lo vụ refresh)
      const isAuth = !!accessToken || !!refreshToken

      set({
        accessToken: accessToken || localStorage.getItem('accessToken'),
        isAuthenticated: isAuth,
        isLoading: false,
      })
    } else {
      set({ isLoading: false })
    }
  },
}))