// app/projects/[slug]/page.tsx
'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink, Github, Calendar } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { publicService } from '@/services/publicService'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Footer } from "@/components/portfolio/footer"
const STATUS_LABELS: Record<string, string> = {
  InProgress: 'In Progress',
  Completed:  'Completed',
  Draft:      'Draft',
  Archived:   'Archived',
}

function formatDate(date: string | null) {
  if (!date) return null
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric',
  })
}

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router   = useRouter()

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ['project', slug],
    queryFn:  () => publicService.getProjectBySlug(slug),
  })

  if (isError) {
    router.push('/projects')
    return null
  }

  if (isLoading || !project) {
    return (
      <main className="min-h-screen px-6 py-24">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-8 w-64 bg-secondary rounded animate-pulse" />
          <div className="aspect-video bg-secondary rounded-xl animate-pulse" />
          <div className="h-4 w-full bg-secondary rounded animate-pulse" />
        </div>
      </main>
    )
  }

  return (
    // <main className="min-h-screen px-6 py-24">
     <main className="min-h-screen flex flex-col">
      <div className="flex-1 px-6 py-24">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> All projects
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl font-medium text-foreground">
                  {project.title}
                </h1>
                <Badge variant={project.status === 'Completed' ? 'default' : 'secondary'}>
                  {STATUS_LABELS[project.status] ?? project.status}
                </Badge>
                {project.isFeatured && (
                  <Badge variant="outline">Featured</Badge>
                )}
              </div>

              {/* Period */}
              {project.startDate && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar size={14} />
                  {formatDate(project.startDate)}
                  {project.endDate && ` – ${formatDate(project.endDate)}`}
                  {!project.endDate && project.status === 'InProgress' && ' – Present'}
                </p>
              )}
            </div>

            {/* CTA buttons */}
            <div className="flex items-center gap-2">
              {project.demoUrl && (
                <Button asChild>
                  <Link href={project.demoUrl} target="_blank">
                    <ExternalLink size={16} className="mr-2" /> Live Demo
                  </Link>
                </Button>
              )}
              {project.githubUrl && (
                <Button variant="outline" asChild>
                  <Link href={project.githubUrl} target="_blank">
                    <Github size={16} className="mr-2" /> GitHub
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Thumbnail */}
          {project.thumbnailUrl && (
            <div className="relative aspect-video rounded-xl overflow-hidden mb-10 bg-secondary">
              <Image
                src={project.thumbnailUrl}
                alt={project.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Short description */}
          {project.shortDescription && (
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              {project.shortDescription}
            </p>
          )}

          {/* Technologies */}
          {project.technologies.length > 0 && (
            <div className="mb-10">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                Tech Stack
              </h2>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map(tech => (
                  <span
                    key={tech.id}
                    className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md"
                  >
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Detail content */}
          {project.detailContent && (
            <div>
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">
                About this project
              </h2>
              <article
                className="prose prose-invert prose-lg max-w-none
                  prose-headings:text-foreground
                  prose-p:text-muted-foreground
                  prose-a:text-accent
                  prose-strong:text-foreground
                  prose-code:text-accent
                  prose-li:text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: project.detailContent }}
              />
            </div>
          )}

          {/* Bottom CTA */}
          {/* <div className="mt-12 pt-8 border-t border-border flex items-center justify-between flex-wrap gap-4">
            <Link
              href="/projects"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <ArrowLeft size={14} /> All projects
            </Link>
          </div> */}
        </motion.div>
      </div>
      </div>
    <Footer />
  </main>
  )
}