// app/admin/page.tsx
'use client'

import Link from 'next/link'
import {
  FileText, FolderKanban, Eye, TrendingUp,
  Clock, Star, Briefcase, ArrowRight, Mail,
  MailOpen
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { adminService } from '@/services/adminService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: adminService.getDashboard,
  })

  const stats = [
    {
      label: 'Blog Posts',
      icon: FileText,
      value: data ? data.totalPublishedPosts + data.draftPosts : 0,
      sub: data ? `${data.totalPublishedPosts} published · ${data.draftPosts} drafts` : '',
      href: '/admin/blogs',
    },
    {
      label: 'Projects',
      icon: FolderKanban,
      value: data?.totalProjects ?? 0,
      sub: "showcase projects",
      //sub:   data ? `${data.draftProjects} drafts` : '',
      href: '/admin/projects',
    },
    {
      label: 'Total Views',
      icon: Eye,
      value: data?.totalViews ?? 0,
      sub: "all blog posts",
      href: '/admin/blogs',
    },
    {
      label: 'Unread Messages',
      icon: Mail,
      value: data?.totalUnreadMessages ?? 0,
      sub: "Awaiting your reply",
      href: '/admin/messages',
      highlight: (data?.totalUnreadMessages ?? 0) > 0,
    }

  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your portfolio.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="hover:border-accent/50 transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                  <Icon className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-8 w-16 bg-secondary rounded animate-pulse" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Recent Posts + Recent Messages */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Blog Posts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Posts</CardTitle>
                <CardDescription>Latest updated blog posts</CardDescription>
              </div>
              <Link href="/admin/blogs" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
              {/* <Link href="/admin/blogs/new" className="text-sm text-accent hover:underline flex items-center gap-1">
              + New post
            </Link> */}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-8 bg-secondary rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {data?.recentPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between gap-2">
                    <Link
                      href={`/admin/blogs/${post.id}`}
                      className="text-sm font-medium hover:underline line-clamp-1 flex-1"
                    >
                      {post.title}
                    </Link>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <Badge variant={post.status === 'Published' ? 'default' : 'secondary'} className="text-xs">
                        {post.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* recent messages */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Messages</CardTitle>
                <CardDescription>Latest contact form submissions</CardDescription>
              </div>
              <Link href="/admin/messages" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 bg-secondary rounded animate-pulse" />
                ))}
              </div>
            ) : data?.recentMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No messages yet.</p>
            ) : (
              <div className="space-y-3">
                {data?.recentMessages.map((msg) => (
                  <Link
                    key={msg.id}
                    href="/admin/messages"
                    className="flex items-center justify-between gap-2 group"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {msg.status === 'Unread'
                        ? <Mail size={14} className="text-accent shrink-0" />
                        : <MailOpen size={14} className="text-muted-foreground shrink-0" />
                      }
                      <span className={`text-sm line-clamp-1 group-hover:underline ${msg.status === 'Unread' ? 'font-medium' : ''
                        }`}>
                        {msg.senderName}
                        {msg.subject && (
                          <span className="text-muted-foreground"> — {msg.subject}</span>
                        )}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(msg.sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>


      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { href: '/admin/blogs/new', icon: FileText, label: 'New Blog Post' },
              { href: '/admin/projects/new', icon: FolderKanban, label: 'New Project' },
              { href: '/admin/media', icon: Eye, label: 'Upload Media' },
              { href: '/admin/profile', icon: Star, label: 'Edit Profile' },
            ].map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm hover:bg-secondary transition-colors"
                >
                  <Icon className="size-4 text-muted-foreground" />
                  <span>{action.label}</span>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}