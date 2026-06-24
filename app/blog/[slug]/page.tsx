// app/blog/[slug]/page.tsx
'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, Clock, Calendar } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { publicService } from '@/services/publicService'
import { Footer } from "@/components/portfolio/footer"

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => publicService.getPostBySlug(slug),
  })

  // Tăng view count — fire & forget
  // useEffect(() => {
  //   if (slug) publicService.incrementView(slug)
  // }, [slug])
  useEffect(() => {
    if (!slug) return

    const key = `view-${slug}`

    if (sessionStorage.getItem(key)) return

    sessionStorage.setItem(key, "1")

    publicService.incrementView(slug)
  }, [slug])

  // 404
  useEffect(() => {
  if (isError) {
    router.push('/blog')
  }
}, [isError, router])
  // if (isError) {
  //   router.push('/blog')
  //   return null
  // }

  if (isLoading || !post) {
    return (
      <main className="min-h-screen px-6 py-24">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="h-8 w-3/4 bg-secondary rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-secondary rounded animate-pulse" />
          <div className="aspect-video bg-secondary rounded-xl animate-pulse mt-8" />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 px-6 pt-20 pb-10">
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> All posts
        </Link>

        {/* Tags */}
        {/* <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span key={tag.id} className="text-xs text-accent">
              #{tag.name}
            </span>
          ))}
        </div> */}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-medium text-foreground mb-4">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
          {post.publishedAt && (
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {post.readingTimeMinutes} min read
          </span>
          <span>{post.viewCount} views</span>
        </div>

        {/* Cover Image */}
        {post.coverImageUrl && (
          <div className="relative aspect-video rounded-xl overflow-hidden mb-12">
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <article
          className="prose prose-invert prose-lg max-w-none
            prose-headings:text-foreground
            prose-p:text-muted-foreground
            prose-a:text-accent
            prose-code:text-accent
            prose-strong:text-foreground"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags footer */}
        <div className="flex flex-wrap gap-2 mt-6 pt-6 ">
          {post.tags.map((tag) => (
            <span
              key={tag.id}
              // href={`/blog?tagSlug=${tag.slug}`}
              className="px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors"
            >
              #{tag.name}
            </span>
          ))}
        </div>

        {/* Prev / Next */}
        <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-border " >
          {post.prev ? (
            <Link
              href={`/blog/${post.prev.slug}`}
              className="flex flex-col gap-1 p-4 border border-border rounded-lg hover:bg-secondary transition-colors"
            >
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <ArrowLeft size={12} /> Previous
              </span>
              <span className="text-sm font-medium text-foreground line-clamp-2">
                {post.prev.title}
              </span>
            </Link>
          ) : <div />}

          {post.next ? (
            <Link
              href={`/blog/${post.next.slug}`}
              className="flex flex-col gap-1 p-4 border border-border rounded-lg hover:bg-secondary transition-colors text-right"
            >
              <span className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                Next <ArrowRight size={12} />
              </span>
              <span className="text-sm font-medium text-foreground line-clamp-2">
                {post.next.title}
              </span>
            </Link>
          ) : <div />}
        </div>
      </div>
      </div>
      <Footer />
    </main>
  )
}