import { type Metadata } from 'next'
import Link from 'next/link'
import { NavBar } from '@/components/home/NavBar'
import { Mail, Phone, MapPin } from 'lucide-react'
import { submitEnquiry } from './actions'
import { Footer } from '@/components/home/Footer'

export const metadata: Metadata = {
  title: 'Contact — Crib Community',
  description: 'Get in touch with Crib Community — bookings, partnerships, or just to say hello.',
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background-dark">
      <NavBar />
      <div className="pt-32" />

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h2 className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-4 flex items-center gap-3">
            <span className="w-8 h-[2px] bg-gradient-to-r from-primary to-transparent" />
            Get in Touch
          </h2>
          <h1 className="font-display text-5xl text-text-high mb-4">Contact Us</h1>
          <p className="text-text-medium max-w-xl">
            Questions about a stay, partnership ideas, or just want to connect — we'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact form */}
          <div className="glass-panel rounded-2xl p-8 border border-gold-border/20 space-y-6">
            <h2 className="font-display text-xl text-text-high">Send a Message</h2>
            <form action={submitEnquiry} className="space-y-5">
              <Field label="Name *" name="name" placeholder="Your full name" />
              <Field label="Email *" name="email" placeholder="you@example.com" />
              <Field label="Phone" name="phone" placeholder="+91 98765 43210" />
              <div className="space-y-1.5">
                <label htmlFor="intent" className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">
                  Regarding
                </label>
                <select
                  id="intent"
                  name="intent"
                  className="w-full bg-background-dark border border-gold-border/20 rounded-xl px-4 py-2.5 text-sm text-text-high focus:outline-none focus:border-primary/40 transition-colors"
                >
                  <option value="general">General Enquiry</option>
                  <option value="booking">Booking Question</option>
                  <option value="partnership">Partnership</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="message" className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Tell us what's on your mind…"
                  rows={5}
                  className="w-full bg-background-dark border border-gold-border/20 rounded-xl px-4 py-2.5 text-sm text-text-high placeholder:text-text-low focus:outline-none focus:border-primary/40 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl text-sm font-bold tracking-[0.1em] uppercase transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Info panel */}
          <div className="space-y-6">
            <div className="glass-panel rounded-2xl p-6 border border-gold-border/20 space-y-5">
              <h2 className="font-display text-xl text-text-high">Find Us</h2>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Mail size={16} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-text-low text-xs uppercase tracking-[0.1em] mb-1">Email</p>
                    <p className="text-text-medium">hello@cribcommunity.in</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={16} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-text-low text-xs uppercase tracking-[0.1em] mb-1">Phone</p>
                    <p className="text-text-medium">+91 98765 43210</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-text-low text-xs uppercase tracking-[0.1em] mb-1">Locations</p>
                    <p className="text-text-medium">Goa · Manali · Rishikesh</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6 border border-gold-border/20 space-y-4">
              <h2 className="font-display text-xl text-text-high">Quick Links</h2>
              <div className="space-y-2">
                {([
                  ['Browse Locations', '/locations'],
                  ['Upcoming Events', '/community/events'],
                  ['Open Roles', '/community/jobs'],
                  ['Read the Journal', '/community/blog'],
                ] as [string, string][]).map(([label, href]) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex items-center justify-between py-2 text-sm text-text-medium hover:text-primary transition-colors border-b border-gold-border/10 last:border-0"
                  >
                    {label}
                    <span className="text-primary/60">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

function Field({ label, name, placeholder }: { label: string; name: string; placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        placeholder={placeholder}
        className="w-full bg-background-dark border border-gold-border/20 rounded-xl px-4 py-2.5 text-sm text-text-high placeholder:text-text-low focus:outline-none focus:border-primary/40 transition-colors"
      />
    </div>
  )
}
