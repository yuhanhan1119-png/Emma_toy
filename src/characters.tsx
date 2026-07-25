// Original kawaii mascot characters (Sanrio-inspired, not official artwork).
// The rendering is parametric SVG so real licensed art could be swapped in later
// by replacing the <CharacterArt> output while keeping the same CharacterId set.

export type CharacterId =
  | 'cat'
  | 'bunny'
  | 'batbunny'
  | 'puppy'
  | 'pudding'
  | 'penguin'
  | 'frog'
  | 'bear'
  | 'star'
  | 'berry'

export interface CharacterDef {
  id: CharacterId
  name: string // display name (Chinese)
  emoji: string // quick fallback / preview glyph
  color: string // theme color for chips/labels
}

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  cat: { id: 'cat', name: '小奶貓', emoji: '🐱', color: '#ff9fb6' },
  bunny: { id: 'bunny', name: '美露兔', emoji: '🐰', color: '#ffb3d1' },
  batbunny: { id: 'batbunny', name: '酷洛', emoji: '🦇', color: '#b39ddb' },
  puppy: { id: 'puppy', name: '香那狗', emoji: '🐶', color: '#a7d8ff' },
  pudding: { id: 'pudding', name: '布丁狗', emoji: '🍮', color: '#ffcf5c' },
  penguin: { id: 'penguin', name: '波波企鵝', emoji: '🐧', color: '#7ec7ff' },
  frog: { id: 'frog', name: '呱呱蛙', emoji: '🐸', color: '#9ede6f' },
  bear: { id: 'bear', name: '可可熊', emoji: '🐻', color: '#d1a06a' },
  star: { id: 'star', name: '閃閃星', emoji: '⭐', color: '#ffd84d' },
  berry: { id: 'berry', name: '莓莓', emoji: '🍓', color: '#ff6b7a' },
}

export const ALL_IDS = Object.keys(CHARACTERS) as CharacterId[]

const Face = ({
  eyeY = 52,
  mouth = 'smile',
}: {
  eyeY?: number
  mouth?: 'smile' | 'open' | 'flat'
}) => (
  <g>
    <circle cx="40" cy={eyeY} r="4.5" fill="#3a2b2b" />
    <circle cx="60" cy={eyeY} r="4.5" fill="#3a2b2b" />
    <circle cx="38.5" cy={eyeY - 1.5} r="1.5" fill="#fff" />
    <circle cx="58.5" cy={eyeY - 1.5} r="1.5" fill="#fff" />
    <ellipse cx="30" cy={eyeY + 8} rx="5" ry="3.5" fill="#ff9dbb" opacity="0.75" />
    <ellipse cx="70" cy={eyeY + 8} rx="5" ry="3.5" fill="#ff9dbb" opacity="0.75" />
    {mouth === 'smile' && (
      <path d={`M46 ${eyeY + 10} Q50 ${eyeY + 15} 54 ${eyeY + 10}`} stroke="#3a2b2b" strokeWidth="2" fill="none" strokeLinecap="round" />
    )}
    {mouth === 'open' && (
      <ellipse cx="50" cy={eyeY + 12} rx="4" ry="5" fill="#e8637a" />
    )}
    {mouth === 'flat' && (
      <path d={`M46 ${eyeY + 12} L54 ${eyeY + 12}`} stroke="#3a2b2b" strokeWidth="2" fill="none" strokeLinecap="round" />
    )}
  </g>
)

export function CharacterArt({ id }: { id: CharacterId }) {
  switch (id) {
    case 'cat':
      return (
        <svg viewBox="0 0 100 100" role="img" aria-label="小奶貓">
          <path d="M28 34 L24 20 L40 30 Z" fill="#fff" stroke="#e0dede" strokeWidth="1.5" />
          <path d="M72 34 L76 20 L60 30 Z" fill="#fff" stroke="#e0dede" strokeWidth="1.5" />
          <circle cx="50" cy="55" r="30" fill="#ffffff" stroke="#e6e2e2" strokeWidth="1.5" />
          <Face />
          <path d="M50 58 L50 64 M50 64 Q44 66 42 63 M50 64 Q56 66 58 63" stroke="#c9a" strokeWidth="1.5" fill="none" opacity="0" />
          <g transform="translate(66,34)">
            <circle cx="0" cy="0" r="6" fill="#ff8aa8" />
            <circle cx="9" cy="-2" r="5" fill="#ff8aa8" />
            <circle cx="8" cy="5" r="5" fill="#ff8aa8" />
            <circle cx="4" cy="1" r="3" fill="#ffb3c7" />
          </g>
        </svg>
      )
    case 'bunny':
      return (
        <svg viewBox="0 0 100 100" role="img" aria-label="美露兔">
          <ellipse cx="38" cy="22" rx="7" ry="18" fill="#fff6f2" stroke="#f0d9d9" strokeWidth="1.5" />
          <ellipse cx="62" cy="22" rx="7" ry="18" fill="#fff6f2" stroke="#f0d9d9" strokeWidth="1.5" />
          <ellipse cx="38" cy="24" rx="3" ry="11" fill="#ffc0d3" />
          <ellipse cx="62" cy="24" rx="3" ry="11" fill="#ffc0d3" />
          <circle cx="50" cy="58" r="28" fill="#fff6f2" stroke="#f0d9d9" strokeWidth="1.5" />
          <Face eyeY={56} />
          <path d="M18 54 Q30 50 34 58" stroke="#ffb3d1" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      )
    case 'batbunny':
      return (
        <svg viewBox="0 0 100 100" role="img" aria-label="酷洛">
          <path d="M34 26 L30 6 L46 22 Z" fill="#3a3350" />
          <path d="M66 26 L70 6 L54 22 Z" fill="#3a3350" />
          <circle cx="50" cy="56" r="29" fill="#2f2a44" stroke="#241f36" strokeWidth="1.5" />
          <path d="M30 40 Q50 30 70 40 L70 48 Q50 42 30 48 Z" fill="#efe9f5" />
          <g>
            <circle cx="40" cy="54" r="4.5" fill="#fff" />
            <circle cx="60" cy="54" r="4.5" fill="#fff" />
            <circle cx="40" cy="54" r="2.4" fill="#221" />
            <circle cx="60" cy="54" r="2.4" fill="#221" />
            <path d="M46 64 Q50 68 54 64" stroke="#efe9f5" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
          <circle cx="66" cy="30" r="4" fill="#ff5c8a" />
        </svg>
      )
    case 'puppy':
      return (
        <svg viewBox="0 0 100 100" role="img" aria-label="香那狗">
          <ellipse cx="24" cy="52" rx="9" ry="22" fill="#dcefff" stroke="#bfe0f7" strokeWidth="1.5" />
          <ellipse cx="76" cy="52" rx="9" ry="22" fill="#dcefff" stroke="#bfe0f7" strokeWidth="1.5" />
          <circle cx="50" cy="52" r="28" fill="#ffffff" stroke="#e6eef5" strokeWidth="1.5" />
          <Face eyeY={50} />
          <ellipse cx="50" cy="60" rx="3.5" ry="2.6" fill="#8a6d5a" />
        </svg>
      )
    case 'pudding':
      return (
        <svg viewBox="0 0 100 100" role="img" aria-label="布丁狗">
          <ellipse cx="24" cy="56" rx="8" ry="16" fill="#e2a24a" />
          <ellipse cx="76" cy="56" rx="8" ry="16" fill="#e2a24a" />
          <circle cx="50" cy="56" r="28" fill="#ffd766" stroke="#eabf4d" strokeWidth="1.5" />
          <path d="M22 40 Q50 22 78 40 Q50 34 22 40 Z" fill="#8a5a2b" />
          <ellipse cx="50" cy="34" rx="8" ry="5" fill="#8a5a2b" />
          <Face eyeY={56} />
          <ellipse cx="50" cy="64" rx="3.2" ry="2.4" fill="#6b4a2b" />
        </svg>
      )
    case 'penguin':
      return (
        <svg viewBox="0 0 100 100" role="img" aria-label="波波企鵝">
          <ellipse cx="50" cy="54" rx="30" ry="33" fill="#8fd0ff" stroke="#6cbdf2" strokeWidth="1.5" />
          <ellipse cx="50" cy="60" rx="19" ry="23" fill="#fff" />
          <Face eyeY={48} mouth="flat" />
          <path d="M44 56 L56 56 L50 64 Z" fill="#ff9f3c" />
          <ellipse cx="26" cy="60" rx="6" ry="12" fill="#8fd0ff" />
          <ellipse cx="74" cy="60" rx="6" ry="12" fill="#8fd0ff" />
        </svg>
      )
    case 'frog':
      return (
        <svg viewBox="0 0 100 100" role="img" aria-label="呱呱蛙">
          <circle cx="34" cy="30" r="12" fill="#a6e77a" stroke="#89cf5c" strokeWidth="1.5" />
          <circle cx="66" cy="30" r="12" fill="#a6e77a" stroke="#89cf5c" strokeWidth="1.5" />
          <circle cx="34" cy="30" r="6" fill="#fff" />
          <circle cx="66" cy="30" r="6" fill="#fff" />
          <circle cx="34" cy="31" r="3" fill="#233" />
          <circle cx="66" cy="31" r="3" fill="#233" />
          <ellipse cx="50" cy="58" rx="30" ry="26" fill="#a6e77a" stroke="#89cf5c" strokeWidth="1.5" />
          <ellipse cx="38" cy="64" rx="5" ry="3.5" fill="#ff9dbb" opacity="0.7" />
          <ellipse cx="62" cy="64" rx="5" ry="3.5" fill="#ff9dbb" opacity="0.7" />
          <path d="M38 60 Q50 70 62 60" stroke="#3a5a2b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      )
    case 'bear':
      return (
        <svg viewBox="0 0 100 100" role="img" aria-label="可可熊">
          <circle cx="30" cy="32" r="10" fill="#caa06a" />
          <circle cx="70" cy="32" r="10" fill="#caa06a" />
          <circle cx="30" cy="32" r="5" fill="#a97e4a" />
          <circle cx="70" cy="32" r="5" fill="#a97e4a" />
          <circle cx="50" cy="56" r="29" fill="#d8b183" stroke="#c2985f" strokeWidth="1.5" />
          <ellipse cx="50" cy="62" rx="13" ry="10" fill="#f3e3cc" />
          <Face eyeY={52} />
          <ellipse cx="50" cy="60" rx="3.5" ry="2.6" fill="#5a3b22" />
        </svg>
      )
    case 'star':
      return (
        <svg viewBox="0 0 100 100" role="img" aria-label="閃閃星">
          <path d="M50 12 L61 40 L92 42 L67 61 L76 91 L50 73 L24 91 L33 61 L8 42 L39 40 Z" fill="#ffdd4d" stroke="#f2c93d" strokeWidth="1.5" strokeLinejoin="round" />
          <Face eyeY={52} />
        </svg>
      )
    case 'berry':
      return (
        <svg viewBox="0 0 100 100" role="img" aria-label="莓莓">
          <path d="M40 22 L50 30 L60 22 L58 34 L42 34 Z" fill="#6ec26e" />
          <path d="M50 30 C24 30 20 52 30 70 C38 84 62 84 70 70 C80 52 76 30 50 30 Z" fill="#ff5d6c" stroke="#e8455a" strokeWidth="1.5" />
          <g fill="#ffe08a">
            <circle cx="40" cy="50" r="1.6" /><circle cx="52" cy="46" r="1.6" /><circle cx="62" cy="52" r="1.6" />
            <circle cx="46" cy="60" r="1.6" /><circle cx="58" cy="62" r="1.6" /><circle cx="50" cy="70" r="1.6" />
          </g>
          <Face eyeY={54} />
        </svg>
      )
  }
}
