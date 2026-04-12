/**
 * Global vitest setup — runs before any test file.
 * Loads the repo-root .env into process.env so Prisma picks up DATABASE_URL.
 * Handles quoted values and = signs inside values (connection strings).
 */
import { readFileSync } from 'fs'
import { resolve } from 'path'

const envPath = resolve(__dirname, '../../../.env')

try {
  const content = readFileSync(envPath, 'utf-8')
  for (const raw of content.split('\n')) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const eqIdx = line.indexOf('=')
    if (eqIdx === -1) continue
    const key = line.slice(0, eqIdx).trim()
    let val = line.slice(eqIdx + 1).trim()
    // Strip matching surrounding quotes
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (key && process.env[key] === undefined) {
      process.env[key] = val
    }
  }
} catch {
  // .env not present — rely on shell environment (CI, etc.)
}
