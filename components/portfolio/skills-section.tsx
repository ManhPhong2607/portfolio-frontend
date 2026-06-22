// components/portfolio/skills-section.tsx
'use client'

import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { publicService } from '@/services/publicService'
import type { SkillCategory, SkillDto } from '@/types/api'

function SkillBar({ level }: { level: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${
            i <= level ? 'bg-accent' : 'bg-secondary'
          }`}
        />
      ))}
    </div>
  )
}

// Thứ tự hiển thị category
// const CATEGORY_ORDER: SkillCategory[] = [ 
//   'Frontend', 'Backend', 'Database' , 'Other', ] 
// const CATEGORY_LABELS: Record<SkillCategory, string> = { 
//   Frontend: 'Frontend', Backend: 'Backend', Database: 'Database', Other: 'Other', }
const CATEGORY_ORDER: SkillCategory[] = [
  'Frontend',
  'Backend',
  'Database',
  'Other',
]

const CATEGORY_LABELS: Record<SkillCategory, string> = {
  Frontend: 'Frontend',
  Backend: 'Backend',
  Database: 'Database',
  Other: 'Other',
}
export function SkillsSection() {
  const { data: skills = [], isLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: publicService.getSkills,
  })

  // Group theo category
  const grouped = CATEGORY_ORDER.reduce<Record<string, SkillDto[]>>(
    (acc, cat) => {
      const items = skills.filter((s) => s.category === cat)
      if (items.length > 0) acc[cat] = items
      return acc
    },
    {}
  )

  return (
    <section id="skills" className="py-24 px-6 bg-card">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-12">
            Skills
          </h2>

          {isLoading ? (
            // Skeleton loading
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-4 w-24 bg-secondary rounded animate-pulse" />
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="h-3 bg-secondary rounded animate-pulse" />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {Object.entries(grouped).map(([cat, items], idx) => (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                >
                  <h3 className="text-foreground font-medium mb-6">
                   {CATEGORY_LABELS[cat as SkillCategory]}
                    {/* {CATEGORY_LABELS[cat as SkillCategory] ?? cat} */}
                  </h3>
                  <ul className="space-y-4">
                    {items.map((skill) => (
                      <li
                        key={skill.id}
                        className="flex items-center justify-between gap-4"
                      >
                        <span className="text-muted-foreground text-sm">
                          {skill.name}
                        </span>
                        <SkillBar level={skill.proficiencyLevel} />
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}