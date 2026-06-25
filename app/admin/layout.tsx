// app/admin/layout.tsx
'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, FileText, FolderKanban, Wrench,
  Briefcase, Tag, Cpu, ImageIcon, User, Settings,
  LogOut, ChevronDown, ExternalLink,
  MessageSquare,
} from 'lucide-react'
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarTrigger, SidebarInset,
} from '@/components/ui/sidebar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/store/authStore'
import { useQuery } from '@tanstack/react-query'
import { publicService } from '@/services/publicService'
import { QueryProvider } from '@/components/providers/query-provider'
// ── Nav items ──────────────────────────────────────────────────────────────
const mainNav = [
  { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
]

const contentNav = [
  { title: 'Blog Posts',   href: '/admin/blogs',       icon: FileText },
  { title: 'Projects',     href: '/admin/projects',     icon: FolderKanban },
  { title: 'Skills',       href: '/admin/skills',       icon: Wrench },
  { title: 'Experiences',  href: '/admin/experiences',  icon: Briefcase },
  
]

const taxonomyNav = [
  { title: 'Tags',         href: '/admin/tags',         icon: Tag },
  { title: 'Technologies', href: '/admin/technologies', icon: Cpu },
]

const systemNav = [
  { title: 'Media Library', href: '/admin/media',    icon: ImageIcon },
  { title: 'Messages',     href: '/admin/messages',     icon: MessageSquare },
  { title: 'Profile',       href: '/admin/profile',  icon: User },
  { title: 'Settings',      href: '/admin/settings', icon: Settings },
]

// ── Sidebar component ──────────────────────────────────────────────────────
function AdminSidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const logout   = useAuthStore(s => s.logout)

  const { data: profile } = useQuery({
    queryKey: ['about'],
    queryFn: publicService.getAbout,
  })

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  const handleLogout = async () => {
    await logout()
    router.replace('/admin/login')
  }

  const NavGroup = ({ items }: { items: typeof mainNav }) => (
    <SidebarMenu>
      {items.map(item => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton asChild isActive={isActive(item.href)}>
            <Link href={item.href}>
              <item.icon className="size-4" />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )

  return (
    <Sidebar variant="inset" className="border-r border-sidebar-border">
      {/* Header */}
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground font-bold">
            P
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Portfolio Admin</span>
            <span className="text-xs text-muted-foreground">Management</span>
          </div>
        </div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        {/* Main */}
        <SidebarGroup>
          <SidebarGroupContent>
            <NavGroup items={mainNav} />
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="mx-2" />

        {/* Content */}
        <SidebarGroup>
          <SidebarGroupLabel>Content</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavGroup items={contentNav} />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Taxonomy */}
        <SidebarGroup>
          <SidebarGroupLabel>Taxonomy</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavGroup items={taxonomyNav} />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System */}
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavGroup items={systemNav} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer — User dropdown */}
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full">
                  <Avatar className="size-6">
                    <AvatarImage src={profile?.avatarUrl ?? ''} />
                    <AvatarFallback className="text-xs">
                      {profile?.fullName?.split(' ').map(n => n[0]).join('') ?? 'AD'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium">
                      {profile?.fullName ?? 'Admin'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {profile?.contactEmail ?? 'admin@portfolio.com'}
                    </span>
                  </div>
                  <ChevronDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile">
                    <User className="mr-2 size-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">
                    <Settings className="mr-2 size-4" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

// ── Admin Shell ────────────────────────────────────────────────────────────
function AdminShell({ children }: { children: React.ReactNode }) {
  const router  = useRouter()
  const { isAuthenticated, isLoading, initFromStorage } = useAuthStore()

  useEffect(() => { initFromStorage() }, [initFromStorage])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/admin/login')
  }, [isAuthenticated, isLoading, router])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        {/* Top header bar */}
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border bg-background/95 backdrop-blur px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <div className="flex-1">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink size={14} />
              View Site
            </Link>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}

// ── Root Layout ────────────────────────────────────────────────────────────
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname === '/admin/login') return <>{children}</>
  return <AdminShell>{children}</AdminShell>
}

