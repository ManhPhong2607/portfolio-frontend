// components/portfolio/projects-section.tsx
'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Github, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { publicService } from '@/services/publicService'
import type { ProjectSummaryDto } from '@/types/api'

function ProjectCard({ project, index }: { project: ProjectSummaryDto; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group"
    >
      <Link href={`/projects/${project.slug}`}>
        <div className="relative aspect-video bg-secondary rounded-lg overflow-hidden mb-4">
          <Image
            src={project.thumbnailUrl ?? '/placeholder.svg?height=400&width=600'}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
            {project.demoUrl && (
              <span className="p-2 bg-foreground text-background rounded-full">
                <ExternalLink size={18} />
              </span>
            )}
            {project.githubUrl && (
              <span className="p-2 bg-foreground text-background rounded-full">
                <Github size={18} />
              </span>
            )}
          </div>
        </div>
      </Link>

      <div>
        <Link href={`/projects/${project.slug}`}>
          <h3 className="text-foreground font-medium mb-2 group-hover:text-accent transition-colors">
            {project.title}
          </h3>
        </Link>
        <p className="text-muted-foreground text-sm leading-relaxed mb-3 line-clamp-2">
          {project.shortDescription}
        </p>
        <div className="flex flex-wrap gap-2">
          {project.technologies.slice(0, 4).map((tech) => (
            <span key={tech.id} className="text-xs text-muted-foreground">
              {tech.name}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  )
}

export function ProjectsSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['projects', { page: 1, limit: 4 }],
    queryFn: () => publicService.getProjects({ page: 1, limit: 4 }),
  })

  const projects = data?.items ?? []

  return (
    <section id="projects" className="py-24 px-6 bg-card">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Selected Projects
            </h2>
            <Link
              href="/projects"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-video bg-secondary rounded-lg animate-pulse" />
                  <div className="h-4 w-3/4 bg-secondary rounded animate-pulse" />
                  <div className="h-3 w-full bg-secondary rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {projects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}