// // components/admin/project-editor.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/adminService'
import { MediaPickerDialog } from '@/components/admin/media-picker-dialog'
import { ArrowLeft, Save, Image as ImageIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import type { ProjectDetailDto, MediaFileDto } from '@/types/api'
import type { ProjectStatus } from '@/types/api'

interface Props {
  mode:     'create' | 'edit'
  project?: ProjectDetailDto
}

function generateSlug(title: string) {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function ProjectEditor({ mode, project }: Props) {
  const router = useRouter()
  const qc     = useQueryClient()

  const [form, setForm] = useState({
    title:            project?.title            ?? '',
    slug:             project?.slug             ?? '',
    shortDescription: project?.shortDescription ?? '',
    detailContent:    project?.detailContent    ?? '',
    demoUrl:          project?.demoUrl          ?? '',
    githubUrl:        project?.githubUrl        ?? '',
    startDate:        project?.startDate ? project.startDate.split('T')[0] : '',
    endDate:          project?.endDate   ? project.endDate.split('T')[0]   : '',
    // isFeatured:       project?.isFeatured       ?? false,
    technologyIds:    project?.technologies.map(t => t.id) ?? [] as string[],
    thumbnailMediaId: project?.thumbnailMediaId ?? undefined,
  })

  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    project?.thumbnailUrl ?? null
  )
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false)

  useEffect(() => {
    if (project) {
      setForm({
        title:            project.title,
        slug:             project.slug,
        shortDescription: project.shortDescription ?? '',
        detailContent:    project.detailContent    ?? '',
        demoUrl:          project.demoUrl           ?? '',
        githubUrl:        project.githubUrl         ?? '',
        startDate:        project.startDate ? project.startDate.split('T')[0] : '',
        endDate:          project.endDate   ? project.endDate.split('T')[0]   : '',
        // isFeatured:       project.isFeatured,
        technologyIds:    project.technologies.map(t => t.id),
        thumbnailMediaId: project.thumbnailMediaId ?? undefined,
      })
      setThumbnailPreview(project.thumbnailUrl ?? null)
    }
  }, [project])

  const { data: technologies = [] } = useQuery({
    queryKey: ['admin-technologies'],
    queryFn:  adminService.getAdminTechnologies,
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-projects'] })
    qc.invalidateQueries({ queryKey: ['admin-project'] })
  }

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = {
        title:            form.title,
        shortDescription: form.shortDescription || undefined,
        detailContent:    form.detailContent    || undefined,
        demoUrl:          form.demoUrl          || undefined,
        githubUrl:        form.githubUrl        || undefined,
        startDate:        form.startDate        || undefined,
        endDate:          form.endDate          || undefined,
        thumbnailMediaId: form.thumbnailMediaId,
        technologyIds:    form.technologyIds,
      }

      if (mode === 'create') return adminService.createProject(payload)
      else                   return adminService.updateProject(project!.id, payload)
    },
    onSuccess: (data) => {
      invalidate()
      toast.success(mode === 'create' ? 'Project created.' : 'Changes saved.')
      if (mode === 'create' && data && 'id' in data)
        router.replace(`/admin/projects/${data.id}`)
    },
    onError: () => toast.error('Error occurred.'),
  })

  const handleSelectMedia = (media: MediaFileDto) => {
    setForm(f => ({ ...f, thumbnailMediaId: media.id }))
    setThumbnailPreview(media.secureUrl)
  }

  const handleRemoveThumbnail = () => {
    setForm(f => ({ ...f, thumbnailMediaId: undefined }))
    setThumbnailPreview(null)
  }

  const handleTitleChange = (title: string) => {
    setForm(f => ({
      ...f,
      title,
      slug: mode === 'create' ? generateSlug(title) : f.slug,
    }))
  }

  const toggleTech = (id: string) => {
    setForm(f => ({
      ...f,
      technologyIds: f.technologyIds.includes(id)
        ? f.technologyIds.filter(t => t !== id)
        : [...f.technologyIds, id],
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/projects"><ArrowLeft className="size-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {mode === 'create' ? 'New Project' : 'Edit Project'}
            </h1>
            <p className="text-muted-foreground">
              {mode === 'create' ? 'Add a new portfolio project' : `Editing: ${project?.title}`}
            </p>
          </div>
        </div>

        <Button
          onClick={() => saveMut.mutate()}
          disabled={saveMut.isPending || !form.title}
        >
          <Save size={15} className="mr-2" />
          {saveMut.isPending ? 'Saving...' : 'Save Project'}
        </Button>
      </div>

      {/* 2-column layout */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* ── Left: Main content ───────────────────────────────────── */}
        <div className="space-y-6 lg:col-span-2">

          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Basic information about the project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  placeholder="Enter project title..."
                  value={form.title}
                  onChange={e => handleTitleChange(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  placeholder="project-url-slug"
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  URL: /projects/{form.slug || 'your-project-slug'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Short Description</Label>
                <Textarea
                  placeholder="Brief description for project cards..."
                  value={form.shortDescription}
                  onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))}
                  rows={3}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Detailed Description</Label>
                <Textarea
                  placeholder="Full project description (HTML supported)..."
                  value={form.detailContent}
                  onChange={e => setForm(f => ({ ...f, detailContent: e.target.value }))}
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Links */}
          <Card>
            <CardHeader>
              <CardTitle>Links</CardTitle>
              <CardDescription>External links for the project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Demo URL</Label>
                <Input
                  type="url"
                  placeholder="https://demo.example.com"
                  value={form.demoUrl}
                  onChange={e => setForm(f => ({ ...f, demoUrl: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>GitHub URL</Label>
                <Input
                  type="url"
                  placeholder="https://github.com/username/repo"
                  value={form.githubUrl}
                  onChange={e => setForm(f => ({ ...f, githubUrl: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Right: Sidebar ───────────────────────────────────────── */}
        <div className="space-y-6">

          {/* Status + Featured */}
          {/* <Card>
            <CardHeader><CardTitle>Status</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {project && (
                <Select
                  value={project.status}
                  onValueChange={async (s) => {
                    await adminService.changeProjectStatus(project.id, s as ProjectStatus)
                    invalidate()
                    toast.success('Status updated.')
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="InProgress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {!project && (
                <p className="text-sm text-muted-foreground">
                  New projects start as <strong>Draft</strong>.<br/>
                  Change status after saving.
                </p>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Featured Project</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Show on homepage</p>
                </div>
                <Switch
                  checked={form.isFeatured}
                  onCheckedChange={v => setForm(f => ({ ...f, isFeatured: v }))}
                />
              </div>
            </CardContent>
          </Card> */}

          {/* Timeline */}
          <Card>
            <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Thumbnail */}
          <Card>
            <CardHeader><CardTitle>Thumbnail</CardTitle></CardHeader>
            <CardContent>
              {thumbnailPreview ? (
                <div className="space-y-2">
                  <div className="relative aspect-video rounded-lg border border-border overflow-hidden">
                    <Image
                      src={thumbnailPreview}
                      alt="Thumbnail"
                      fill className="object-cover"
                    />
                    <Button
                      variant="destructive" size="icon"
                      className="absolute top-2 right-2 size-8"
                      onClick={handleRemoveThumbnail}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                  <Button
                    variant="outline" size="sm" className="w-full"
                    onClick={() => setMediaPickerOpen(true)}
                  >
                    Change thumbnail
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full h-32 flex-col gap-2"
                  onClick={() => setMediaPickerOpen(true)}
                >
                  <ImageIcon size={28} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to select thumbnail
                  </span>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Technologies */}
          <Card>
            <CardHeader>
              <CardTitle>Technologies</CardTitle>
              <CardDescription>Tech stack used in this project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {technologies.map(tech => (
                  <Badge
                    key={tech.id}
                    variant={form.technologyIds.includes(tech.id) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleTech(tech.id)}
                  >
                    {tech.name}
                  </Badge>
                ))}
              </div>
              {/* <Separator className="my-4" />
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/admin/technologies">Manage Technologies</Link>
              </Button> */}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Media Picker Dialog */}
      <MediaPickerDialog
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleSelectMedia}
        defaultFolder="projects"
      />
    </div>
  )
}

// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
// import { adminService } from '@/services/adminService'
// import { ArrowLeft, Save } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Textarea } from '@/components/ui/textarea'
// import { Badge } from '@/components/ui/badge'
// import { toast } from 'sonner'
// import type { ProjectDetailDto } from '@/types/api'

// interface Props {
//   mode: 'create' | 'edit'
//   project?: ProjectDetailDto
// }

// export function ProjectEditor({ mode, project }: Props) {
//   const router = useRouter()
//   const qc     = useQueryClient()

//   const [form, setForm] = useState({
//     title:            project?.title            ?? '',
//     shortDescription: project?.shortDescription ?? '',
//     detailContent:    project?.detailContent    ?? '',
//     demoUrl:          project?.demoUrl          ?? '',
//     githubUrl:        project?.githubUrl        ?? '',
//     startDate:        project?.startDate        ? project.startDate.split('T')[0] : '',
//     endDate:          project?.endDate          ? project.endDate.split('T')[0]   : '',
//     thumbnailMediaId: undefined as string | undefined,
//     technologyIds:    project?.technologies.map(t => t.id) ?? [] as string[],
//   })

//   useEffect(() => {
//     if (project) {
//       setForm({
//         title:            project.title,
//         shortDescription: project.shortDescription ?? '',
//         detailContent:    project.detailContent    ?? '',
//         demoUrl:          project.demoUrl           ?? '',
//         githubUrl:        project.githubUrl         ?? '',
//         startDate:        project.startDate ? project.startDate.split('T')[0] : '',
//         endDate:          project.endDate   ? project.endDate.split('T')[0]   : '',
//         thumbnailMediaId: undefined,
//         technologyIds:    project.technologies.map(t => t.id),
//       })
//     }
//   }, [project])

//   const { data: technologies = [] } = useQuery({
//     queryKey: ['admin-technologies'],
//     queryFn:  adminService.getAdminTechnologies,
//   })

//   const invalidate = () => {
//     qc.invalidateQueries({ queryKey: ['admin-projects'] })
//     qc.invalidateQueries({ queryKey: ['admin-project'] })
//   }

//   const saveMut = useMutation({
//     mutationFn: async () => {
//       const payload = {
//         title:            form.title,
//         shortDescription: form.shortDescription  || undefined,
//         detailContent:    form.detailContent     || undefined,
//         demoUrl:          form.demoUrl           || undefined,
//         githubUrl:        form.githubUrl         || undefined,
//         startDate:        form.startDate         || undefined,
//         endDate:          form.endDate           || undefined,
//         thumbnailMediaId: form.thumbnailMediaId,
//         technologyIds:    form.technologyIds,
//       }

//       if (mode === 'create') return adminService.createProject(payload)
//       else                   return adminService.updateProject(project!.id, payload)
//     },
//     onSuccess: (data) => {
//       invalidate()
//       toast.success(mode === 'create' ? 'Đã tạo project.' : 'Đã lưu.')
//       if (mode === 'create' && data && 'id' in data) {
//         router.replace(`/admin/projects/${data.id}`)
//       } else {     
//         router.push('/admin/projects')
//       }  
//     },
//     onError: () => toast.error('Có lỗi xảy ra.'),
//   })

//   const toggleTech = (id: string) => {
//     setForm(f => ({
//       ...f,
//       technologyIds: f.technologyIds.includes(id)
//         ? f.technologyIds.filter(t => t !== id)
//         : [...f.technologyIds, id],
//     }))
//   }

//   return (
//     <div className="max-w-4xl space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           <Button variant="ghost" size="icon" asChild>
//             <Link href="/admin/projects"><ArrowLeft size={18} /></Link>
//           </Button>
//           <div>
//             <h1 className="text-xl font-bold">
//               {mode === 'create' ? 'New Project' : 'Edit Project'}
//             </h1>
//             {project && (
//               <Badge variant="secondary" className="mt-1">{project.status}</Badge>
//             )}
//           </div>
//         </div>

//         <Button
//           onClick={() => saveMut.mutate()}
//           disabled={saveMut.isPending || !form.title}
//         >
//           <Save size={15} className="mr-2" />
//           {saveMut.isPending ? 'Saving...' : 'Save'}
//         </Button>
//       </div>

//       {/* Form */}
//       <div className="grid gap-5">
//         <div className="grid md:grid-cols-2 gap-5">
//           <div className="space-y-2">
//             <Label>Title *</Label>
//             <Input
//               placeholder="Project title"
//               value={form.title}
//               onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
//             />
//           </div>
//           <div className="space-y-2">
//             <Label>Short Description</Label>
//             <Input
//               placeholder="One-line description"
//               value={form.shortDescription}
//               onChange={(e) => setForm(f => ({ ...f, shortDescription: e.target.value }))}
//             />
//           </div>
//         </div>

//         <div className="space-y-2">
//           <Label>Detail Content</Label>
//           <Textarea
//             placeholder="Detailed description (HTML supported)"
//             value={form.detailContent}
//             onChange={(e) => setForm(f => ({ ...f, detailContent: e.target.value }))}
//             rows={10}
//             className="font-mono text-sm"
//           />
//         </div>

//         <div className="grid md:grid-cols-2 gap-5">
//           <div className="space-y-2">
//             <Label>Demo URL</Label>
//             <Input
//               placeholder="https://myportfolio.vercel.app"
//               value={form.demoUrl}
//               onChange={(e) => setForm(f => ({ ...f, demoUrl: e.target.value }))}
//             />
//           </div>
//           <div className="space-y-2">
//             <Label>GitHub URL</Label>
//             <Input
//               placeholder="https://github.com/..."
//               value={form.githubUrl}
//               onChange={(e) => setForm(f => ({ ...f, githubUrl: e.target.value }))}
//             />
//           </div>
//         </div>

//         <div className="grid md:grid-cols-2 gap-5">
//           <div className="space-y-2">
//             <Label>Start Date</Label>
//             <Input
//               type="date"
//               value={form.startDate}
//               onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))}
//             />
//           </div>
//           <div className="space-y-2">
//             <Label>End Date</Label>
//             <Input
//               type="date"
//               value={form.endDate}
//               onChange={(e) => setForm(f => ({ ...f, endDate: e.target.value }))}
//             />
//           </div>
//         </div>

//         {/* Technologies */}
//         <div className="space-y-2">
//           <Label>Technologies</Label>
//           <div className="flex flex-wrap gap-2">
//             {technologies.map((tech) => (
//               <button
//                 key={tech.id}
//                 type="button"
//                 onClick={() => toggleTech(tech.id)}
//                 className={`px-3 py-1 text-sm rounded-full border transition-colors ${
//                   form.technologyIds.includes(tech.id)
//                     ? 'bg-accent text-accent-foreground border-accent'
//                     : 'border-border text-muted-foreground hover:border-accent/50'
//                 }`}
//               >
//                 {tech.name}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }