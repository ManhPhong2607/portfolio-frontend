// app/admin/tags/page.tsx
'use client'

import { useState } from 'react'
import { Plus, Search, MoreHorizontal, Edit, Trash2, Tag as TagIcon } from 'lucide-react'
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
import type { TagDto } from '@/types/api'

export default function AdminTagsPage() {
  const qc = useQueryClient()

  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<TagDto | null>(null)
  const [deleteItem, setDeleteItem] = useState<TagDto | null>(null)
  const [name, setName] = useState('')

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['admin-tags'],
    queryFn: adminService.getAdminTags,
  })

  const filtered = tags.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-tags'] })

  const saveMut = useMutation({
    mutationFn: () => editing
      ? adminService.updateTag(editing.id, name)
      : adminService.createTag(name),
    onSuccess: () => {
      invalidate()
      toast.success(editing ? 'Updated.' : 'Created.')
      setOpen(false)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail ?? 'Error occurred.'
      toast.error(msg)
    },
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => adminService.deleteTag(id, false),
    onSuccess: () => { invalidate(); toast.success('Deleted.'); setDeleteItem(null) },
    onError: () => toast.error('Tag is in use. Use force delete.'),
  })

  const forceDeleteMut = useMutation({
    mutationFn: (id: string) => adminService.deleteTag(id, true),
    onSuccess: () => { invalidate(); toast.success('Force deleted.'); setDeleteItem(null) },
  })

  const openCreate = () => { setEditing(null); setName(''); setOpen(true) }
  const openEdit = (t: TagDto) => { setEditing(t); setName(t.name); setOpen(true) }

  const previewSlug = (n: string) =>
    n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tags</h1>
          <p className="text-muted-foreground">Manage tags for your blog posts</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" /> Add Tag
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search tags..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Blogs</TableHead>
              <TableHead className="w-[70px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={3}>
                    <div className="h-8 bg-secondary rounded animate-pulse" />
                  </TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  No tags found.
                </TableCell>
              </TableRow>
            ) : filtered.map(tag => (
              <TableRow key={tag.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-md bg-secondary">
                      <TagIcon className="size-4 text-muted-foreground" />
                    </div>
                    <span className="font-medium">{tag.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-secondary px-2 py-1 rounded">{tag.slug}</code>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{tag.blogCount} blogs</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(tag)}>
                        <Edit className="mr-2 size-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteItem(tag)}
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

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Tag' : 'Add Tag'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update tag details.' : 'Add a new tag to use in blog posts.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="e.g., React, DevOps, Tutorial"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveMut.mutate()}
              />
            </div>
            {name && (
              <div className="space-y-1">
                <Label>Slug preview</Label>
                <code className="block text-xs bg-secondary px-2 py-1.5 rounded">
                  {previewSlug(name)}
                </code>
                <p className="text-xs text-muted-foreground">
                  URL: /blog?tag={previewSlug(name)}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending || !name.trim()}>
              {saveMut.isPending ? 'Saving...' : editing ? 'Save Changes' : 'Add Tag'}
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
              Delete &quot;{deleteItem?.name}&quot;? If used in posts, choose Force Delete.
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