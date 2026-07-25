import { ALL_IDS, type CharacterId } from './characters'
import type { LevelConfig } from './levels'

export interface PlacedSprite {
  key: string
  id: CharacterId
  x: number // percentage 0-100 (center)
  y: number // percentage 0-100 (center)
  size: number // px
  rotation: number // deg
  z: number
  isTarget: boolean
  found: boolean
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

// Build the scattered scene for a level. Targets are placed with exact counts,
// distractors are drawn only from characters that are NOT targets so the
// required target count is exact and unambiguous.
export function generateScene(cfg: LevelConfig): PlacedSprite[] {
  const targetIds = new Set(cfg.targets.map((t) => t.id))
  const distractorPool = ALL_IDS.filter((id) => !targetIds.has(id))

  const sprites: PlacedSprite[] = []
  let counter = 0

  const place = (id: CharacterId, isTarget: boolean) => {
    const jitter = rand(0.82, 1.12)
    sprites.push({
      key: `s${counter++}`,
      id,
      x: rand(5, 95),
      y: rand(7, 93),
      size: Math.round(cfg.spriteSize * jitter),
      rotation: rand(-18, 18),
      z: Math.floor(rand(1, 1000)),
      isTarget,
      found: false,
    })
  }

  for (const t of cfg.targets) {
    for (let i = 0; i < t.count; i++) place(t.id, true)
  }

  const targetTotal = cfg.targets.reduce((s, t) => s + t.count, 0)
  const distractorCount = Math.max(0, cfg.totalSprites - targetTotal)
  for (let i = 0; i < distractorCount; i++) {
    const id = distractorPool[Math.floor(rand(0, distractorPool.length))]
    place(id, false)
  }

  // Shuffle so targets are not always rendered on top / first.
  for (let i = sprites.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[sprites[i], sprites[j]] = [sprites[j], sprites[i]]
  }

  return sprites
}
