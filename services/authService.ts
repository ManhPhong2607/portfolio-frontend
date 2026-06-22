// services/authService.ts
import { api } from '@/lib/api'
import type { LoginResult } from '@/types/api'

export const authService = {
  login: async (email: string, password: string): Promise<LoginResult> => {
    const { data } = await api.post<LoginResult>('/api/auth/login', { email, password })
    return data
  },

  logout: async (refreshToken: string) => {
    await api.post('/api/auth/logout', { refreshToken })
  },

  refresh: async (refreshToken: string): Promise<LoginResult> => {
    const { data } = await api.post<LoginResult>('/api/auth/refresh', { refreshToken })
    return data
  },

  changePassword: async (oldPassword: string, newPassword: string, confirmNewPassword: string) => {
    await api.post('/api/auth/change-password', { oldPassword, newPassword, confirmNewPassword })
  },
}