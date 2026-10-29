/**
 * Crop the phone photos of the range to a 4:5 frame around each shoe:
 *   node scripts/crop-photos.mjs   → photos/<id>.webp (800×1000)
 * Used by the catalog tiles and the inline photos in the display type.
 */
import sharp from 'sharp'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// top edge of the 4:5 crop (full source width), picked so the shoe sits centred
const CROPS = { blue: 8, mustard: 168, gold: 268, runner: 55, wingtip: 5 }

for (const [id, top] of Object.entries(CROPS)) {
  const src = resolve(root, `assets-src/photos/${id}.webp`)
  const { width } = await sharp(src).metadata()
  const height = Math.round((width * 5) / 4)
  await sharp(src)
    .extract({ left: 0, top, width, height })
    .resize(800, 1000)
    .webp({ quality: 82 })
    .toFile(resolve(root, `photos/${id}.webp`))
  console.log(`photos/${id}.webp`)
}
