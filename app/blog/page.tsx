// app/blog/page.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, Search, ArrowLeft } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { publicService } from '@/services/publicService'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useDebounce } from '@/hooks/useDebounce'
import { Footer } from "@/components/portfolio/footer"

export default function BlogListPage() {
  const [search, setSearch]   = useState('')
  const [tagSlug, setTagSlug] = useState<string | null>(null)
  const [page, setPage]       = useState(1)

  const debouncedSearch = useDebounce(search, 400)

  const { data, isLoading } = useQuery({
    queryKey: ['posts', { page, search: debouncedSearch, tagSlug }],
    queryFn: () => publicService.getPosts({
      page,
      limit: 9,
      search: debouncedSearch || undefined,
      tagSlug: tagSlug || undefined,
    }),
  })

  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: publicService.getTags,
  })

  return (
    <main className="min-h-screen px-6 py-24">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </Link>
          <h1 className="text-3xl font-medium text-foreground mb-4">Writing</h1>
          <p className="text-muted-foreground">
            Thoughts on software development, architecture, and technology.
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge
              variant={tagSlug === null ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => { setTagSlug(null); setPage(1) }}
            >
              All
            </Badge>
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                variant={tagSlug === tag.slug ? 'default' : 'secondary'}
                className="cursor-pointer"
                onClick={() => { setTagSlug(tag.slug); setPage(1) }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[16/10] bg-secondary rounded-lg animate-pulse" />
                <div className="h-4 w-3/4 bg-secondary rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : data?.items.length === 0 ? (
          <p className="text-center text-muted-foreground py-24">No posts found.</p>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-8">
              {data?.items.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <Link href={`/blog/${post.slug}`}>
                    <div className="relative aspect-[16/10] bg-secondary rounded-lg overflow-hidden mb-4">
                      <Image
                        src={post.coverImageUrl ?? '/placeholder.svg'}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                      {post.publishedAt && (
                        <time>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric', day: 'numeric' })}</time>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {post.readingTimeMinutes} min
                      </span>
                    </div>
                    <h2 className="font-medium text-foreground group-hover:text-accent transition-colors mb-2">
                      {post.title}
                    </h2>
                    <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span key={tag.id} className="text-xs text-muted-foreground">#{tag.name}</span>
                      ))}
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={!data.hasPrev}
                  className="px-4 py-2 text-sm border border-border rounded-md disabled:opacity-50 hover:bg-secondary transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-muted-foreground">
                  {page} / {data.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!data.hasNext}
                  className="px-4 py-2 text-sm border border-border rounded-md disabled:opacity-50 hover:bg-secondary transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
       <Footer />
    </main>
  )
}