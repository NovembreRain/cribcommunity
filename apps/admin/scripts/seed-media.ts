/**
 * One-off content seed: uploads a hand-picked, human-reviewed selection of
 * real property photos (from MediaPhotos/ at the repo root) into the
 * Supabase 'media' bucket, then attaches them to the specific DB rows that
 * were still empty/placeholder.
 *
 * Every target row is re-checked for emptiness right before writing so this
 * can never clobber real content that was added since this file was written.
 *
 * Usage (from apps/admin): npx dotenv -e .env -- npx tsx scripts/seed-media.ts
 */
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@crib/db'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const REPO_ROOT = resolve(__dirname, '../../..')

async function uploadOne(localPath: string, folder: string): Promise<string> {
  const buffer = readFileSync(resolve(REPO_ROOT, localPath))
  const ext = localPath.split('.').pop()?.toLowerCase() ?? 'jpg'
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { data, error } = await supabase.storage
    .from('media')
    .upload(fileName, buffer, { contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`, upsert: false })
  if (error) throw new Error(`Upload failed for ${localPath}: ${error.message}`)

  const { data: pub } = supabase.storage.from('media').getPublicUrl(data.path)
  return pub.publicUrl
}

async function main() {
  // ── Location: Auroville — general destination/ambience gallery ──────────
  const auroville = await prisma.location.findUnique({ where: { slug: 'auroville' } })
  if (!auroville) throw new Error('Location "auroville" not found')
  const aurovilleImages = Array.isArray(auroville.images) ? (auroville.images as string[]) : []

  if (aurovilleImages.length === 0) {
    const urls = await Promise.all(
      [
        'MediaPhotos/Curated/Property/IMG-20260216-WA0137.jpg',
        'MediaPhotos/Curated/Property/IMG-20260216-WA0183.jpg',
        'MediaPhotos/Curated/Property/IMG-20260216-WA0186.jpg',
        'MediaPhotos/Curated/Property/IMG-20260216-WA0118.jpg',
      ].map((p) => uploadOne(p, 'locations')),
    )
    await prisma.location.update({ where: { id: auroville.id }, data: { images: urls } })
    console.log(`Location "Auroville": +${urls.length} image(s)`)
  } else {
    console.log('Location "Auroville" already has images — skipped')
  }

  // ── Event: Yoga Class in Common — currently no photos ────────────────────
  const event = await prisma.event.findUnique({ where: { slug: 'yoga-class-in-common' } })
  if (!event) throw new Error('Event "yoga-class-in-common" not found')
  const eventImages = Array.isArray(event.images) ? (event.images as string[]) : []

  if (eventImages.length === 0) {
    const url = await uploadOne('MediaPhotos/Curated/CommunityEvents/IMG-20260216-WA0038.jpg', 'events')
    await prisma.event.update({ where: { id: event.id }, data: { images: [url] } })
    console.log('Event "Yoga Class in Common": +1 image')
  } else {
    console.log('Event "Yoga Class in Common" already has images — skipped')
  }

  // ── BlogPost: What is new here — currently no cover image ────────────────
  const post = await prisma.blogPost.findUnique({ where: { slug: 'what-is-new-here' } })
  if (!post) throw new Error('BlogPost "what-is-new-here" not found')

  if (!post.og_image) {
    const url = await uploadOne('MediaPhotos/Curated/IMG-20260216-WA0139.jpg', 'blog')
    await prisma.blogPost.update({ where: { id: post.id }, data: { og_image: url } })
    console.log('BlogPost "What is new here": og_image set')
  } else {
    console.log('BlogPost "What is new here" already has an og_image — skipped')
  }

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
