/**
 * Homepage — /
 *
 * Scaffold placeholder. Replace with HeroSection + full layout
 * once the homepage task file is executed.
 *
 * Hero video: /videos/hero.mp4
 * Design reference: AI_CONTEXT/stitch-ui-kit.html → HeroSection screen
 * Props reference: AI_CONTEXT/design-map.json → HeroSection
 */
export default function HomePage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background-dark">
      {/* Hero video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-40"
        aria-hidden="true"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background-dark/30 via-background-dark/60 to-background-dark pointer-events-none" />

      {/* Content placeholder */}
      <div className="relative z-10 text-center px-6">
        <h1 className="font-display text-6xl md:text-[80px] text-text-high leading-[1.05] mb-6">
          Crib{' '}
          <span className="text-primary italic font-light">Community</span>
        </h1>
        <p className="text-xl text-text-medium max-w-xl mx-auto font-light mb-10">
          A curated collective of boutique hostels. Find your tribe.
        </p>
        <a href="/locations" className="btn-primary inline-flex items-center gap-2">
          Explore Locations
        </a>
      </div>
    </main>
  )
}
