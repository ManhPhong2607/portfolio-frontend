// components/portfolio/contact-section.tsx
'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { publicService } from '@/services/publicService'
import {
  Github, Instagram, Twitter, Youtube,
  Facebook, Globe, Mail, Music2
} from 'lucide-react'

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  github:   Github,
  instagram: Instagram,
  twitter:  Twitter,
  youtube:  Youtube,
  facebook: Facebook,
  email:    Mail,
  tiktok:   Music2,
  //website:  Globe,
}

export function ContactSection() {
  const { data: socialLinks = [] } = useQuery({
    queryKey: ['social-links'],
    queryFn: publicService.getSocialLinks,
    // Dùng lại cache từ AboutSection
  })

  return (
    <section id="contact" className="py-24 px-6 bg-card">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Let&apos;s Connect
          </h2>

          <p className="text-2xl md:text-3xl text-foreground max-w-xl mb-12">
            If you would like to discuss a project or just say hi, I&apos;m always down to chat.
          </p>

          <div className="flex flex-wrap gap-6">
            {socialLinks.map((link) => {
              const Icon = PLATFORM_ICONS[link.platform] ?? Globe
              const isEmail = link.platform === 'email'

              return (
                <Link
                  key={link.id}
                  href={isEmail ? `mailto:${link.url.replace('mailto:', '')}` : link.url}
                  target={isEmail ? undefined : '_blank'}
                  rel={isEmail ? undefined : 'noopener noreferrer'}
                  className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <Icon size={22} className="group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">
                    {link.label ?? link.platform}
                  </span>
                </Link>
              )
            })}
          </div>
        </motion.div>
      </div>
    </section>
  )
}