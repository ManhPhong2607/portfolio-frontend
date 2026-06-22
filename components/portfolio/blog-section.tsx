// components/portfolio/blog-section.tsx
'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Clock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { publicService } from '@/services/publicService'
import type { BlogPostSummaryDto } from '@/types/api'

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function BlogCard({ post, index }: { post: BlogPostSummaryDto; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group"
    >
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative aspect-[16/10] bg-secondary rounded-lg overflow-hidden mb-4">
          <Image
            src={post.coverImageUrl ?? '/placeholder.svg?height=300&width=500'}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
          {post.publishedAt && (
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          )}
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {post.readingTimeMinutes} min read
          </span>
        </div>

        <h3 className="text-foreground font-medium mb-2 group-hover:text-accent transition-colors">
          {post.title}
        </h3>

        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
          {post.excerpt}
        </p>

        <div className="flex flex-wrap gap-2 mt-3">
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag.id} className="text-xs text-muted-foreground">
              #{tag.name}
            </span>
          ))}
        </div>
      </Link>
    </motion.article>
  )
}

export function BlogSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['posts', { page: 1, limit: 3 }],
    queryFn: () => publicService.getPosts({ page: 1, limit: 3 }),
  })

  const posts = data?.items ?? []

  return (
    <section id="blog" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Writing
            </h2>
            <Link
              href="/blog"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              All posts
              <ArrowRight size={14} />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-[16/10] bg-secondary rounded-lg animate-pulse" />
                  <div className="h-3 w-24 bg-secondary rounded animate-pulse" />
                  <div className="h-4 w-full bg-secondary rounded animate-pulse" />
                  <div className="h-3 w-3/4 bg-secondary rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <BlogCard key={post.id} post={post} index={index} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}