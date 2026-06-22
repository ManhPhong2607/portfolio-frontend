// app/projects/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ExternalLink, Github, ArrowLeft } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { publicService } from '@/services/publicService'
import { Badge } from '@/components/ui/badge'
import type { ProjectSummaryDto } from '@/types/api'
import { Footer } from "@/components/portfolio/footer"
import { Navbar } from "@/components/portfolio/navbar"

function ProjectCard({ project, index }: { project: ProjectSummaryDto; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <Link href={`/projects/${project.slug}`}>
        <div className="relative aspect-video bg-secondary rounded-lg overflow-hidden mb-4">
          <Image
            src={project.thumbnailUrl ?? '/placeholder.svg'}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            {project.demoUrl && (
              <span className="p-2 bg-foreground text-background rounded-full">
                <ExternalLink size={16} />
              </span>
            )}
            {project.githubUrl && (
              <span className="p-2 bg-foreground text-background rounded-full">
                <Github size={16} />
              </span>
            )}
          </div>

          {/* Status badge */}
          {project.status === 'InProgress' && (
            <div className="absolute top-2 left-2">
              <Badge className="text-xs">In Progress</Badge>
            </div>
          )}
          {project.isFeatured && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="text-xs">Featured</Badge>
            </div>
          )}
        </div>
      </Link>

      <div>
        <Link href={`/projects/${project.slug}`}>
          <h2 className="font-medium text-foreground group-hover:text-accent transition-colors mb-2">
            {project.title}
          </h2>
        </Link>

        <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">
          {project.shortDescription}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {project.technologies.slice(0, 5).map(tech => (
            <span key={tech.id} className="text-xs text-muted-foreground">
              {tech.name}
            </span>
          ))}
          {project.technologies.length > 5 && (
            <span className="text-xs text-muted-foreground">
              +{project.technologies.length - 5}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  )
}

export default function ProjectsPage() {
  const [techId, setTechId] = useState<string | null>(null)
  const [page, setPage]     = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['projects', { page, techId }],
    queryFn: () => publicService.getProjects({
      page,
      limit: 9,
      technologyId: techId ?? undefined,
    }),
  })

  const { data: technologies = [] } = useQuery({
    queryKey: ['technologies'],
    queryFn: publicService.getTechnologies,
  })

  return (
    // Đổi class của thẻ main để dàn layout dạng cột linh hoạt
    <main className="min-h-screen flex flex-col">
      {/* Thêm Navbar vào sát mép trên cùng */}
      <Navbar />

      {/* Tách riêng phần đệm (padding) px-6 py-24 vào một thẻ div bọc nội dung */}
      <div className="flex-1 px-6 py-24">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
            >
              <ArrowLeft size={16} /> Back
            </Link>
            <h1 className="text-3xl font-medium text-foreground mb-3">Projects</h1>
            <p className="text-muted-foreground">
              A collection of things I&apos;ve built over the years.
            </p>
          </div>

          {/* Technology filter */}
          <div className="flex flex-wrap gap-2 mb-10">
            <button
              onClick={() => { setTechId(null); setPage(1) }}
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                techId === null
                  ? 'bg-foreground text-background'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              All
            </button>
            {technologies.map(tech => (
              <button
                key={tech.id}
                onClick={() => { setTechId(tech.id); setPage(1) }}
                className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                  techId === tech.id
                    ? 'bg-foreground text-background'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {tech.name}
              </button>
            ))}
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-video bg-secondary rounded-lg animate-pulse" />
                  <div className="h-4 w-3/4 bg-secondary rounded animate-pulse" />
                  <div className="h-3 w-full bg-secondary rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : data?.items.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              No projects found.
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data?.items.map((project, index) => (
                  <ProjectCard key={project.id} project={project} index={index} />
                ))}
              </div>

              {/* Pagination */}
              {data && data.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                  <button
                    onClick={() => setPage(p => p - 1)}
                    disabled={!data.hasPrev}
                    className="px-4 py-2 text-sm border border-border rounded-md disabled:opacity-50 hover:bg-secondary transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm text-muted-foreground">
                    {page} / {data.totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => p + 1)}
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
      </div>

      <Footer />
    </main>
  )

  // return (
  //   <main className="min-h-screen px-6 py-24">
  //     <div className="max-w-5xl mx-auto">
  //       {/* Header */}
  //       <div className="mb-12">
  //         <Link
  //           href="/"
  //           className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
  //         >
  //           <ArrowLeft size={16} /> Back
  //         </Link>
  //         <h1 className="text-3xl font-medium text-foreground mb-3">Projects</h1>
  //         <p className="text-muted-foreground">
  //           A collection of things I&apos;ve built over the years.
  //         </p>
  //       </div>

  //       {/* Technology filter */}
  //       <div className="flex flex-wrap gap-2 mb-10">
  //         <button
  //           onClick={() => { setTechId(null); setPage(1) }}
  //           className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
  //             techId === null
  //               ? 'bg-foreground text-background'
  //               : 'bg-secondary text-muted-foreground hover:text-foreground'
  //           }`}
  //         >
  //           All
  //         </button>
  //         {technologies.map(tech => (
  //           <button
  //             key={tech.id}
  //             onClick={() => { setTechId(tech.id); setPage(1) }}
  //             className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
  //               techId === tech.id
  //                 ? 'bg-foreground text-background'
  //                 : 'bg-secondary text-muted-foreground hover:text-foreground'
  //             }`}
  //           >
  //             {tech.name}
  //           </button>
  //         ))}
  //       </div>

  //       {/* Grid */}
  //       {isLoading ? (
  //         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
  //           {[...Array(6)].map((_, i) => (
  //             <div key={i} className="space-y-3">
  //               <div className="aspect-video bg-secondary rounded-lg animate-pulse" />
  //               <div className="h-4 w-3/4 bg-secondary rounded animate-pulse" />
  //               <div className="h-3 w-full bg-secondary rounded animate-pulse" />
  //             </div>
  //           ))}
  //         </div>
  //       ) : data?.items.length === 0 ? (
  //         <div className="text-center py-24 text-muted-foreground">
  //           No projects found.
  //         </div>
  //       ) : (
  //         <>
  //           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
  //             {data?.items.map((project, index) => (
  //               <ProjectCard key={project.id} project={project} index={index} />
  //             ))}
  //           </div>

  //           {/* Pagination */}
  //           {data && data.totalPages > 1 && (
  //             <div className="flex justify-center gap-2 mt-12">
  //               <button
  //                 onClick={() => setPage(p => p - 1)}
  //                 disabled={!data.hasPrev}
  //                 className="px-4 py-2 text-sm border border-border rounded-md disabled:opacity-50 hover:bg-secondary transition-colors"
  //               >
  //                 Previous
  //               </button>
  //               <span className="px-4 py-2 text-sm text-muted-foreground">
  //                 {page} / {data.totalPages}
  //               </span>
  //               <button
  //                 onClick={() => setPage(p => p + 1)}
  //                 disabled={!data.hasNext}
  //                 className="px-4 py-2 text-sm border border-border rounded-md disabled:opacity-50 hover:bg-secondary transition-colors"
  //               >
  //                 Next
  //               </button>
  //             </div>
  //           )}
  //         </>
  //       )}
  //     </div>
  //   <Footer />
  // </main>
  // )
}