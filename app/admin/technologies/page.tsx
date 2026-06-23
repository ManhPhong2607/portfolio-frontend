// app/admin/technologies/page.tsx
'use client'

import { useState } from 'react'
import { Plus, Search, MoreHorizontal, Edit, Trash2, Cpu } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/adminService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import type { TechnologyDto } from '@/types/api'

type TechForm = { name: string; iconUrl: string }
const EMPTY: TechForm = { name: '', iconUrl: '' }

export default function AdminTechnologiesPage() {
  const qc = useQueryClient()

  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<TechnologyDto | null>(null)
  const [deleteItem, setDeleteItem] = useState<TechnologyDto | null>(null)
  const [form, setForm] = useState<TechForm>(EMPTY)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  const { data: technologies = [], isLoading } = useQuery({
    queryKey: ['admin-technologies'],
    queryFn: adminService.getAdminTechnologies,
  })

  const filtered = technologies.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-technologies'] })

  const saveMut = useMutation({
    mutationFn: () => {
      const payload = { name: form.name, iconUrl: form.iconUrl || undefined }
      return editing
        ? adminService.updateTechnology(editing.id, payload)
        : adminService.createTechnology(payload)
    },
    onSuccess: () => { invalidate(); toast.success(editing ? 'Updated.' : 'Created.'); setOpen(false) },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail ?? 'Error occurred.'
      toast.error(msg)
    },
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => adminService.deleteTechnology(id, false),
    onSuccess: () => { invalidate(); toast.success('Deleted.'); setDeleteItem(null) },
    onError: () => toast.error('Technology is in use.'),
  })

  const forceDeleteMut = useMutation({
    mutationFn: (id: string) => adminService.deleteTechnology(id, true),
    onSuccess: () => { invalidate(); toast.success('Force deleted.'); setDeleteItem(null) },
  })

  const openCreate = () => { setEditing(null); setForm(EMPTY); setOpen(true) }
  const openEdit = (t: TechnologyDto) => {
    setEditing(t); setForm({ name: t.name, iconUrl: t.iconUrl ?? '' }); setOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Technologies</h1>
          <p className="text-muted-foreground">Manage tech stack used in your projects</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" /> Add Technology
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search technologies..."
          value={search}
          onChange={e => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60%]">Name</TableHead>
              <TableHead>Projects</TableHead>
              <TableHead className="w-[70px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={2}>
                    <div className="h-8 bg-secondary rounded animate-pulse" />
                  </TableCell>
                </TableRow>
              ))
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                  No technologies found.
                </TableCell>
              </TableRow>
            ) : paginated.map(tech => (
              <TableRow key={tech.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-md bg-secondary">
                      <Cpu className="size-4 text-muted-foreground" />
                    </div>
                    <span className="font-medium">{tech.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{tech.projectCount} projects</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onSelect={(e) => e.preventDefault()}
                        onClick={() => openEdit(tech)}>
                        <Edit className="mr-2 size-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={(e) => e.preventDefault()}
                        onClick={() => setDeleteItem(tech)}
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

       {/* Pagination */}
      {!isLoading && filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline" size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-2 py-1.5">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline" size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Technology' : 'Add Technology'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update technology details.' : 'Add a new technology for your projects.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="e.g., React, Docker, PostgreSQL"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending || !form.name.trim()}>
              {saveMut.isPending ? 'Saving...' : editing ? 'Save Changes' : 'Add Technology'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete &quot;{deleteItem?.name}&quot;? If used in projects, choose Force Delete.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button variant="outline" onClick={() => deleteItem && deleteMut.mutate(deleteItem.id)}>
              Delete
            </Button>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteItem && forceDeleteMut.mutate(deleteItem.id)}
            >
              Force Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}