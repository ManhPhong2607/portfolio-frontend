// app/admin/media/page.tsx
'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/adminService'
import { Upload, Trash2, Copy, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import type { MediaFileDto } from '@/types/api'

const FOLDERS = [
  { value: 'all',      label: 'All' },
  { value: 'blog',     label: 'Blog' },
  { value: 'projects', label: 'Projects' },
  { value: 'avatar',   label: 'Avatar' },
  { value: 'cv',       label: 'CV' },
  { value: 'general',  label: 'General' },
]

function formatBytes(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}

export default function AdminMediaPage() {
  const qc      = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [folder, setFolder]     = useState('all')
  const [uploading, setUploading] = useState(false)
  const [deleteItem, setDeleteItem] = useState<MediaFileDto | null>(null)

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['admin-media', folder],
    queryFn: () => adminService.getMediaFiles(folder === 'all' ? undefined : folder),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-media'] })

  const deleteMut = useMutation({
    mutationFn: ({ id, force }: { id: string; force: boolean }) =>
      adminService.deleteMedia(id, force),
    onSuccess: (_, { force }) => {
      invalidate()
      toast.success(force ? 'Đã xoá (force).' : 'Đã xoá.')
      setDeleteItem(null)
    },
    onError: () => toast.error('Có lỗi khi xoá.'),
  })

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const uploadFolder = folder === 'all' ? 'general' : folder
      await adminService.uploadMedia(file, uploadFolder)
      invalidate()
      toast.success('Upload thành công!')
    } catch {
      toast.error('Upload thất bại.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('Đã copy URL!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-muted-foreground text-sm">{files.length} files</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
            className="hidden"
            onChange={handleUpload}
          />
          <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Upload size={16} className="mr-2" />
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </div>

      {/* Filter */}
      <Select value={folder} onValueChange={setFolder}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FOLDERS.map(f => (
            <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="aspect-square bg-secondary rounded-lg animate-pulse" />
          ))}
        </div>
      ) : files.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ImageIcon size={40} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No files yet. Upload your first file!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {files.map((file) => (
            <div key={file.id} className="group relative">
              <div className="relative aspect-square bg-secondary rounded-lg overflow-hidden border border-border">
                {file.resourceType === 'image' ? (
                  <Image
                    src={file.secureUrl}
                    alt={file.originalFilename ?? ''}
                    fill className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                    <ImageIcon size={24} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">PDF</span>
                  </div>
                )}

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <Button
                    size="sm" variant="secondary"
                    onClick={() => copyUrl(file.secureUrl)}
                  >
                    <Copy size={14} className="mr-1" /> Copy URL
                  </Button>
                  <Button
                    size="sm" variant="destructive"
                    onClick={() => setDeleteItem(file)}
                  >
                    <Trash2 size={14} className="mr-1" /> Delete
                  </Button>
                </div>
              </div>

              {/* File info */}
              <div className="mt-1.5 px-0.5">
                <p className="text-xs text-foreground truncate">
                  {file.originalFilename ?? 'untitled'}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Badge variant="secondary" className="text-[10px] px-1 py-0">
                    {file.folder ?? 'general'}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {formatBytes(file.sizeBytes)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá file?</AlertDialogTitle>
            <AlertDialogDescription>
              File sẽ bị xoá khỏi Cloudinary. Nếu đang được dùng, chọn &quot;Force Delete&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <Button
              variant="outline"
              onClick={() => deleteItem && deleteMut.mutate({ id: deleteItem.id, force: false })}
            >
              Delete
            </Button>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteItem && deleteMut.mutate({ id: deleteItem.id, force: true })}
            >
              Force Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}