// app/admin/login/page.tsx
// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter, useSearchParams } from 'next/navigation'
// import { Eye, EyeOff, LogIn } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import {
//   Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
// } from '@/components/ui/card'
// import { authService } from '@/services/authService'
// import { useAuthStore } from '@/store/authStore'
// import Link from 'next/link'
// import { toast } from 'sonner'

// export default function LoginPage() {
//   const router = useRouter()
//   const params = useSearchParams()
//   const from   = params.get('from') ?? '/admin'

//   const { setTokens, isAuthenticated, initFromStorage } = useAuthStore()

//   const [isLoading, setIsLoading]       = useState(false)
//   const [showPassword, setShowPassword] = useState(false)
//   const [error, setError]               = useState('')
//   const [form, setForm] = useState({ email: '', password: '' })

//   // ✅ Gọi initFromStorage để check nếu đã login rồi
//   useEffect(() => {
//     initFromStorage()
//   }, [initFromStorage])

//   // ✅ Nếu đã auth → redirect
//   useEffect(() => {
//     if (isAuthenticated) {
//       router.replace(from)
//     }
//   }, [isAuthenticated, from, router])

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError('')
//     setIsLoading(true)

//     try {
//       const result = await authService.login(form.email, form.password)
//       setTokens(result.accessToken, result.refreshToken)
//       toast.success('Đăng nhập thành công!')
//       router.replace(from)
//     } catch (err: unknown) {
//       const msg = (err as { response?: { data?: { detail?: string } } })
//         ?.response?.data?.detail ?? 'Email hoặc mật khẩu không đúng.'
//       setError(msg)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background p-4">
//       <Card className="w-full max-w-md">
//         <CardHeader className="text-center">
//           <div className="flex justify-center mb-4">
//             <div className="size-12 rounded-lg bg-accent text-accent-foreground font-bold text-xl flex items-center justify-center">
//               P
//             </div>
//           </div>
//           <CardTitle className="text-2xl">Welcome back</CardTitle>
//           <CardDescription>
//             Sign in to access your portfolio admin panel
//           </CardDescription>
//         </CardHeader>

//         <form onSubmit={handleSubmit}>
//           <CardContent className="space-y-4">
//             {error && (
//               <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
//                 {error}
//               </div>
//             )}

//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="admin@portfolio.com"
//                 value={form.email}
//                 onChange={(e) => setForm({ ...form, email: e.target.value })}
//                 required
//                 autoComplete="email"
//                 autoFocus
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <div className="relative">
//                 <Input
//                   id="password"
//                   type={showPassword ? 'text' : 'password'}
//                   placeholder="Enter your password"
//                   value={form.password}
//                   onChange={(e) => setForm({ ...form, password: e.target.value })}
//                   required
//                   autoComplete="current-password"
//                 />
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="icon"
//                   className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
//                   onClick={() => setShowPassword(!showPassword)}
//                 >
//                   {showPassword
//                     ? <EyeOff className="size-4 text-muted-foreground" />
//                     : <Eye className="size-4 text-muted-foreground" />
//                   }
//                 </Button>
//               </div>
//             </div>
//           </CardContent>

//           <CardFooter className="flex flex-col gap-4">
//             <Button
//               type="submit"
//               className="w-full"
//               disabled={isLoading || !form.email || !form.password}
//             >
//               {isLoading
//                 ? 'Signing in...'
//                 : <><LogIn className="mr-2 size-4" /> Sign In</>
//               }
//             </Button>
//             <Link
//               href="/"
//               className="text-xs text-center text-muted-foreground hover:text-foreground transition-colors"
//             >
//               ← Back to portfolio
//             </Link>
//           </CardFooter>
//         </form>
//       </Card>
//     </div>
//   )
// }


// app/admin/login/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from '@/components/ui/card'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'
import { toast } from 'sonner'

// 1. Tách toàn bộ logic và UI vào component con
function LoginContent() {
  const router = useRouter()
  const params = useSearchParams()
  const from   = params.get('from') ?? '/admin'

  const { setTokens, isAuthenticated, initFromStorage } = useAuthStore()

  const [isLoading, setIsLoading]       = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]               = useState('')
  const [form, setForm] = useState({ email: '', password: '' })

  // ✅ Gọi initFromStorage để check nếu đã login rồi
  useEffect(() => {
    initFromStorage()
  }, [initFromStorage])

  // ✅ Nếu đã auth → redirect
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(from)
    }
  }, [isAuthenticated, from, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await authService.login(form.email, form.password)
      setTokens(result.accessToken, result.refreshToken)
      toast.success('Đăng nhập thành công!')
      router.replace(from)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail ?? 'Email hoặc mật khẩu không đúng.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="size-12 rounded-lg bg-accent text-accent-foreground font-bold text-xl flex items-center justify-center">
              P
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to access your portfolio admin panel
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@portfolio.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword
                    ? <EyeOff className="size-4 text-muted-foreground" />
                    : <Eye className="size-4 text-muted-foreground" />
                  }
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !form.email || !form.password}
            >
              {isLoading
                ? 'Signing in...'
                : <><LogIn className="mr-2 size-4" /> Sign In</>
              }
            </Button>
            <Link
              href="/"
              className="text-xs text-center text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to portfolio
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

// 2. Component chính giờ chỉ làm nhiệm vụ bọc Suspense
export default function LoginPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="text-muted-foreground animate-pulse">Loading login form...</div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}

