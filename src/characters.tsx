// Seek-game cast: original kawaii 大耳狗 (Cinnamoroll-style) and 布丁狗
// (Pompompurin-style) variants, each with a unique accessory so every one looks
// different. Drawn as parametric SVG (no official Sanrio artwork is used).

export type CharacterId =
  | 'cinna'
  | 'cinnaBow'
  | 'cinnaStar'
  | 'cinnaScarf'
  | 'cinnaFlower'
  | 'cinnaCap'
  | 'purin'
  | 'purinBow'
  | 'purinGlasses'
  | 'purinScarf'
  | 'purinFlower'
  | 'purinCrown'

type Base = 'cinna' | 'purin'
type Acc = 'none' | 'beret' | 'bow' | 'star' | 'scarf' | 'flower' | 'cap' | 'glasses' | 'crown'

export interface CharacterDef {
  id: CharacterId
  name: string
  color: string
  base: Base
  acc: Acc
  accColor: string
}

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  cinna: { id: 'cinna', name: '大耳狗', color: '#a7d8ff', base: 'cinna', acc: 'none', accColor: '#8fd0ff' },
  cinnaBow: { id: 'cinnaBow', name: '大耳狗·蝴蝶結', color: '#ff9fb6', base: 'cinna', acc: 'bow', accColor: '#ff6b8a' },
  cinnaStar: { id: 'cinnaStar', name: '大耳狗·星星', color: '#ffd84d', base: 'cinna', acc: 'star', accColor: '#ffcf3a' },
  cinnaScarf: { id: 'cinnaScarf', name: '大耳狗·圍巾', color: '#ff6b6b', base: 'cinna', acc: 'scarf', accColor: '#ff5c5c' },
  cinnaFlower: { id: 'cinnaFlower', name: '大耳狗·小花', color: '#ff8ac2', base: 'cinna', acc: 'flower', accColor: '#ff6fb0' },
  cinnaCap: { id: 'cinnaCap', name: '大耳狗·帽子', color: '#7ecb8f', base: 'cinna', acc: 'cap', accColor: '#54b673' },
  purin: { id: 'purin', name: '布丁狗', color: '#ffcf5c', base: 'purin', acc: 'beret', accColor: '#8a5a2b' },
  purinBow: { id: 'purinBow', name: '布丁狗·領結', color: '#7ec7ff', base: 'purin', acc: 'bow', accColor: '#4aa3ee' },
  purinGlasses: { id: 'purinGlasses', name: '布丁狗·眼鏡', color: '#b0a0ff', base: 'purin', acc: 'glasses', accColor: '#3a2b2b' },
  purinScarf: { id: 'purinScarf', name: '布丁狗·圍巾', color: '#9ede6f', base: 'purin', acc: 'scarf', accColor: '#6fc94a' },
  purinFlower: { id: 'purinFlower', name: '布丁狗·小花', color: '#ff7a9c', base: 'purin', acc: 'flower', accColor: '#ff5c86' },
  purinCrown: { id: 'purinCrown', name: '布丁狗·皇冠', color: '#ffd24d', base: 'purin', acc: 'crown', accColor: '#ffcf3a' },
}

export const ALL_IDS = Object.keys(CHARACTERS) as CharacterId[]

function CinnaBase() {
  return (
    <g className="kw-bob">
      {/* long floppy ears */}
      <ellipse cx="22" cy="56" rx="11" ry="25" fill="#ffffff" stroke="#e3edf5" strokeWidth="1.5" transform="rotate(14 22 56)" />
      <ellipse cx="78" cy="56" rx="11" ry="25" fill="#ffffff" stroke="#e3edf5" strokeWidth="1.5" transform="rotate(-14 78 56)" />
      <ellipse cx="20" cy="72" rx="5" ry="9" fill="#bfe0f7" transform="rotate(14 20 72)" />
      <ellipse cx="80" cy="72" rx="5" ry="9" fill="#bfe0f7" transform="rotate(-14 80 72)" />
      {/* head */}
      <circle cx="50" cy="47" r="26" fill="#ffffff" stroke="#e6eef5" strokeWidth="1.5" />
      <circle cx="41" cy="46" r="3.4" fill="#3a2b2b" />
      <circle cx="59" cy="46" r="3.4" fill="#3a2b2b" />
      <circle cx="39.8" cy="44.8" r="1.1" fill="#fff" />
      <circle cx="57.8" cy="44.8" r="1.1" fill="#fff" />
      <ellipse cx="33" cy="52" rx="4.5" ry="3" fill="#ff9dbb" opacity="0.75" />
      <ellipse cx="67" cy="52" rx="4.5" ry="3" fill="#ff9dbb" opacity="0.75" />
      <ellipse cx="50" cy="50" rx="2" ry="1.5" fill="#f0a" opacity="0" />
      <path d="M46 53 Q50 57 54 53" stroke="#3a2b2b" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </g>
  )
}

function PurinBase() {
  return (
    <g className="kw-bob">
      {/* ears */}
      <ellipse cx="26" cy="34" rx="10" ry="13" fill="#e2a24a" transform="rotate(-24 26 34)" />
      <ellipse cx="74" cy="34" rx="10" ry="13" fill="#e2a24a" transform="rotate(24 74 34)" />
      {/* head */}
      <circle cx="50" cy="48" r="26" fill="#ffd766" stroke="#eabf4d" strokeWidth="1.5" />
      <circle cx="41" cy="47" r="3.4" fill="#3a2b2b" />
      <circle cx="59" cy="47" r="3.4" fill="#3a2b2b" />
      <circle cx="39.8" cy="45.8" r="1.1" fill="#fff" />
      <circle cx="57.8" cy="45.8" r="1.1" fill="#fff" />
      <ellipse cx="33" cy="53" rx="4.5" ry="3" fill="#ff9dbb" opacity="0.7" />
      <ellipse cx="67" cy="53" rx="4.5" ry="3" fill="#ff9dbb" opacity="0.7" />
      <ellipse cx="50" cy="54" rx="3" ry="2.2" fill="#6b4a2b" />
      <path d="M44 58 Q50 62 56 58" stroke="#6b4a2b" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </g>
  )
}

function Accessory({ acc, color }: { acc: Acc; color: string }) {
  switch (acc) {
    case 'none':
      return null
    case 'beret':
      return (
        <g>
          <ellipse cx="50" cy="24" rx="21" ry="8" fill={color} />
          <ellipse cx="50" cy="21" rx="14" ry="6" fill={color} />
          <circle cx="50" cy="15" r="3" fill="#6b4a2b" />
        </g>
      )
    case 'bow':
      return (
        <g fill={color} stroke="#fff" strokeWidth="1">
          <path d="M50 18 L36 10 L36 26 Z" />
          <path d="M50 18 L64 10 L64 26 Z" />
          <circle cx="50" cy="18" r="4.5" />
        </g>
      )
    case 'star':
      return (
        <path d="M50 4 L54 14 L65 14 L56 21 L59 32 L50 25 L41 32 L44 21 L35 14 L46 14 Z" fill={color} stroke="#f2c93d" strokeWidth="1" />
      )
    case 'scarf':
      return (
        <g fill={color}>
          <path d="M30 66 Q50 80 70 66 L70 73 Q50 86 30 73 Z" />
          <path d="M60 72 L70 72 L67 86 L58 84 Z" />
        </g>
      )
    case 'flower':
      return (
        <g transform="translate(28,16)">
          <g fill={color}>
            <circle cx="0" cy="-5" r="4" />
            <circle cx="4.8" cy="-1.5" r="4" />
            <circle cx="3" cy="4.5" r="4" />
            <circle cx="-3" cy="4.5" r="4" />
            <circle cx="-4.8" cy="-1.5" r="4" />
          </g>
          <circle cx="0" cy="0" r="3" fill="#ffe08a" />
        </g>
      )
    case 'cap':
      return (
        <g>
          <path d="M28 27 Q50 5 72 27 Z" fill={color} />
          <rect x="26" y="25" width="48" height="5" rx="2.5" fill={color} />
          <circle cx="50" cy="9" r="3" fill="#fff" />
        </g>
      )
    case 'glasses':
      return (
        <g stroke={color} strokeWidth="2.2" fill="rgba(255,255,255,0.35)">
          <circle cx="41" cy="47" r="8" />
          <circle cx="59" cy="47" r="8" />
          <path d="M49 47 L51 47" />
        </g>
      )
    case 'crown':
      return (
        <g>
          <path d="M33 20 L40 8 L50 17 L60 8 L67 20 Z" fill={color} stroke="#f2c93d" strokeWidth="1" />
          <circle cx="40" cy="9" r="2" fill="#ff6b8a" />
          <circle cx="60" cy="9" r="2" fill="#ff6b8a" />
          <circle cx="50" cy="16" r="2" fill="#ff6b8a" />
        </g>
      )
  }
}

export function CharacterArt({ id }: { id: CharacterId }) {
  const def = CHARACTERS[id]
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={def.name}>
      {def.base === 'cinna' ? <CinnaBase /> : <PurinBase />}
      <Accessory acc={def.acc} color={def.accColor} />
    </svg>
  )
}
