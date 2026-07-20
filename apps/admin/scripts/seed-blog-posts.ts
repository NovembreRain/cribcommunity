/**
 * One-off: uploads a cover photo and creates the two "Things to Do" blog
 * posts (Auroville + Pondicherry) with SEO metadata filled in.
 *
 * Usage (from apps/admin): npx dotenv -e .env -- npx tsx scripts/seed-blog-posts.ts
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
const AUROVILLE_COVER = 'https://qjjetqtzexiydyfqohih.supabase.co/storage/v1/object/public/media/locations/1784539009423-1bijlu5hwac.jpg'

async function uploadOne(localPath: string, folder: string): Promise<string> {
  const buffer = readFileSync(resolve(REPO_ROOT, localPath))
  const { data, error } = await supabase.storage
    .from('media')
    .upload(`${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`, buffer, {
      contentType: 'image/jpeg',
      upsert: false,
    })
  if (error) throw new Error(`Upload failed: ${error.message}`)
  const { data: pub } = supabase.storage.from('media').getPublicUrl(data.path)
  return pub.publicUrl
}

async function main() {
  const category = await prisma.blogCategory.findUniqueOrThrow({ where: { slug: 'travel-guides' } })
  const author = await prisma.user.findFirstOrThrow({ select: { id: true } })

  const pondyCover = await uploadOne('MediaPhotos/Curated/Property/IMG-20260216-WA0115.jpg', 'blog')

  const posts = [
    {
      title: 'Things to Do in Auroville: A Traveller\'s Guide',
      excerpt: 'From the golden dome of the Matrimandir to quiet cycling trails and forest cafés — here\'s how to spend your days in Auroville, Crib Community style.',
      meta_title: 'Things to Do in Auroville — Crib Community Travel Guide',
      meta_description: 'A traveller\'s guide to Auroville: the Matrimandir, cycling trails, beaches, temples, and the best food near your Crib Community hostel stay.',
      og_image: AUROVILLE_COVER,
      content: [
        "Auroville doesn't ask you to sightsee so much as to slow down. Nicknamed the City of Dawn, this experimental township in Tamil Nadu was built as a place where people from every corner of the world could live in peace, and that spirit still shapes how you're meant to explore it — unhurried, on two wheels, with plenty of stops for chai.",
        "Start at the Matrimandir, Auroville's golden, geodesic heart and the closest thing India has to a meditation spaceship. You'll need a pass from the Visitors Centre to go inside, but even from the viewing point the gardens around it are worth the morning. Go early — the light through the banyan trees is unbeatable before 9am.",
        "Rent a bicycle (everyone does) and let Auroville's red-dirt roads take you past the Botanical Garden, Bharat Nivas, and enough tamarind and cashew groves to make you forget you're 9 km from an airport. Yoga and meditation sessions run most mornings across the community — ask at your stay, someone will point you in the right direction.",
        "For a change of scene, the beaches are close: Auroville Beach for a quiet sunrise swim, Serenity Beach if you want a beach-shack breakfast with your waves, and Promenade Beach a little further out in Pondicherry town for an evening stroll. History-lovers should carve out an afternoon for the Pondicherry Museum and the Manakula Vinayagar Temple.",
        "Hungry? Bread & Chocolate is the local favourite for real coffee and something baked, Tio Tentacao does a very good sunset menu, and Chunfa Momos Spot is exactly what it sounds like — go with an appetite.",
        "And when the sun goes down, the best of Auroville often happens in the common areas, not the guidebooks — movie nights, music circles, a workshop someone's hosting because they had something to teach. Check for events at Crib Community to see what's on this week; you might end up teaching the next one yourself.",
      ].join('\n\n'),
    },
    {
      title: 'Things to Do in Pondicherry: A Traveller\'s Guide',
      excerpt: 'Cobblestone lanes, French colonial facades, and a coastline made for slow evenings — here\'s how to spend your days in Pondicherry, Crib Community style.',
      meta_title: 'Things to Do in Pondicherry — Crib Community Travel Guide',
      meta_description: 'A traveller\'s guide to Pondicherry: the French Quarter, Promenade Beach, Sri Aurobindo Ashram, local eats, and easy day trips from Auroville.',
      og_image: pondyCover,
      content: [
        "Nine kilometres from Auroville, Pondicherry (Puducherry, if you're being formal) is where French colonial history and South Indian life share the same street corner — mustard-yellow villas next to temple gopurams, church bells and conch shells within earshot of each other. It rewards travellers who are happy to just wander.",
        "Start in the French Quarter — Rue Romain Rolland, Rue Suffren, the whole grid of bougainvillea-draped colonial houses. Mornings here are for slow coffee and getting pleasantly lost; there's no better way to feel Pondicherry's particular blend of French Riviera and Tamil Nadu.",
        "Walk the Promenade Beach at golden hour, when the whole town turns out for the sea breeze, then head to Sri Aurobindo Ashram for a quieter moment — it's a working spiritual community, not a museum, so go with a bit of stillness in your step. The Manakula Vinayagar Temple nearby is one of the oldest in the region and worth the incense-scented detour.",
        "History and greenery fans should pencil in the Pondicherry Museum for its Chola bronzes and colonial-era relics, and the Botanical Garden for shade and old banyan trees when the afternoon heat hits. If you'd rather be in the water, Auroville Beach and Serenity Beach are both a short ride away and worth the detour for calmer, quieter sand.",
        "Pondicherry eats well. Bread & Chocolate remains the go-to for French pastries and good coffee, and the side streets around the French Quarter hide more café gems than any list can keep up with — follow your nose.",
        "Pondicherry is an easy day trip from Crib Community's Auroville stays — hop on a bike or grab an auto in the morning and be back in time for dinner and whatever's happening in the common area that night. Check for events at Crib Community before you plan your evening; there's usually something worth staying in for.",
      ].join('\n\n'),
    },
  ]

  for (const post of posts) {
    const slug = post.title
      .toLowerCase()
      .replace(/[':]/g, '')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/[\s_-]+/g, '-')

    await prisma.blogPost.create({
      data: {
        id: crypto.randomUUID(),
        title: post.title,
        slug,
        excerpt: post.excerpt,
        content: post.content,
        author_id: author.id,
        category_id: category.id,
        status: 'published',
        published_at: new Date('2026-07-20T09:00:00.000Z'),
        og_image: post.og_image,
        meta_title: post.meta_title,
        meta_description: post.meta_description,
      },
    })
    console.log(`Created post: ${post.title} (/${slug})`)
  }

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
