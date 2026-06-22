// app/admin/settings/page.tsx
'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { Eye, EyeOff, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

type PassForm = {
  oldPassword:        string
  newPassword:        string
  confirmNewPassword: string
}

const EMPTY: PassForm = {
  oldPassword: '', newPassword: '', confirmNewPassword: '',
}

export default function SettingsPage() {
  const router  = useRouter()
  const logout  = useAuthStore(s => s.logout)

  const [form, setForm] = useState<PassForm>(EMPTY)
  const [show, setShow] = useState({
    old: false, new: false, confirm: false,
  })

  const changeMut = useMutation({
    mutationFn: () => authService.changePassword(
      form.oldPassword,
      form.newPassword,
      form.confirmNewPassword
    ),
    onSuccess: async () => {
      toast.success('Đã đổi mật khẩu! Vui lòng đăng nhập lại.')
      setForm(EMPTY)
      // Đổi mật khẩu → revoke tất cả tokens → logout
      await logout()
      router.replace('/admin/login')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail ?? 'Có lỗi xảy ra.'
      toast.error(msg)
    },
  })

  // Validate client-side
  const isValid = form.oldPassword.length >= 6
    && form.newPassword.length >= 6
    && form.newPassword === form.confirmNewPassword
    && form.newPassword !== form.oldPassword

  const getPasswordError = () => {
    if (form.newPassword && form.newPassword.length < 6)
      return 'Mật khẩu mới phải ít nhất 6 ký tự.'
    if (form.newPassword && form.newPassword === form.oldPassword)
      return 'Mật khẩu mới không được trùng mật khẩu cũ.'
    if (form.confirmNewPassword && form.confirmNewPassword !== form.newPassword)
      return 'Xác nhận mật khẩu không khớp.'
    return null
  }

  const passwordError = getPasswordError()

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">Quản lý tài khoản của bạn</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Change Password</CardTitle>
          <CardDescription>
            Sau khi đổi mật khẩu bạn sẽ được đăng xuất và cần đăng nhập lại.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Old password */}
          <div className="space-y-2">
            <Label>Current Password</Label>
            <div className="relative">
              <Input
                type={show.old ? 'text' : 'password'}
                value={form.oldPassword}
                onChange={e => setForm(f => ({ ...f, oldPassword: e.target.value }))}
                placeholder="Enter current password"
              />
              <Button
                type="button" variant="ghost" size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShow(s => ({ ...s, old: !s.old }))}
              >
                {show.old
                  ? <EyeOff className="size-4 text-muted-foreground" />
                  : <Eye className="size-4 text-muted-foreground" />
                }
              </Button>
            </div>
          </div>

          {/* New password */}
          <div className="space-y-2">
            <Label>New Password</Label>
            <div className="relative">
              <Input
                type={show.new ? 'text' : 'password'}
                value={form.newPassword}
                onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
                placeholder="Enter new password (min 6 chars)"
              />
              <Button
                type="button" variant="ghost" size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShow(s => ({ ...s, new: !s.new }))}
              >
                {show.new
                  ? <EyeOff className="size-4 text-muted-foreground" />
                  : <Eye className="size-4 text-muted-foreground" />
                }
              </Button>
            </div>
          </div>

          {/* Confirm password */}
          <div className="space-y-2">
            <Label>Confirm New Password</Label>
            <div className="relative">
              <Input
                type={show.confirm ? 'text' : 'password'}
                value={form.confirmNewPassword}
                onChange={e => setForm(f => ({ ...f, confirmNewPassword: e.target.value }))}
                placeholder="Confirm new password"
              />
              <Button
                type="button" variant="ghost" size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
              >
                {show.confirm
                  ? <EyeOff className="size-4 text-muted-foreground" />
                  : <Eye className="size-4 text-muted-foreground" />
                }
              </Button>
            </div>
          </div>

          {/* Error message */}
          {passwordError && (
            <p className="text-sm text-destructive">{passwordError}</p>
          )}

          <Button
            onClick={() => changeMut.mutate()}
            disabled={changeMut.isPending || !isValid}
            className="w-full"
          >
            <Save size={15} className="mr-2" />
            {changeMut.isPending ? 'Saving...' : 'Change Password'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}