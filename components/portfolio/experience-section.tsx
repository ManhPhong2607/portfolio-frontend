"use client"

import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { publicService } from '@/services/publicService'
import type { EmploymentType } from '@/types/api'

const EMPLOYMENT_LABELS: Record<EmploymentType, string> = {
  FullTime:   'Full-time',
  PartTime:   'Part-time',
  Internship: 'Internship',
  Freelance:  'Freelance',
}

function formatPeriod(startDate: string, endDate: string | null, isCurrent: boolean): string {
  const start = new Date(startDate).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })

  if (isCurrent) return `${start} - Present`

  const end = endDate
    ? new Date(endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : ''

  return `${start} - ${end}`
}

export function ExperienceSection() {
   const { data: experiences = [], isLoading } = useQuery({
    queryKey: ['experiences'],
    queryFn: publicService.getExperiences,
  })
   return (
    <section id="experience" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-12">
            Experience
          </h2>

          {isLoading ? (
            <div className="space-y-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="grid md:grid-cols-[200px,1fr] gap-4 py-8 border-b border-border">
                  <div className="h-4 w-32 bg-secondary rounded animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-48 bg-secondary rounded animate-pulse" />
                    <div className="h-3 w-full bg-secondary rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-0">
              {experiences.map((exp, index) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="grid md:grid-cols-[200px,1fr] gap-4 py-8 border-b border-border last:border-0"
                >
                  <div className="text-sm text-muted-foreground">
                    {formatPeriod(exp.startDate, exp.endDate, exp.isCurrent)}
                  </div>

                  <div>
                    <h3 className="text-foreground font-medium mb-1">
                      {exp.position}{' '}
                      <span className="text-accent">· {exp.companyName}</span>
                      {exp.location && (
                        <span className="text-muted-foreground text-sm font-normal">
                          {' '}· {exp.location}
                        </span>
                      )}
                    </h3>

                    <span className="text-xs text-muted-foreground mb-3 inline-block">
                      {EMPLOYMENT_LABELS[exp.employmentType]}
                    </span>

                    {exp.description && (
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
