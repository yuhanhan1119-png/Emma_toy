import { ALL_IDS, type CharacterId } from './characters'

export interface LevelConfig {
  level: number
  name: string
  timeSeconds: number
  totalSprites: number // total characters scattered in the scene
  spriteSize: number // px base size of each sprite
  targets: { id: CharacterId; count: number }[]
  background: string // CSS background for the scene
}

const BACKGROUNDS = [
  'linear-gradient(135deg,#ffe0ec,#fff3f8)',
  'linear-gradient(135deg,#e3f2ff,#f4fbff)',
  'linear-gradient(135deg,#eafbe0,#f6fff0)',
  'linear-gradient(135deg,#fff3d6,#fffdf3)',
  'linear-gradient(135deg,#f0e6ff,#faf5ff)',
  'linear-gradient(135deg,#e0fff6,#f2fffb)',
]

// Deterministic level generation so difficulty ramps smoothly across 15 levels.
function buildLevels(): LevelConfig[] {
  const levels: LevelConfig[] = []
  for (let i = 0; i < 15; i++) {
    const level = i + 1
    // sprites: 40 -> ~300, sizes shrink 62 -> 30
    const totalSprites = Math.round(40 + i * 18)
    const spriteSize = Math.max(30, Math.round(62 - i * 2.4))
    // number of distinct targets grows: 1..3, counts grow slowly
    const numTargetKinds = level <= 4 ? 1 : level <= 9 ? 2 : 3
    const perTarget = 1 + Math.floor(i / 5) // 1,1,1,1,1,2,... up to 3

    // pick target ids rotating through the roster for variety
    const targets: { id: CharacterId; count: number }[] = []
    for (let t = 0; t < numTargetKinds; t++) {
      const id = ALL_IDS[(i + t * 3) % ALL_IDS.length]
      targets.push({ id, count: perTarget })
    }

    levels.push({
      level,
      name: `第 ${level} 關`,
      timeSeconds: 180,
      totalSprites,
      spriteSize,
      targets,
      background: BACKGROUNDS[i % BACKGROUNDS.length],
    })
  }
  return levels
}

export const LEVELS = buildLevels()
export const TOTAL_LEVELS = LEVELS.length
