"use client"

import { motion } from "framer-motion"
import { ArrowDown, FileText, Mail } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useQuery } from "@tanstack/react-query"
import { publicService } from "@/services/publicService"

export function HeroSection() {
  const { data: profile } = useQuery({
    queryKey: ["about"],
    queryFn: publicService.getAbout,
  })

  const initials =
    profile?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2) ?? "YN"

  return (
    <section className="min-h-screen flex items-center px-6 py-24">
      <div className="max-w-6xl mx-auto w-full">

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-16 items-center"
        >

          {/* Avatar */}
          <div className="flex justify-center lg:justify-start">
            <div className="relative w-52 h-52 lg:w-64 lg:h-64 rounded-full overflow-hidden border border-border bg-secondary shadow-xl">
              {profile?.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  fill
                  priority
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl font-semibold text-muted-foreground">
                  {initials}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: .1 }}
              className="text-5xl lg:text-7xl font-bold tracking-tight"
            >
              {profile?.fullName ?? "Your Name"}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: .2 }}
              className="mt-4 text-2xl text-accent font-medium"
            >
              {profile?.tagline}
            </motion.p>

            {profile?.bio && (
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: .3 }}
                className="mt-8 max-w-2xl text-lg leading-8 text-muted-foreground"
              >
                {profile.bio}
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: .4 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              {profile?.cvUrl && (
                <a
                  href={profile.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-foreground px-6 py-3 text-background font-medium hover:opacity-90 transition"
                >
                  <FileText size={18} />
                  View CV
                </a>
              )}

              <Link
                href="#contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-foreground rounded-md font-medium hover:bg-secondary transition-colors"
              >
                <Mail size={18} />
                Contact Me
              </Link>
            </motion.div>
          </div>

        </motion.div>

        {/* Scroll */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-24 flex justify-center"
        >
          <Link
            href="#about"
            className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition"
          >
            <span className="text-sm">Scroll down</span>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            >
              <ArrowDown size={20} />
            </motion.div>
          </Link>
        </motion.div>

      </div>
    </section>
  )
}

// "use client"

// import { motion } from "framer-motion"
// import { ArrowDown, FileText, Mail } from "lucide-react"
// import Link from "next/link"
// import Image from "next/image"
// import { useQuery } from "@tanstack/react-query"
// import { publicService } from "@/services/publicService"

// export function HeroSection() {
//   const { data: profile } = useQuery({
//     queryKey: ['about'],
//     queryFn: publicService.getAbout,
//   })

//   const initials = profile?.fullName
//     ?.split(' ')
//     .map(n => n[0])
//     .join('')
//     .slice(0, 2) ?? 'YN'

//   return (
//     <section className="min-h-screen flex flex-col justify-center px-6 pt-20">
//       <div className="max-w-5xl mx-auto w-full">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="flex flex-col sm:flex-row sm:items-center gap-6 mb-6"
//         >
//           {/* Avatar */}
//           <div className="relative size-20 sm:size-24 rounded-full overflow-hidden bg-secondary border border-border shrink-0">
//             {profile?.avatarUrl ? (
//               <Image
//                 src={profile.avatarUrl}
//                 alt={profile.fullName}
//                 fill
//                 className="object-cover"
//                 priority
//               />
//             ) : (
//               <div className="w-full h-full flex items-center justify-center text-2xl font-medium text-muted-foreground">
//                 {initials}
//               </div>
//             )}
//           </div>

//           <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-foreground text-balance">
//             {profile?.fullName ?? 'Your Name'}
//           </h1>
//         </motion.div>

//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6, delay: 0.1 }}
//         >
//           <p className="text-xl md:text-2xl text-muted-foreground mb-4">
//             <em className="font-serif text-accent not-italic">
//               {profile?.tagline ?? 'Full-Stack Developer.'}
//             </em>{' '}
//             Building polished web applications and experiences.
//           </p>

//           {profile?.bio && (
//             <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mb-8">
//               {profile.bio}
//             </p>
//           )}

//           <div className="flex flex-wrap gap-4">
//             {profile?.cvUrl && (
//               <a
//                 href={profile.cvUrl}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-md font-medium hover:bg-foreground/90 transition-colors"
//               >
//                 <FileText size={18} />
//                 View CV
//               </a>
//             )}
//             <Link
//               href="#contact"
//               className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-foreground rounded-md font-medium hover:bg-secondary transition-colors"
//             >
//               <Mail size={18} />
//               Contact Me
//             </Link>
//           </div>
//         </motion.div>

//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 1, duration: 0.6 }}
//           className="absolute bottom-10 left-1/2 -translate-x-1/2"
//         >
//           <Link
//             href="#about"
//             className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
//           >
//             <span className="text-sm">Scroll down</span>
//             <motion.div
//               animate={{ y: [0, 8, 0] }}
//               transition={{ repeat: Infinity, duration: 1.5 }}
//             >
//               <ArrowDown size={20} />
//             </motion.div>
//           </Link>
//         </motion.div>
//       </div>
//     </section>
//   )
// }