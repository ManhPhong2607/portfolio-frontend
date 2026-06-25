// components/admin/post-editor.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/adminService'
import { MediaPickerDialog } from '@/components/admin/media-picker-dialog'
import {
  ArrowLeft, Save, Send, Eye, Image as ImageIcon, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'
import type { BlogPostDetailDto, MediaFileDto } from '@/types/api'

interface Props {
  mode: 'create' | 'edit'
  post?: BlogPostDetailDto
}

function generateSlug(title: string) {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function PostEditor({ mode, post }: Props) {
  const router = useRouter()
  const qc = useQueryClient()

  const [form, setForm] = useState({
    title: post?.title ?? '',
    slug: post?.slug ?? '',
    excerpt: post?.excerpt ?? '',
    content: post?.content ?? '',
    tagIds: post?.tags.map(t => t.id) ?? [] as string[],
    coverMediaId: post?.coverMediaId ?? undefined,
  })

  const [coverPreview, setCoverPreview] = useState<string | null>(post?.coverImageUrl ?? null)
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false)

  useEffect(() => {
    if (post) {
      setForm({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? '',
        content: post.content,
        tagIds: post.tags.map(t => t.id),
        coverMediaId: post.coverMediaId ?? undefined,
      })
      setCoverPreview(post.coverImageUrl ?? null)
    }
  }, [post])

  const { data: tags = [] } = useQuery({
    queryKey: ['admin-tags'],
    queryFn: adminService.getAdminTags,
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-posts'] })
    qc.invalidateQueries({ queryKey: ['admin-post'] })
  }

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        content: form.content,
        excerpt: form.excerpt || undefined,
        coverMediaId: form.coverMediaId,
        tagIds: form.tagIds,
      }

      if (mode === 'create') {
        return await adminService.createPost(payload)
      }

      await adminService.updatePost(post!.id, payload)
      return { id: post!.id }
    },

    onSuccess: (data) => {
      invalidate()

      if (mode === 'create') {
        toast.success('Post created as draft.')
        router.replace(`/admin/blogs/${data.id}`)
      } else {
        toast.success('Changes saved.')
      }
    },

    onError: () => {
      toast.error('Error occurred.')
    },
  })

  // const saveMut = useMutation({
  //   mutationFn: async () => {
  //     const payload = {
  //       title: form.title,
  //       content: form.content,
  //       excerpt: form.excerpt || undefined,
  //       coverMediaId: form.coverMediaId,
  //       tagIds: form.tagIds,
  //     }

  //     if (mode === 'create') {
  //       return await adminService.createPost(payload)
  //     } else {
  //       await adminService.updatePost(post!.id, payload)
  //       return { id: post!.id }
  //     }
  //   },

  //   onSuccess: (data) => {
  //     invalidate()
  //     toast.success(
  //       mode === 'create'
  //         ? 'Saved as draft.'
  //         : 'Saved.'
  //     )

  //     if (mode === 'create' && data?.id) {
  //       router.replace(`/admin/blogs/${data.id}`)
  //     }
  //   },

  //   onError: () => {
  //     toast.error('Error occurred.')
  //   },
  // })

  const publishMut = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        content: form.content,
        excerpt: form.excerpt || undefined,
        coverMediaId: form.coverMediaId,
        tagIds: form.tagIds,
      }

      if (mode === 'create') {
        const created = await adminService.createPost(payload)

        await adminService.changePostStatus(
          created.id,
          'Published'
        )

        return created.id
      } else {
        await adminService.updatePost(post!.id, payload)

        await adminService.changePostStatus(
          post!.id,
          'Published'
        )

        return post!.id
      }
    },

    onSuccess: (id) => {
      invalidate()
      toast.success('Published!')

      if (mode === 'create') {
        router.replace(`/admin/blogs/${id}`)
      }
    },

    onError: () => {
      toast.error('Error occurred.')
    },
  })

  const handleSelectMedia = (media: MediaFileDto) => {
    setForm(f => ({ ...f, coverMediaId: media.id }))
    setCoverPreview(media.secureUrl)
  }

  const handleRemoveCover = () => {
    setForm(f => ({ ...f, coverMediaId: undefined }))
    setCoverPreview(null)
  }

  const handleTitleChange = (title: string) => {
    setForm(f => ({
      ...f,
      title,
      slug: mode === 'create' ? generateSlug(title) : f.slug,
    }))
  }

  const toggleTag = (tagId: string) => {
    setForm(f => ({
      ...f,
      tagIds: f.tagIds.includes(tagId)
        ? f.tagIds.filter(id => id !== tagId)
        : [...f.tagIds, tagId],
    }))
  }

  const isPublished = post?.status === 'Published'
  const isBusy = saveMut.isPending || publishMut.isPending

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/blogs"><ArrowLeft className="size-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {mode === 'create' ? 'New Post' : 'Edit Post'}
            </h1>
            <p className="text-muted-foreground">
              {mode === 'create' ? 'Create a new blog post' : `Editing: ${post?.title}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View public */}
          {isPublished && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/blog/${post!.slug}`} target="_blank">
                <Eye size={15} className="mr-2" /> View
              </Link>
            </Button>
          )}

          {/* Create mode */}
          {mode === 'create' && (
            <Button
              onClick={() => saveMut.mutate()}
              disabled={isBusy || !form.title || !form.content}
            >
              <Save size={15} className="mr-2" />
              {saveMut.isPending ? 'Creating...' : 'Create Post'}
            </Button>
          )}

          {/* Edit mode */}
          {mode === 'edit' && (
            <Button
              onClick={() => saveMut.mutate()}
              disabled={isBusy || !form.title || !form.content}
            >
              <Save size={15} className="mr-2" />
              {saveMut.isPending ? 'Saving...' : 'Save Post'}
            </Button>
          )}

          {/* Save Draft */}
          {/* <Button
            variant="outline"
            onClick={() => saveMut.mutate()}
            disabled={isBusy || !form.title || !form.content}
          >
            <Save size={15} className="mr-2" />
            {saveMut.isPending ? 'Saving...' : 'Save Draft'}
          </Button>

          {!isPublished && (
            <Button
              onClick={() => publishMut.mutate()}
              disabled={isBusy || !form.title || !form.content}
            >
              <Send size={15} className="mr-2" />
              {publishMut.isPending ? 'Publishing...' : 'Publish'}
            </Button> */}        
        </div>
      </div>

      {/* 2-column layout */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* ── Left: Main content ───────────────────────────────────── */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>Write your blog post content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter post title..."
                  value={form.title}
                  onChange={e => handleTitleChange(e.target.value)}
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder="post-url-slug"
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  URL: /blog/{form.slug || 'your-post-slug'}
                </p>
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  placeholder="Brief description of the post..."
                  value={form.excerpt}
                  onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                  rows={3}
                />
              </div>

              <Separator />

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Write your post content here... (HTML supported)"
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  rows={20}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  HTML content. TipTap rich text editor sẽ được tích hợp sau.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Right: Sidebar ───────────────────────────────────────── */}
        <div className="space-y-6">

          {/* Status */}
          {post && (
            <Card>
              <CardHeader><CardTitle>Status</CardTitle></CardHeader>
              <CardContent>
                <Badge variant={post.status === 'Published' ? 'default' : 'secondary'}>
                  {post.status}
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* Cover Image */}
          <Card>
            <CardHeader>
              <CardTitle>Cover Image</CardTitle>
            </CardHeader>
            <CardContent>
              {coverPreview ? (
                <div className="relative aspect-video rounded-lg border border-border overflow-hidden">
                  <Image
                    src={coverPreview}
                    alt="Cover"
                    fill className="object-cover"
                  />
                  <Button
                    variant="destructive" size="icon"
                    className="absolute top-2 right-2 size-8"
                    onClick={handleRemoveCover}
                  >
                    <X size={14} />
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
                    Click to select cover image
                  </span>
                </Button>
              )}
              {coverPreview && (
                <Button
                  variant="outline" size="sm" className="w-full mt-2"
                  onClick={() => setMediaPickerOpen(true)}
                >
                  Change image
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>Select tags for this post</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <Badge
                    key={tag.id}
                    variant={form.tagIds.includes(tag.id) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
              {/* <Separator className="my-4" />
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/admin/tags">Manage Tags</Link>
              </Button> */}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Media Picker */}
      <MediaPickerDialog
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleSelectMedia}
        defaultFolder="blog"
      />
    </div>
  )
}
