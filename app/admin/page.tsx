// app/admin/page.tsx
'use client'

import Link from 'next/link'
import {
  FileText, FolderKanban, Eye, TrendingUp,
  Clock, Star, Briefcase, ArrowRight,
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
      sub:   data ? `${data.totalPublishedPosts} published · ${data.draftPosts} drafts` : '',
      href:  '/admin/blogs',
    },
    {
      label: 'Projects',
      icon: FolderKanban,
      value: data?.totalProjects ?? 0,
      sub: "showcase projects",
      //sub:   data ? `${data.draftProjects} drafts` : '',
      href:  '/admin/projects',
    },
    // {
    //   label: 'Skills',
    //   icon: Star,
    //   value: data?.totalSkills ?? 0,
    //   sub:   'Technical & soft skills',
    //   href:  '/admin/skills',
    // },
    // {
    //   label: 'Experiences',
    //   icon: Briefcase,
    //   value: data?.totalExperiences ?? 0,
    //   sub:   'Work history',
    //   href:  '/admin/experiences',
    // },
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

      {/* Top Viewed + Recent Posts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Viewed */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top Viewed Posts</CardTitle>
                <CardDescription>Most popular articles</CardDescription>
              </div>
              {/* <Link href="/admin/blogs" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                View all <ArrowRight size={14} />
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
                {data?.topViewedPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between gap-2">
                    <Link
                      href={`/admin/blogs/${post.id}`}
                      className="text-sm font-medium hover:underline line-clamp-1 flex-1"
                    >
                      {post.title}
                    </Link>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Eye size={12} /> {post.viewCount}
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

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>Latest updated projects</CardDescription>
              </div>
              <Link href="/admin/projects" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
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
                {data?.recentProjects.map((proj) => (
                  <div key={proj.id} className="flex items-center justify-between gap-2">
                    <Link
                      href={`/admin/projects/${proj.id}`}
                      className="text-sm font-medium hover:underline line-clamp-1 flex-1"
                    >
                      {proj.title}
                    </Link>
                    <div className="flex items-center gap-2 shrink-0">
                      {proj.isFeatured && (
                        <TrendingUp size={12} className="text-accent" />
                      )}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(proj.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <Badge variant="secondary" className="text-xs">{proj.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { href: '/admin/blogs/new',     icon: FileText,    label: 'New Blog Post' },
              { href: '/admin/projects/new',  icon: FolderKanban, label: 'New Project' },
              { href: '/admin/media',         icon: Eye,         label: 'Upload Media' },
              { href: '/admin/profile',       icon: Star,        label: 'Edit Profile' },
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