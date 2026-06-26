// app/offline/page.tsx
'use client'

import { WifiOff, RotateCw, Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <WifiOff size={40} className="mx-auto text-muted-foreground mb-4" />
        <h1 className="text-xl font-medium text-foreground mb-2">
          You&apos;re offline
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          Check your internet connection and try again.
        </p>

        <div className="flex flex-col gap-3">
          {/* Thử lại CHÍNH trang đang định vào — không phải trang offline.
              Vì khi SW trả Response thay thế cho navigate request,
              địa chỉ URL trên thanh address bar vẫn giữ đúng route
              user đang cố vào ban đầu — nên reload() sẽ thử lại
              ĐÚNG trang đó, không bị mắc kẹt ở "/offline". */}
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-md text-sm font-medium"
          >
            <RotateCw size={16} />
            Try again
          </button>

          {/* Lối thoát an toàn — trang chủ luôn có sẵn trong cache
              từ lúc Service Worker install, nên chắc chắn vào được
              dù vẫn đang offline. */}
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-border text-foreground rounded-md text-sm font-medium hover:bg-secondary transition-colors"
          >
            <Home size={16} />
            Go to homepage
          </Link>

          {/* Quan trọng nhất cho bản PWA cài standalone (không có nút back
              của browser) — đi lùi lại trang trước đó, thường đã có sẵn
              trong bộ nhớ/lịch sử trình duyệt nên không cần mạng. */}
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Go back
          </button>
        </div>
      </div>
    </main>
  )
}