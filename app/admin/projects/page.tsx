// app/admin/projects/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Plus, Search, MoreHorizontal, Eye, Edit, Trash2,
  GripVertical, ExternalLink, Github, Star, Filter,
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/adminService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
  DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import type { ProjectStatus, ProjectSummaryDto } from '@/types/api'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Completed: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
    InProgress: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
    Draft: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
    Archived: '',
  }
  return (
    <Badge className={map[status] ?? ''} variant={status === 'Archived' ? 'outline' : 'default'}>
      {status === 'InProgress' ? 'In Progress' : status}
    </Badge>
  )
}

export default function AdminProjectsPage() {
  const qc = useQueryClient()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [deleteItem, setDeleteItem] = useState<ProjectSummaryDto | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-projects', { page, status }],
    queryFn: () => adminService.getAdminProjects({
      page, limit: 20,
      status: status === 'all' ? undefined : status,
    }),
  })

  // Client-side search filter
  const filtered = (data?.items ?? []).filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-projects'] })

  const changeStatusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProjectStatus }) =>
      adminService.changeProjectStatus(id, status),
    onSuccess: () => { invalidate(); toast.success('Đã cập nhật trạng thái.') },
    onError: () => toast.error('Có lỗi xảy ra.'),
  })

  const toggleFeaturedMut = useMutation({
    mutationFn: adminService.toggleFeatured,
    onSuccess: () => { invalidate(); toast.success('Đã cập nhật.') },
  })

  const deleteMut = useMutation({
    mutationFn: adminService.deleteProject,
    onSuccess: () => { invalidate(); toast.success('Đã xoá project.'); setDeleteItem(null) },
    onError: () => toast.error('Có lỗi xảy ra.'),
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage your portfolio projects</p>
        </div>
        <Button asChild>
          <Link href="/admin/projects/new">
            <Plus className="mr-2 size-4" /> New Project
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={v => { setStatus(v); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="mr-2 size-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="InProgress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]" />
              <TableHead className="w-[35%]">Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Technologies</TableHead>
              <TableHead>Links</TableHead>
              <TableHead className="w-[70px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <div className="h-8 bg-secondary rounded animate-pulse" />
                  </TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No projects found.
                </TableCell>
              </TableRow>
            ) : filtered.map(project => (
              <TableRow key={project.id}>
                {/* Drag handle */}
                <TableCell>
                  <Button variant="ghost" size="icon" className="size-8 cursor-grab">
                    <GripVertical className="size-4 text-muted-foreground" />
                  </Button>
                </TableCell>

                {/* Title */}
                <TableCell>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="font-medium hover:underline"
                      >
                        {project.title}
                      </Link>
                      {project.isFeatured && (
                        <Star className="size-4 text-accent fill-accent" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">/{project.slug}</p>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <StatusBadge status={project.status} />
                </TableCell>

                {/* Technologies */}
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.slice(0, 3).map(t => (
                      <Badge key={t.id} variant="outline" className="text-xs">{t.name}</Badge>
                    ))}
                    {project.technologies.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.technologies.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>

                {/* Links */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    {project.demoUrl && (
                      <a href={project.demoUrl} target="_blank" rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground">
                        <ExternalLink className="size-4" />
                      </a>
                    )}
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground">
                        <Github className="size-4" />
                      </a>
                    )}
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {project.status !== 'Draft' && project.status !== 'Archived' && (
                        <DropdownMenuItem asChild>
                          <Link href={`/projects/${project.slug}`} target="_blank">
                            <Eye className="mr-2 size-4" /> View
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/projects/${project.id}`}>
                          <Edit className="mr-2 size-4" /> Edit
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => toggleFeaturedMut.mutate(project.id)}
                      >
                        <Star className="mr-2 size-4" />
                        {project.isFeatured ? 'Unfeature' : 'Feature'}
                      </DropdownMenuItem>

                      {/* Change status submenu */}
                      <DropdownMenuSeparator />

                      {(['Draft', 'InProgress', 'Completed', 'Archived'] as ProjectStatus[])
                        .filter(s => s !== project.status)
                        .map(s => (
                          <DropdownMenuItem
                            key={s}
                            onClick={() =>
                              changeStatusMut.mutate({
                                id: project.id,
                                status: s,
                              })
                            }
                          >
                            {s === 'InProgress' ? 'Mark In Progress' : `Mark ${s}`}
                          </DropdownMenuItem>
                        ))}
                      {/* <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          Change Status
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          {['Draft', 'InProgress', 'Completed', 'Archived'].map(s => (
                            <DropdownMenuItem
                              key={s}
                              disabled={project.status === s}
                              onClick={() => changeStatusMut.mutate({ id: project.id, status: s as ProjectStatus })}
                            >
                              {s === 'InProgress' ? 'In Progress' : s}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub> */}

                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteItem(project)}
                      >
                        <Trash2 className="mr-2 size-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deleteItem?.title}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteItem && deleteMut.mutate(deleteItem.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}