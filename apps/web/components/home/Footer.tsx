import Link from 'next/link'

const FOOTER_LINKS: [string, string][] = [
  ['Locations', '/locations'],
  ['Events', '/community/events'],
  ['Blog', '/community/blog'],
  ['Contact', '/contact'],
]

export function Footer() {
  return (
    <footer className="border-t border-gold-border/20 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center">
          <span className="text-white font-display text-2xl font-bold italic tracking-tighter">Crib</span>
          <span className="text-primary not-italic text-4xl leading-none font-display">.</span>
        </div>
        <p className="text-text-low text-xs uppercase tracking-widest">
          © {new Date().getFullYear()} Crib Community — All rights reserved
        </p>
        <nav className="flex gap-6" aria-label="Footer navigation">
          {FOOTER_LINKS.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="text-xs font-bold uppercase tracking-widest text-text-low hover:text-primary transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
