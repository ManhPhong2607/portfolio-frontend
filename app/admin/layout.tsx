// app/admin/layout.tsx
'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, FileText, FolderKanban, Wrench,
  Briefcase, Tag, Cpu, ImageIcon, User, Settings,
  LogOut, ChevronDown, ExternalLink,
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

// // app/admin/layout.tsx
// 'use client'

// import { useEffect } from 'react'
// import { useRouter, usePathname } from 'next/navigation'
// import Link from 'next/link'
// import {
//   LayoutDashboard, FileText, FolderKanban, ImageIcon,
//   User, Settings, LogOut, Tags, Cpu, Star, Briefcase,
//   Share2, ChevronRight,
// } from 'lucide-react'
// import { useAuthStore } from '@/store/authStore'
// import { cn } from '@/lib/utils'

// const navItems = [
//   { href: '/admin',              label: 'Dashboard',    icon: LayoutDashboard, exact: true },
//   { href: '/admin/blogs',        label: 'Blog Posts',   icon: FileText },
//   { href: '/admin/projects',     label: 'Projects',     icon: FolderKanban },
//   { href: '/admin/skills',       label: 'Skills',       icon: Star },
//   { href: '/admin/experiences',  label: 'Experiences',  icon: Briefcase },
//   { href: '/admin/tags',         label: 'Tags',         icon: Tags },
//   { href: '/admin/technologies', label: 'Technologies', icon: Cpu },
//  // { href: '/admin/social-links', label: 'Social Links', icon: Share2 },
//   { href: '/admin/media',        label: 'Media',        icon: ImageIcon },
//   { href: '/admin/profile',      label: 'Profile',      icon: User },
//   { href: '/admin/settings',     label: 'Settings',     icon: Settings },
// ]

// export default function AdminLayout({ children }: { children: React.ReactNode }) {
//   const router   = useRouter()
//   const pathname = usePathname()

//   const { isAuthenticated, isLoading, initFromStorage, logout } = useAuthStore()

//   useEffect(() => {
//     initFromStorage()
//   }, [initFromStorage])

//   useEffect(() => {
//     if (!isLoading && !isAuthenticated) {
//       router.replace('/admin/login')
//     }
//   }, [isAuthenticated, isLoading, router])

//   const handleLogout = async () => {
//     await logout()
//     router.replace('/admin/login')
//   }

//   // Loading state
//   if (isLoading || !isAuthenticated) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-background">
//         <div className="flex flex-col items-center gap-3">
//           <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
//           <p className="text-sm text-muted-foreground">Loading...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen flex bg-background">
//       {/* Sidebar */}
//       <aside className="w-60 border-r border-border flex flex-col shrink-0">
//         {/* Logo */}
//         <div className="h-14 flex items-center px-4 border-b border-border">
//           <Link href="/admin" className="flex items-center gap-2">
//             <div className="size-7 rounded-md bg-accent flex items-center justify-center text-accent-foreground font-bold text-sm">
//               P
//             </div>
//             <span className="font-medium text-sm text-foreground">Admin Panel</span>
//           </Link>
//         </div>

//         {/* Nav */}
//         <nav className="flex-1 py-4 overflow-y-auto">
//           <ul className="space-y-0.5 px-2">
//             {navItems.map((item) => {
//               const isActive = item.exact
//                 ? pathname === item.href
//                 : pathname.startsWith(item.href)
//               const Icon = item.icon

//               return (
//                 <li key={item.href}>
//                   <Link
//                     href={item.href}
//                     className={cn(
//                       'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
//                       isActive
//                         ? 'bg-accent/10 text-accent font-medium'
//                         : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
//                     )}
//                   >
//                     <Icon size={16} />
//                     {item.label}
//                     {isActive && <ChevronRight size={14} className="ml-auto" />}
//                   </Link>
//                 </li>
//               )
//             })}
//           </ul>
//         </nav>

//         {/* Logout */}
//         <div className="p-3 border-t border-border">
//           <button
//             onClick={handleLogout}
//             className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
//           >
//             <LogOut size={16} />
//             Sign out
//           </button>
//         </div>
//       </aside>

//       {/* Main content */}
//       <main className="flex-1 overflow-auto">
//         <div className="p-6">
//           {children}
//         </div>
//       </main>
//     </div>
//   )
// }