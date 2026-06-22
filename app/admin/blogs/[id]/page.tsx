// app/admin/posts/[id]/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { adminService } from '@/services/adminService'
import { PostEditor } from '@/components/admin/post-editor'

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-post', id],
    queryFn: () => adminService.getAdminPostById(id),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 bg-secondary rounded animate-pulse" />
        <div className="h-64 bg-secondary rounded animate-pulse" />
      </div>
    )
  }

  return <PostEditor mode="edit" post={data} />
}