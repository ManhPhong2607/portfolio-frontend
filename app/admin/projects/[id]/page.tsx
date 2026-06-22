// app/admin/projects/[id]/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { adminService } from '@/services/adminService'
import { ProjectEditor } from '@/components/admin/project-editor'

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-project', id],
    queryFn: () => adminService.getAdminProjectById(id),
  })

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <div className="h-8 w-48 bg-secondary rounded animate-pulse" />
        <div className="h-64 bg-secondary rounded animate-pulse" />
      </div>
    )
  }

  return <ProjectEditor mode="edit" project={data} />
}