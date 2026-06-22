// components/portfolio/about-section.tsx
'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { publicService } from '@/services/publicService'
import {
  Github, Instagram, Twitter, Youtube,
  Facebook, Globe, Mail, Music2
} from 'lucide-react'

// Map platform → icon
const PLATFORM_ICONS: Record<string, React.ElementType> = {
  github:   Github,
  instagram: Instagram,
  twitter:  Twitter,
  youtube:  Youtube,
  facebook: Facebook,
  email:    Mail,
  tiktok:   Music2,
 // website:  Globe,
}

export function AboutSection() {
  const { data: profile } = useQuery({
    queryKey: ['about'],
    queryFn: publicService.getAbout,
    // Dùng lại cache từ HeroSection — không fetch lại
  })

  const { data: socialLinks = [] } = useQuery({
    queryKey: ['social-links'],
    queryFn: publicService.getSocialLinks,
  })

  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-8">
            About
          </h2>

          <div className="grid md:grid-cols-[1fr,2fr] gap-12">
            {/* Left — Social Links từ BE */}
            <div className="space-y-4">
              <div className="flex gap-4 flex-wrap">
                {socialLinks.map((link) => {
                  const Icon = PLATFORM_ICONS[link.platform] ?? Globe
                  return (
                    <Link
                      key={link.id}
                      href={link.url}
                      // target={link.platform !== 'email' ? '_blank' : undefined}
                      // rel={link.platform !== 'email' ? 'noopener noreferrer' : undefined}
                      target={link.platform === 'email' ? undefined : '_blank'}
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={link.label ?? link.platform}
                    >
                      <Icon size={22} />
                    </Link>
                  )
                })}
              </div>

              {profile?.location && (
                <p className="text-sm text-muted-foreground">{profile.location}</p>
              )}
            </div>

            {/* Right — Bio từ BE */}
            <div className="space-y-6">
              {profile?.bio ? (
                <p className="text-foreground text-lg leading-relaxed">
                  {profile.bio}
                </p>
              ) : (
                // Fallback khi chưa có bio
                <p className="text-muted-foreground leading-relaxed">
                  I&apos;m a developer passionate about crafting accessible,
                  pixel-perfect user interfaces.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}