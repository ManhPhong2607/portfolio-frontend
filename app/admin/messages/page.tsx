"use client"

import { useState } from "react"
import { 
  Search, 
  MoreHorizontal, 
  Mail, 
  Trash2, 
  Archive,
  MailOpen,
  Clock,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"

// Mock data
const messages = [
  {
    id: "1",
    senderName: "John Doe",
    senderEmail: "john.doe@example.com",
    subject: "Project Inquiry - E-commerce Platform",
    body: "Hi, I saw your portfolio and I'm impressed with your work on the e-commerce platform. I'm looking for a developer to help build a similar solution for my business. Would you be interested in discussing this further?\n\nBest regards,\nJohn",
    status: "unread",
    sentAt: "2024-01-16T14:30:00Z",
    readAt: null,
  },
  {
    id: "2",
    senderName: "Jane Smith",
    senderEmail: "jane.smith@startup.io",
    subject: "Collaboration Request",
    body: "Hello!\n\nI'm the founder of a tech startup and we're looking for skilled developers to join our team. Your experience with ASP.NET Core and React caught my attention.\n\nWould you be open to a brief call to discuss potential collaboration opportunities?\n\nThanks,\nJane",
    status: "unread",
    sentAt: "2024-01-15T09:15:00Z",
    readAt: null,
  },
  {
    id: "3",
    senderName: "Mike Johnson",
    senderEmail: "mike.j@gmail.com",
    subject: "Question about your blog post",
    body: "Hey!\n\nI just read your article about Clean Architecture with ASP.NET Core. Great content! I have a question about the repository pattern implementation you mentioned.\n\nCould you elaborate on how you handle transactions across multiple repositories?\n\nThanks for sharing your knowledge!",
    status: "read",
    sentAt: "2024-01-14T18:45:00Z",
    readAt: "2024-01-14T20:00:00Z",
  },
  {
    id: "4",
    senderName: "Sarah Wilson",
    senderEmail: "sarah.wilson@agency.com",
    subject: "Freelance Opportunity",
    body: "Hi there,\n\nWe're a digital agency looking for freelance developers for upcoming projects. Based on your portfolio, you seem like a great fit.\n\nOur current project involves building a dashboard application with React and TypeScript.\n\nInterested in learning more?\n\nBest,\nSarah",
    status: "read",
    sentAt: "2024-01-12T11:20:00Z",
    readAt: "2024-01-12T14:30:00Z",
  },
  {
    id: "5",
    senderName: "Alex Chen",
    senderEmail: "alex.chen@university.edu",
    subject: "Speaking at Tech Conference",
    body: "Dear Developer,\n\nI'm organizing a tech conference at our university and would love to invite you as a speaker. Your expertise in modern web development would be valuable for our students.\n\nThe event is scheduled for next month. Would you be interested?\n\nRegards,\nAlex Chen\nStudent Tech Club President",
    status: "archived",
    sentAt: "2024-01-08T16:00:00Z",
    readAt: "2024-01-09T10:00:00Z",
  },
]

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedMessage, setSelectedMessage] = useState<typeof messages[0] | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const filteredMessages = messages.filter((message) => {
    const matchesSearch = 
      message.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.senderEmail.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || message.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const unreadCount = messages.filter(m => m.status === "unread").length

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    } else if (diffDays === 1) {
      return "Yesterday"
    } else if (diffDays < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" })
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const handleViewMessage = (message: typeof messages[0]) => {
    setSelectedMessage(message)
    setDetailsDialogOpen(true)
    // TODO: Mark as read via API
  }

  const handleDelete = (message: typeof messages[0]) => {
    setSelectedMessage(message)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    console.log("Deleting message:", selectedMessage?.id)
    setDeleteDialogOpen(false)
    setSelectedMessage(null)
  }

  const handleMarkAsRead = (message: typeof messages[0]) => {
    console.log("Marking as read:", message.id)
  }

  const handleArchive = (message: typeof messages[0]) => {
    console.log("Archiving message:", message.id)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "unread":
        return <Badge className="bg-accent/10 text-accent">Unread</Badge>
      case "read":
        return <Badge variant="secondary">Read</Badge>
      case "archived":
        return <Badge variant="outline">Archived</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 
              ? `You have ${unreadCount} unread message${unreadCount > 1 ? "s" : ""}`
              : "All caught up! No unread messages."
            }
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <Filter className="mr-2 size-4" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Messages</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Messages Table */}
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">From</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[100px]">Date</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMessages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No messages found.
                </TableCell>
              </TableRow>
            ) : (
              filteredMessages.map((message) => (
                <TableRow 
                  key={message.id}
                  className={message.status === "unread" ? "bg-accent/5" : ""}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {message.status === "unread" && (
                        <span className="size-2 rounded-full bg-accent flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className={`truncate ${message.status === "unread" ? "font-semibold" : "font-medium"}`}>
                          {message.senderName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {message.senderEmail}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <button 
                      onClick={() => handleViewMessage(message)}
                      className={`text-left hover:underline truncate block max-w-md ${
                        message.status === "unread" ? "font-semibold" : ""
                      }`}
                    >
                      {message.subject}
                    </button>
                  </TableCell>
                  <TableCell>{getStatusBadge(message.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(message.sentAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewMessage(message)}>
                          <Mail className="mr-2 size-4" />
                          View Message
                        </DropdownMenuItem>
                        {message.status === "unread" && (
                          <DropdownMenuItem onClick={() => handleMarkAsRead(message)}>
                            <MailOpen className="mr-2 size-4" />
                            Mark as Read
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleArchive(message)}>
                          <Archive className="mr-2 size-4" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDelete(message)}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Message Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject}</DialogTitle>
            <DialogDescription>
              From {selectedMessage?.senderName} ({selectedMessage?.senderEmail})
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="size-4" />
                  {new Date(selectedMessage.sentAt).toLocaleString()}
                </span>
                {getStatusBadge(selectedMessage.status)}
              </div>
              <Separator />
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {selectedMessage.body}
              </div>
              <Separator />
              <div className="flex items-center gap-2">
                <Button variant="outline" asChild>
                  <a href={`mailto:${selectedMessage.senderEmail}?subject=Re: ${selectedMessage.subject}`}>
                    <Mail className="mr-2 size-4" />
                    Reply via Email
                  </a>
                </Button>
                <Button variant="outline" onClick={() => handleArchive(selectedMessage)}>
                  <Archive className="mr-2 size-4" />
                  Archive
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this message from {selectedMessage?.senderName}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
