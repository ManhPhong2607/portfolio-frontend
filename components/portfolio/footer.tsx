import Link from "next/link"
import { Github, Linkedin, Twitter, Heart } from "lucide-react"

// const socialLinks = [
//   { name: "GitHub", href: "https://github.com", icon: Github },
//   { name: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
//   { name: "Twitter", href: "https://twitter.com", icon: Twitter },
// ]

const footerLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "#about" },
  { name: "Projects", href: "/projects" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "#contact" },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    
    <footer className="py-12 px-6 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <Link
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={social.name}
              >
                <social.icon size={18} />
              </Link>
            ))}
          </div> */}
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            {currentYear} Portfolio. Made with <Heart size={14} className="text-accent" /> using Next.js
          </p>
        </div>
      </div>
    </footer>
  )
}
