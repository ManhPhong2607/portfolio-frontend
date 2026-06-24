// app/admin/blogs/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Plus, Search, MoreHorizontal, Eye, Edit,
  Trash2, Archive, Send, RotateCcw, Filter,
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
import type { BlogPostSummaryDto, PostStatus } from '@/types/api'

function StatusBadge({ status }: { status: string }) {
  if (status === 'Published')
    return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Published</Badge>
  if (status === 'Draft')
    return <Badge variant="secondary">Draft</Badge>
  return <Badge variant="outline">Archived</Badge>
}

export default function AdminPostsPage() {
  const qc = useQueryClient()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [deleteItem, setDeleteItem] = useState<BlogPostSummaryDto | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-posts', { page, status }],
    queryFn: () => adminService.getAdminPosts({
      page, limit: 20,
      status: status === 'all' ? undefined : status,
    }),
  })
  
  const filtered = (data?.items ?? []).filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase())

    if (status === 'all') {
      return matchesSearch && p.status !== 'Archived'
    } else {
      return matchesSearch && p.status === status
    }
  })
  // const filtered = (data?.items ?? []).filter(p =>
  //   p.title.toLowerCase().includes(search.toLowerCase())
  // )

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-posts'] })

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: PostStatus }) =>
      adminService.changePostStatus(id, status),
    onSuccess: () => {
      invalidate()
      toast.success('Đã cập nhật trạng thái bài viết.')
    },
    onError: () => {
      toast.error('Không thể cập nhật trạng thái.')
    },
  })
  const deleteMut = useMutation({
    mutationFn: adminService.deletePost,
    onSuccess: () => { invalidate(); toast.success('Đã xoá.'); setDeleteItem(null) },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog Posts</h1>
          <p className="text-muted-foreground">Manage your blog posts and articles</p>
        </div>
        <Button asChild>
          <Link href="/admin/blogs/new">
            <Plus className="mr-2 size-4" /> New Post
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
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
            <SelectItem value="Published">Published</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Read Time</TableHead>
              <TableHead>Published</TableHead>
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
                  No posts found.
                </TableCell>
              </TableRow>
            ) : filtered.map(post => (
              <TableRow key={post.id}>
                {/* Title */}
                <TableCell>
                  <div className="space-y-1">
                    {post.status === 'Published' ? (
                      <Link 
                        href={`/blog/${post.slug}`} 
                        target="_blank" 
                        className="font-semibold text-foreground hover:underline block truncate max-w-md transition-colors"
                      >
                        {post.title}
                      </Link>
                    ) : (
                      <span 
                        className={`block truncate max-w-md font-semibold ${
                          post.status === 'Archived' 
                            ? 'text-muted-foreground font-medium' 
                            : 'text-foreground'
                        }`}
                      >
                        {post.title}
                      </span>
                    )}
                    
                    <div className="flex flex-wrap gap-1">
                      {post.tags.slice(0, 3).map(tag => (
                        <Badge 
                          key={tag.id} 
                          variant="outline" 
                          className={`text-xs ${post.status === 'Archived' ? 'opacity-50' : ''}`}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TableCell>

                <TableCell><StatusBadge status={post.status} /></TableCell>

                <TableCell className="text-muted-foreground">
                  {post.viewCount.toLocaleString()}
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {post.readingTimeMinutes} min
                </TableCell>

                <TableCell className="text-muted-foreground text-sm">
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : <span className="text-muted-foreground/50">—</span>
                  }
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
                      {post.status === 'Published' && (
                        <DropdownMenuItem asChild>
                          <Link href={`/blog/${post.slug}`} target="_blank">
                            <Eye className="mr-2 size-4" /> View
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/blogs/${post.id}`}>
                          <Edit className="mr-2 size-4" /> Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {post.status === 'Draft' && (
                        <DropdownMenuItem
                          onClick={() =>
                            statusMut.mutate({
                              id: post.id,
                              status: 'Published',
                            })
                          }
                        >
                          <Send className="mr-2 size-4" />
                          Publish
                        </DropdownMenuItem>
                      )}

                      {post.status === 'Published' && (
                        <>
                          <DropdownMenuItem
                            onClick={() =>
                              statusMut.mutate({
                                id: post.id,
                                status: 'Draft',
                              })
                            }
                          >
                            <RotateCcw className="mr-2 size-4" />
                            Move to Draft
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() =>
                              statusMut.mutate({
                                id: post.id,
                                status: 'Archived',
                              })
                            }
                          >
                            <Archive className="mr-2 size-4" />
                            Archive
                          </DropdownMenuItem>
                        </>
                      )}

                      {post.status === 'Archived' && (
                        <DropdownMenuItem
                          onClick={() =>
                            statusMut.mutate({
                              id: post.id,
                              status: 'Draft',
                            })
                          }
                        >
                          <RotateCcw className="mr-2 size-4" />
                          Restore
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={(e) => e.preventDefault()}
                        onClick={() => setDeleteItem(post)}
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

