// // app/admin/messages/page.tsx
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/adminService'
import {
  Search, Mail, MailOpen, Archive, ArchiveRestore,
  Trash2, MoreHorizontal, Eye, Clock
} from 'lucide-react'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import type { ContactMessageDto } from '@/types/api'

function StatusBadge({ status }: { status: string }) {
  if (status === 'Unread') return <Badge className="bg-yellow-600/20 text-yellow-500 hover:bg-yellow-600/30 border-none">Unread</Badge>
  if (status === 'Read') return <Badge variant="secondary">Read</Badge>
  return <Badge variant="outline">Archived</Badge>
}

const PAGE_SIZE = 20

export default function AdminMessagesPage() {
  const qc = useQueryClient()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [viewing, setViewing] = useState<ContactMessageDto | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-messages', { page, status }],
    queryFn: () => adminService.getMessages({
      page, limit: PAGE_SIZE, status: status === 'all' ? undefined : status,
    }),
  })

  const filtered = (data?.items ?? []).filter(m =>{
    // 1. Lọc theo từ khóa tìm kiếm trước
    const matchesSearch = 
      m.senderName.toLowerCase().includes(search.toLowerCase()) ||
      m.senderEmail.toLowerCase().includes(search.toLowerCase());

    // 2. Lọc theo trạng thái
    if (status === 'all') {
      // Nếu là "All", chỉ lấy Unread và Read (Ẩn Archived đi)
      return matchesSearch && m.status !== 'Archived';
    } else {
      // Nếu chọn đích danh Unread, Read, hoặc Archived thì khớp chính xác
      return matchesSearch && m.status === status;
    }
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-messages'] })

  const markReadMut = useMutation({
    mutationFn: adminService.markMessageRead,
    onSuccess: () => {
      invalidate()
      // Cập nhật luôn state viewing nếu modal đang mở để UI đổi ngay sang Read
      if (viewing && viewing.status === 'Unread') {
        setViewing({ ...viewing, status: 'Read' })
      }
    },
    onError: () => toast.error('Có lỗi xảy ra.'),
  })

  const archiveMut = useMutation({
    mutationFn: adminService.archiveMessage,
    onSuccess: () => {
      invalidate()
      toast.success('Archived.')
      if (viewing) setViewing({ ...viewing, status: 'Archived' })
    },
    onError: () => toast.error('Có lỗi xảy ra.'),
  })

  const unarchiveMut = useMutation({
    mutationFn: adminService.unarchiveMessage,
    onSuccess: () => {
      invalidate()
      toast.success('Unarchived.')
      if (viewing) setViewing({ ...viewing, status: 'Read' })
    },
    onError: () => toast.error('Có lỗi xảy ra.'),
  })

  const deleteMut = useMutation({
    mutationFn: adminService.deleteMessage,
    onSuccess: () => {
      invalidate()
      toast.success('Deleted.')
      setViewing(null)
    },
  })

  const openMessage = (msg: ContactMessageDto) => {
    setViewing(msg)
    if (msg.status === 'Unread') markReadMut.mutate(msg.id)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">You have {filtered.filter(m => m.status === 'Unread').length} unread messages</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={v => { setStatus(v); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Messages</SelectItem>
            <SelectItem value="Unread">Unread</SelectItem>
            <SelectItem value="Read">Read</SelectItem>
            <SelectItem value="Archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]" />
              <TableHead>From</TableHead>
              <TableHead className="w-[40%]">Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[70px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}><div className="h-8 bg-secondary rounded animate-pulse" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No messages yet.
                </TableCell>
              </TableRow>
            ) : filtered.map(msg => (
              <TableRow key={msg.id}>
                <TableCell>
                  {msg.status === 'Unread'
                    ? <Mail className="size-4 text-yellow-500" />
                    : <MailOpen className="size-4 text-muted-foreground" />}
                </TableCell>
                <TableCell>
                  <div className={msg.status === 'Unread' ? 'font-medium' : ''}>{msg.senderName}</div>
                  <div className="text-xs text-muted-foreground">{msg.senderEmail}</div>
                </TableCell>
                {/* Đã thêm sự kiện onClick và style hover cho Subject */}
                <TableCell
                  className={`truncate max-w-md cursor-pointer hover:underline transition-colors ${msg.status === 'Unread'
                      ? 'font-semibold text-foreground'
                      : 'font-medium text-foreground/90'
                    }`}
                  // className={`truncate max-w-md cursor-pointer hover:underline hover:text-foreground transition-colors ${msg.status === 'Unread' ? 'font-medium text-foreground' : 'text-muted-foreground'}`}
                  onClick={() => openMessage(msg)}
                  title="Click to view message"
                >
                  {msg.subject || '(No subject)'}
                </TableCell>
                <TableCell><StatusBadge status={msg.status} /></TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(msg.sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openMessage(msg)}>
                        <Eye className="mr-2 size-4" /> View Message
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />

                      {msg.status === 'Unread' && (
                        <DropdownMenuItem onClick={() => markReadMut.mutate(msg.id)}>
                          <MailOpen className="mr-2 size-4" /> Mark as Read
                        </DropdownMenuItem>
                      )}

                      {msg.status !== 'Archived' && (
                        <DropdownMenuItem onClick={() => archiveMut.mutate(msg.id)}>
                          <Archive className="mr-2 size-4" /> Archive
                        </DropdownMenuItem>
                      )}

                      {msg.status === 'Archived' && (
                        <DropdownMenuItem onClick={() => unarchiveMut.mutate(msg.id)}>
                          <ArchiveRestore className="mr-2 size-4" /> Unarchive
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => deleteMut.mutate(msg.id)}
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

      <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl pb-2">{viewing?.subject || 'Message'}</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  From <span className="font-medium text-foreground">{viewing.senderName}</span> ({viewing.senderEmail})
                </p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-4" />
                    {new Date(viewing.sentAt).toLocaleString('en-US', {
                      dateStyle: 'short',
                      timeStyle: 'medium'
                    })}
                  </div>
                  <StatusBadge status={viewing.status} />
                </div>
              </div>

              <div className="text-sm text-foreground whitespace-pre-wrap pt-2">
                {viewing.body}
              </div>

              <div className="flex gap-3 pt-6">
                {/* <Button variant="outline" asChild>
                  <a href={`mailto:${viewing.senderEmail}`}>
                    <Mail className="mr-2 size-4" /> Reply via Email
                  </a>
                </Button> */}
                <Button variant="outline" asChild>
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${viewing.senderEmail}&su=${encodeURIComponent(
                      `Re: ${viewing.subject ?? ""}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Mail className="mr-2 size-4" />
                    Reply via Email
                  </a>
                </Button>

                {viewing.status !== 'Archived' ? (
                  <Button
                    variant="outline"
                    onClick={() => archiveMut.mutate(viewing.id)}
                  >
                    <Archive className="mr-2 size-4" /> Archive
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => unarchiveMut.mutate(viewing.id)}
                  >
                    <ArchiveRestore className="mr-2 size-4" /> Unarchive
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

