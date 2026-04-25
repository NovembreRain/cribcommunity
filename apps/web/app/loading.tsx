export default function Loading() {
  return (
    <main className="min-h-screen bg-background-dark flex items-center justify-center">
      <div className="flex items-center gap-3">
        <span className="text-white font-display text-3xl font-bold italic tracking-tighter">Crib</span>
        <span className="text-primary font-display text-5xl leading-none animate-pulse">.</span>
      </div>
    </main>
  )
}
