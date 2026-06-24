// components/portfolio/contact-section.tsx
'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Send, Github, Instagram, Twitter, Music2, Mail, MapPin, Loader2, Facebook, Youtube, Globe } from 'lucide-react'
import Link from 'next/link'
import { useMutation, useQuery } from '@tanstack/react-query'
import { publicService } from '@/services/publicService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  github: Github,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  facebook: Facebook,
  email: Mail,
  tiktok: Music2,
}

export function ContactSection() {
  const { data: profile } = useQuery({
    queryKey: ['about'],
    queryFn: publicService.getAbout,
  })

  const { data: socialLinks = [] } = useQuery({
    queryKey: ['social-links'],
    queryFn: publicService.getSocialLinks,
  })

  const [isSubmitted, setIsSubmitted] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', subject: '', message: '', honeypotUrl: '',
  })

  const submitMut = useMutation({
    mutationFn: publicService.submitContact,
    onSuccess: () => {
      setIsSubmitted(true)
      setForm({ name: '', email: '', subject: '', message: '', honeypotUrl: '' })
    },
    onError: (err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response?.status
      toast.error(
        status === 429
          ? 'Bạn gửi quá nhiều lần. Vui lòng thử lại sau.'
          : 'Có lỗi xảy ra, vui lòng thử lại.'
      )
    },
  })

  useEffect(() => {
    if (!isSubmitted) return

    const timer = setTimeout(() => {
      setIsSubmitted(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [isSubmitted])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitMut.mutate(form)
  }

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
            Contact
          </h2>

          <p className="text-2xl md:text-3xl text-foreground max-w-xl mb-12">
            If you would like to discuss a project or just say hi, I&apos;m always down to chat.
          </p>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Form */}
            <div>
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-secondary/50 rounded-lg p-8 text-center"
                >
                  <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="text-accent" size={24} />
                  </div>
                  <h3 className="text-foreground font-medium mb-2">Message sent!</h3>
                  <p className="text-muted-foreground text-sm">
                    Thanks for reaching out. I&apos;ll get back to you as soon as possible.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="name" className="text-foreground">Name</Label>
                      <Input
                        id="name" required
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Your name"
                        className="mt-1.5 bg-background border-border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-foreground">Email</Label>
                      <Input
                        id="email" type="email" required
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="your@email.com"
                        className="mt-1.5 bg-background border-border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject" className="text-foreground">Subject</Label>
                      <Input
                        id="subject"
                        value={form.subject}
                        onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                        placeholder="What is this about?"
                        className="mt-1.5 bg-background border-border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="message" className="text-foreground">Message</Label>
                      <Textarea
                        id="message" required rows={5}
                        value={form.message}
                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                        placeholder="Your message..."
                        className="mt-1.5 bg-background border-border resize-none"
                      />
                    </div>
                  </div>

                  {/* Honeypot — ẩn hoàn toàn, chỉ bot mới điền */}
                  <div style={{ position: 'absolute', left: '-9999px', opacity: 0 }} aria-hidden="true">
                    <label htmlFor="website">Website</label>
                    <input
                      id="website" name="website" type="text"
                      tabIndex={-1} autoComplete="off"
                      value={form.honeypotUrl}
                      onChange={e => setForm(f => ({ ...f, honeypotUrl: e.target.value }))}
                    />
                  </div>

                  <Button type="submit" disabled={submitMut.isPending} className="w-full">
                    {submitMut.isPending ? (
                      <><Loader2 className="animate-spin mr-2" size={18} /> Sending...</>
                    ) : (
                      <><Send size={18} className="mr-2" /> Send Message</>
                    )}
                  </Button>
                </form>
              )}
            </div>

            {/* Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-foreground font-medium mb-4">Get in touch</h3>
                <div className="space-y-3">
                  {profile?.contactEmail && (
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Mail size={16} />
                      {profile.contactEmail}
                    </p>
                  )}
                  {profile?.location && (
                    <p className="text-muted-foreground flex items-center gap-2">
                      <MapPin size={16} />
                      {profile.location}
                    </p>
                  )}
                </div>
              </div>

              {socialLinks.length > 0 && (
                <div>
                  <h3 className="text-foreground font-medium mb-4">Social</h3>
                  <div className="flex flex-wrap gap-4">
                    {socialLinks.map(link => {
                      const Icon = PLATFORM_ICONS[link.platform] ?? Globe
                      const isEmail = link.platform === 'email'
                      return (
                        <Link
                          key={link.id}
                          href={isEmail ? `mailto:${link.url.replace('mailto:', '')}` : link.url}
                          target={isEmail ? undefined : '_blank'}
                          rel={isEmail ? undefined : 'noopener noreferrer'}
                          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Icon size={18} />
                          <span className="text-sm">{link.label ?? link.platform}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}