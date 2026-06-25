// app/admin/profile/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/adminService'
import { publicService } from '@/services/publicService'
import { MediaPickerDialog } from '@/components/admin/media-picker-dialog'
import {
  Save, Image as ImageIcon, X, Plus,
  GripVertical, Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import type { MediaFileDto } from '@/types/api'

// ── Types ─────────────────────────────────────────────────────────────────
const PLATFORMS = [
  'github', 'twitter', 'facebook',
  'instagram', 'youtube', 'tiktok', 'email',
]

interface LocalSocialLink {
  id: string       // real id (from DB) hoặc temp id (new_xxx)
  platform: string
  label: string
  url: string
  isVisible: boolean
  displayOrder: number
  isNew: boolean      // chưa lưu lên server
  isDirty: boolean      // đã thay đổi so với server
  isDeleted: boolean      // đã xoá (ẩn khỏi UI, chờ save)
}

type ProfileForm = {
  fullName: string; tagline: string; bio: string
  location: string; contactEmail: string
}

// ── Helpers ──────────────────────────────────────────────────────────────
let tempIdCounter = 0
const newTempId = () => `new_${++tempIdCounter}`

// ── Main Component ────────────────────────────────────────────────────────
export default function AdminProfilePage() {
  const qc = useQueryClient()

  // ── Profile form state ──────────────────────────────────────────────
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    fullName: '', tagline: '', bio: '', location: '', contactEmail: '',
  })

  // ── Social links local state ────────────────────────────────────────
  const [links, setLinks] = useState<LocalSocialLink[]>([])

  // ── Media picker state ──────────────────────────────────────────────
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false)
  const [cvPickerOpen, setCvPickerOpen] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [cvPreview, setCvPreview] = useState<{
    url: string; name: string; size: string
  } | null>(null)

  // track mediaId để gán khi save
  const [pendingAvatarId, setPendingAvatarId] = useState<string | null | undefined>(undefined)
  const [pendingCvId, setPendingCvId] = useState<string | null | undefined>(undefined)

  // ── Fetch ───────────────────────────────────────────────────────────
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['about'],
    queryFn: publicService.getAbout,
  })

  const { data: serverLinks, isLoading: linksLoading } = useQuery({
    queryKey: ['admin-social-links'],
    queryFn: adminService.getAdminSocialLinks,
  })

  function getCvName(url: string) {
    const file = url.split('/').pop() ?? 'CV.pdf'

    return file.replace(/_[a-z0-9]{5,}\.pdf$/i, '.pdf')
  }

  const EMPTY_MEDIA_ID = '00000000-0000-0000-0000-000000000000'

  // Sync profile form
  useEffect(() => {
    if (profile) {
      setProfileForm({
        fullName: profile.fullName,
        tagline: profile.tagline ?? '',
        bio: profile.bio ?? '',
        location: profile.location ?? '',
        contactEmail: profile.contactEmail ?? '',
      })
      setAvatarPreview(profile.avatarUrl ?? null)
      setCvPreview(profile.cvUrl
        ? { url: profile.cvUrl, name: getCvName(profile.cvUrl), size: '' }
        : null
      )
    }
  }, [profile])

  // Sync social links từ server → local state

  useEffect(() => {
    if (!serverLinks) return
    if (links.some(l => l.isNew || l.isDirty || l.isDeleted)) return // không overwrite nếu có thay đổi chưa save
    setLinks(
      serverLinks.map(l => ({
        id: l.id,
        platform: l.platform,
        label: l.label ?? '',
        url: l.url,
        isVisible: l.isVisible,
        displayOrder: l.displayOrder,
        isNew: false,
        isDirty: false,
        isDeleted: false,
      }))
    )
  }, [serverLinks])

  // ── Invalidate ──────────────────────────────────────────────────────
  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ['about'] })
    qc.invalidateQueries({ queryKey: ['admin-social-links'] })
    qc.invalidateQueries({ queryKey: ['social-links'] })
  }

  // ── Save All ────────────────────────────────────────────────────────
  const saveMut = useMutation({
    mutationFn: async () => {
      // 1. Save profile info + pending avatar/cv
      const aboutPayload: Record<string, unknown> = {
        fullName: profileForm.fullName,
        tagline: profileForm.tagline || undefined,
        bio: profileForm.bio || undefined,
        location: profileForm.location || undefined,
        contactEmail: profileForm.contactEmail || undefined,
      }
      if (pendingAvatarId !== undefined) {
        aboutPayload.avatarMediaId = pendingAvatarId === null
          ? EMPTY_MEDIA_ID
          : pendingAvatarId
      }
      if (pendingCvId !== undefined) {
        aboutPayload.cvMediaId = pendingCvId === null
          ? EMPTY_MEDIA_ID
          : pendingCvId
      }

      // if (pendingAvatarId !== undefined) aboutPayload.avatarMediaId = pendingAvatarId
      // if (pendingCvId !== undefined) aboutPayload.cvMediaId = pendingCvId

      await adminService.updateAbout(aboutPayload as Parameters<typeof adminService.updateAbout>[0])

      // 2. Process social links changes
      const active = links.filter(l => !l.isDeleted)

      for (const link of links) {
        if (link.isDeleted && !link.isNew) {
          // Xoá link đã tồn tại
          await adminService.deleteSocialLink(link.id)
        } else if (link.isNew && !link.isDeleted && link.url.trim()) {
          // Tạo link mới
          await adminService.createSocialLink({
            platform: link.platform,
            url: link.url.trim(),
            label: link.label.trim() || undefined,
            isVisible: true,
          })
        } else if (!link.isNew && link.isDirty && !link.isDeleted) {
          // Cập nhật link đã thay đổi
          await adminService.updateSocialLink(link.id, {
            url: link.url.trim(),
            label: link.label.trim() || undefined,
            isVisible: link.isVisible,
          })
        }
      }

      // 3. Sync visibility nếu đã toggle
      // (toggle đã gọi API realtime — xem handleToggle bên dưới)
    },
    onSuccess: () => {
      invalidateAll()
      setPendingAvatarId(undefined)
      setPendingCvId(undefined)
      toast.success('Profile saved successfully.')
    },
    onError: () => toast.error('Error saving profile.'),
  })

  // ── Avatar handlers ─────────────────────────────────────────────────
  const handleSelectAvatar = (media: MediaFileDto) => {
    setAvatarPreview(media.secureUrl)
    setPendingAvatarId(media.id)
    toast.success('Avatar selected. Click "Save Changes" to apply.')
  }

  const handleRemoveAvatar = () => {
    setAvatarPreview(null)
    setPendingAvatarId(null) // null = xoá
    toast.info('Avatar removed. Click "Save Changes" to apply.')
  }

  // ── CV handlers ─────────────────────────────────────────────────────
  const handleSelectCv = (media: MediaFileDto) => {

    setCvPreview({
      url: media.secureUrl,
      name: media.originalFilename!,
      size: media.sizeBytes
        ? `${(media.sizeBytes / 1024).toFixed(0)} KB`
        : '',
    })
    setPendingCvId(media.id)
    toast.success('CV selected. Click "Save Changes" to apply.')
  }

  const handleRemoveCv = () => {
    setCvPreview(null)
    setPendingCvId(null) // null = xoá
    toast.info('CV removed. Click "Save Changes" to apply.')
  }

  // ── Social link handlers ────────────────────────────────────────────
  const handleAddLink = () => {
    const newLink: LocalSocialLink = {
      id: newTempId(),
      platform: '',
      label: '',
      url: '',
      isVisible: true,
      displayOrder: links.length,
      isNew: true,
      isDirty: false,
      isDeleted: false,
    }
    setLinks(prev => [...prev, newLink])
  }

  const handleLinkChange = (
    id: string,
    field: keyof Pick<LocalSocialLink, 'platform' | 'label' | 'url'>,
    value: string
  ) => {
    setLinks(prev => prev.map(l =>
      l.id === id ? { ...l, [field]: value, isDirty: true } : l
    ))
  }

  // // Toggle visibility — gọi API ngay lập tức (không cần Save)
  // const handleToggle = async (id: string) => {
  //   const link = links.find(l => l.id === id)
  //   if (!link || link.isNew) {
  //     // Chỉ toggle local nếu link chưa có trên server
  //     setLinks(prev => prev.map(l =>
  //       l.id === id ? { ...l, isVisible: !l.isVisible } : l
  //     ))
  //     return
  //   }

  //   // Optimistic update
  //   setLinks(prev => prev.map(l =>
  //     l.id === id ? { ...l, isVisible: !l.isVisible } : l
  //   ))

  //   try {
  //     await adminService.toggleSocialLink(id)
  //     qc.invalidateQueries({ queryKey: ['admin-social-links'] })
  //     qc.invalidateQueries({ queryKey: ['social-links'] })
  //   } catch {
  //     // Rollback
  //     setLinks(prev => prev.map(l =>
  //       l.id === id ? { ...l, isVisible: !l.isVisible } : l
  //     ))
  //     toast.error('Error toggling visibility.')
  //   }
  // }

  // save xong gọi API
  const handleToggle = (id: string) => {
    setLinks(prev =>
      prev.map(link =>
        link.id === id
          ? {
            ...link,
            isVisible: !link.isVisible,
            isDirty: !link.isNew || link.isDirty,
          }
          : link
      )
    )
  }

  const handleDeleteLink = (id: string) => {
    const link = links.find(l => l.id === id)
    if (!link) return

    if (link.isNew) {
      // Link chưa lưu → xoá khỏi local state luôn
      setLinks(prev => prev.filter(l => l.id !== id))
    } else {
      // Link đã lưu → đánh dấu deleted, sẽ xoá khi Save
      setLinks(prev => prev.map(l =>
        l.id === id ? { ...l, isDeleted: true } : l
      ))
    }
  }

  const visibleLinks = links.filter(l => !l.isDeleted)
  const isLoading = profileLoading || linksLoading
  const hasPending = pendingAvatarId !== undefined || pendingCvId !== undefined

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-5xl">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 bg-secondary rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your public profile information</p>
        </div>
        <Button
          onClick={() => saveMut.mutate()}
          disabled={saveMut.isPending || !profileForm.fullName}
        >
          <Save size={15} className="mr-2" />
          {saveMut.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Left ────────────────────────────────────────────────── */}
        <div className="space-y-6 lg:col-span-2">

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>This information will be displayed on your portfolio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  placeholder="Your full name"
                  value={profileForm.fullName}
                  onChange={e => setProfileForm(f => ({ ...f, fullName: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Tagline</Label>
                <Input
                  placeholder="e.g. Full-Stack Developer | .NET & React"
                  value={profileForm.tagline}
                  onChange={e => setProfileForm(f => ({ ...f, tagline: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  A short description that appears below your name
                </p>
              </div>

              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  placeholder="Tell visitors about yourself..."
                  value={profileForm.bio}
                  onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))}
                  rows={5}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    placeholder="e.g. Hanoi, Vietnam"
                    value={profileForm.location}
                    onChange={e => setProfileForm(f => ({ ...f, location: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input
                    type="email"
                    placeholder="hello@example.com"
                    value={profileForm.contactEmail}
                    onChange={e => setProfileForm(f => ({ ...f, contactEmail: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Social Links</CardTitle>
                  <CardDescription>Links to your social profiles and websites</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleAddLink}>
                  <Plus size={15} className="mr-2" /> Add Link
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {visibleLinks.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    No social links added yet. Click &quot;Add Link&quot; to get started.
                  </p>
                ) : visibleLinks.map(link => (
                  <div key={link.id} className="flex items-center gap-3">
                    {/* Drag handle */}
                    <Button variant="ghost" size="icon" className="size-8 cursor-grab shrink-0">
                      <GripVertical size={15} className="text-muted-foreground" />
                    </Button>

                    {/* Platform Select */}
                    <Select
                      value={link.platform}
                      onValueChange={v => handleLinkChange(link.id, 'platform', v)}
                    >
                      <SelectTrigger className="w-[130px] shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORMS.map(p => (
                          <SelectItem key={p} value={p} className="capitalize">
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Label */}
                    <Input
                      placeholder="Label (optional)"
                      value={link.label}
                      onChange={e => handleLinkChange(link.id, 'label', e.target.value)}
                      className="w-36 shrink-0"
                    />

                    {/* URL */}
                    <Input
                      placeholder="URL"
                      value={link.url}
                      onChange={e => handleLinkChange(link.id, 'url', e.target.value)}
                      className="flex-1"
                    />

                    {/* Visibility Switch */}
                    <Switch
                      checked={link.isVisible}
                      onCheckedChange={() => handleToggle(link.id)}
                      className="shrink-0"
                    />

                    {/* Delete */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:text-destructive shrink-0"
                      onClick={() => handleDeleteLink(link.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>

              {visibleLinks.length > 0 && (
                <p className="text-xs text-muted-foreground mt-4">
                  Thay đổi sẽ được lưu khi click &quot;Save Changes&quot;
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Right sidebar ────────────────────────────────────────── */}
        <div className="space-y-6">

          {/* Avatar */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
              <CardDescription>Your avatar displayed across the site</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Avatar className="size-32">
                <AvatarImage src={avatarPreview || undefined} alt={profileForm.fullName} />
                {/* <AvatarImage src={avatarPreview ?? ''} alt={profileForm.fullName} /> */}
                <AvatarFallback className="text-2xl">
                  {profileForm.fullName.split(' ').map(n => n[0]).join('') || 'A'}
                </AvatarFallback>
              </Avatar>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAvatarPickerOpen(true)}
                >
                  <ImageIcon size={14} className="mr-2" />
                  {avatarPreview ? 'Change' : 'Upload'}
                </Button>
                {avatarPreview && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveAvatar}
                  >
                    <X size={14} className="mr-2" />
                    Remove
                  </Button>
                )}
              </div>

              {pendingAvatarId !== undefined && (
                <p className="text-xs text-accent text-center">
                  ✓ Click &quot;Save Changes&quot; to apply
                </p>
              )}
            </CardContent>
          </Card>

          {/* CV */}
          <Card>
            <CardHeader>
              <CardTitle>Resume / CV</CardTitle>
              <CardDescription>
                PDF file for visitors to download
              </CardDescription>
            </CardHeader>

            <CardContent>
              {cvPreview ? (
                <div className="space-y-3">
                  {/* Click để xem CV */}
                  <a
                    href={cvPreview.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary border border-border hover:bg-secondary/80 transition-colors"
                  >
                    <div className="size-10 rounded bg-background flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-muted-foreground">
                        PDF
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {cvPreview.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {cvPreview.size || 'Click to preview'}
                      </p>
                    </div>
                  </a>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setCvPickerOpen(true)}
                    >
                      Replace
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleRemoveCv}
                    >
                      <X size={14} />
                    </Button>
                  </div>

                  {pendingCvId !== undefined && (
                    <p className="text-xs text-accent">
                      ✓ Click &quot;Save Changes&quot; to apply
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full h-24 flex-col gap-2"
                    onClick={() => setCvPickerOpen(true)}
                  >
                    <ImageIcon size={28} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Upload CV (PDF)
                    </span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        
          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>How your profile appears to visitors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-3">
                <Avatar className="size-16 mx-auto">
                  <AvatarImage src={avatarPreview || undefined} />
                  {/* <AvatarImage src={avatarPreview ?? ''} /> */}
                  <AvatarFallback>
                    {profileForm.fullName.split(' ').map(n => n[0]).join('') || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">
                    {profileForm.fullName || 'Your Name'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {profileForm.tagline || 'Your tagline'}
                  </p>
                </div>
                {profileForm.location && (
                  <p className="text-xs text-muted-foreground">{profileForm.location}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Avatar picker */}
      <MediaPickerDialog
        open={avatarPickerOpen}
        onClose={() => setAvatarPickerOpen(false)}
        onSelect={handleSelectAvatar}
        defaultFolder="avatar"
      />

      {/* CV picker — cần filter ra PDF */}
      <MediaPickerDialog
        open={cvPickerOpen}
        onClose={() => setCvPickerOpen(false)}
        onSelect={handleSelectCv}
        defaultFolder="cv"
        resourceType="raw"
      />
    </div>
  )
}