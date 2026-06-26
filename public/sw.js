// public/sw.js
const CACHE_VERSION = 'v4'
const SHELL_CACHE = `portfolio-shell-${CACHE_VERSION}`

const SHELL_ASSETS = ['/', '/manifest.json', '/offline', '/icons/icon-192.png',
    '/icons/icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== SHELL_CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return // chỉ xử lý GET, POST/PATCH/DELETE luôn đi thẳng network

  const url = new URL(request.url)

  // Loại trừ HOÀN TOÀN mọi thứ liên quan Admin (UI + API) và Auth API.
  // Đây là sửa quan trọng nhất — bản trước thiếu "/api/admin" nên bị lọt,
  // khiến dữ liệu nhạy cảm (tin nhắn, draft bài viết...) bị lưu vào Cache Storage.
  if (
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/api/admin') ||
    url.pathname.startsWith('/api/auth')
  ) {
    return
  }

  // Navigate (load cả trang) hoặc API public — chiến lược Network-First
  if (request.mode === 'navigate' || url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          const cache = await caches.open(SHELL_CACHE)
          cache.put(request, response.clone())
          return response
        })
        .catch(async () => {
          const cached = await caches.match(request)
          if (cached) return cached

          // Chỉ navigate (load trang) mới fallback về /offline.
          // Không áp dụng cho API — nếu API public fail và không có cache,
          // để request đó tự fail, FE đã có xử lý loading/error state riêng.
          if (request.mode === 'navigate') {
            return caches.match('/offline')
          }

          return new Response(null, { status: 503, statusText: 'Offline' })
        })
    )
    return
  }

  // Static assets (JS/CSS/ảnh/font) — chiến lược Cache-First
  event.respondWith(
    caches.match(request).then(async (cached) => {
      if (cached) return cached
      try {
        const response = await fetch(request)
        if (
          request.url.includes('/_next/static/') ||
          request.destination === 'image' ||
          request.destination === 'font' ||
          request.destination === 'style' ||
          request.destination === 'script'
        ) {
          const cache = await caches.open(SHELL_CACHE)
          cache.put(request, response.clone())
        }
        return response
      } catch {
        // KHÔNG fallback về /offline ở đây — sai content-type sẽ làm hỏng trang.
        // Để fetch tự fail, browser xử lý lỗi sub-resource theo cách riêng của nó.
        return Response.error()
      }
    })
  )
})