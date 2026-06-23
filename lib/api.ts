// // lib/api.ts
import axios, { AxiosError } from 'axios'
import Cookies from 'js-cookie' // 🌟 1. Import js-cookie vào đây

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://localhost:7186'

// ── Instance chính ────────────────────────────────────────────────────────
export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor — tự gắn Bearer token ─────────────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = Cookies.get('token') || localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// ── Response interceptor — tự refresh khi 401 ────────────────────────────
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error)
    else p.resolve(token!)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean
    }

    // Chỉ xử lý 401, và không retry endpoint /auth/
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers!.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refreshToken')

      if (!refreshToken) {
        // Không có refresh token → Xóa sạch cả localStorage lẫn Cookie và về Login
        localStorage.clear()
        Cookies.remove('token') //  2. Xóa cookie khi không có refresh token
        window.location.href = '/admin/login'
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, {
          refreshToken,
        })

        // Lưu vào localStorage phục vụ Client logic
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)

        //  3. QUAN TRỌNG: Cập nhật Access Token mới vào Cookie cho Middleware đọc
        Cookies.set('token', data.accessToken, { expires: 7 })

        processQueue(null, data.accessToken)

        originalRequest.headers!.Authorization = `Bearer ${data.accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        
        // Refresh thất bại (Refresh Token hết hạn hẳn) ➔ Clear sạch sành sanh
        localStorage.clear()
        Cookies.remove('token') // 4. Xóa sạch Cookie để tránh treo Middleware
        window.location.href = '/admin/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// import axios, { AxiosError } from 'axios'

// const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://localhost:7186'

// // ── Instance chính ────────────────────────────────────────────────────────
// export const api = axios.create({
//   baseURL: BASE_URL,
//   headers: { 'Content-Type': 'application/json' },
// })

// // ── Request interceptor — tự gắn Bearer token ─────────────────────────────
// api.interceptors.request.use((config) => {
//   if (typeof window !== 'undefined') {
//     const token = localStorage.getItem('accessToken')
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`
//     }
//   }
//   return config
// })

// // ── Response interceptor — tự refresh khi 401 ────────────────────────────
// let isRefreshing = false
// let failedQueue: Array<{
//   resolve: (token: string) => void
//   reject: (err: unknown) => void
// }> = []

// const processQueue = (error: unknown, token: string | null = null) => {
//   failedQueue.forEach((p) => {
//     if (error) p.reject(error)
//     else p.resolve(token!)
//   })
//   failedQueue = []
// }

// api.interceptors.response.use(
//   (response) => response,
//   async (error: AxiosError) => {
//     const originalRequest = error.config as typeof error.config & {
//       _retry?: boolean
//     }

//     // Chỉ xử lý 401, và không retry endpoint /auth/
//     if (
//       error.response?.status === 401 &&
//       !originalRequest._retry &&
//       !originalRequest.url?.includes('/auth/')
//     ) {
//       if (isRefreshing) {
//         // Đang refresh rồi — queue request lại
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject })
//         })
//           .then((token) => {
//             originalRequest.headers!.Authorization = `Bearer ${token}`
//             return api(originalRequest)
//           })
//           .catch((err) => Promise.reject(err))
//       }

//       originalRequest._retry = true
//       isRefreshing = true

//       const refreshToken = localStorage.getItem('refreshToken')

//       if (!refreshToken) {
//         // Không có refresh token → redirect login
//         localStorage.clear()
//         window.location.href = '/admin/login'
//         return Promise.reject(error)
//       }

//       try {
//         const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, {
//           refreshToken,
//         })

//         localStorage.setItem('accessToken', data.accessToken)
//         localStorage.setItem('refreshToken', data.refreshToken)

//         processQueue(null, data.accessToken)

//         originalRequest.headers!.Authorization = `Bearer ${data.accessToken}`
//         return api(originalRequest)
//       } catch (refreshError) {
//         processQueue(refreshError, null)
//         localStorage.clear()
//         window.location.href = '/admin/login'
//         return Promise.reject(refreshError)
//       } finally {
//         isRefreshing = false
//       }
//     }

//     return Promise.reject(error)
//   }
// )