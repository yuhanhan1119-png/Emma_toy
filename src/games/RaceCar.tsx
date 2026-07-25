// Original animated race-car mascots (Sanrio-inspired, not official artwork).
// 大耳狗 (cinna): white long-eared puppy in a sky-blue car.
// 布丁狗 (pudding): golden pudding puppy with a brown beret in a yellow car.

export type Racer = 'cinna' | 'pudding'

export const RACERS: Record<Racer, { name: string; car: string; color: string }> = {
  cinna: { name: '大耳狗', car: '#8fd0ff', color: '#6cbdf2' },
  pudding: { name: '布丁狗', car: '#ffd766', color: '#eabf4d' },
}

function Wheels() {
  return (
    <g>
      <g className="wheel" style={{ transformOrigin: '32px 76px' }}>
        <circle cx="32" cy="76" r="12" fill="#333" />
        <circle cx="32" cy="76" r="5" fill="#ddd" />
        <rect x="30.5" y="66" width="3" height="20" fill="#aaa" />
        <rect x="22" y="74.5" width="20" height="3" fill="#aaa" />
      </g>
      <g className="wheel" style={{ transformOrigin: '88px 76px' }}>
        <circle cx="88" cy="76" r="12" fill="#333" />
        <circle cx="88" cy="76" r="5" fill="#ddd" />
        <rect x="86.5" y="66" width="3" height="20" fill="#aaa" />
        <rect x="78" y="74.5" width="20" height="3" fill="#aaa" />
      </g>
    </g>
  )
}

function CinnaHead() {
  return (
    <g className="driver-bob">
      <ellipse cx="46" cy="18" rx="6" ry="15" fill="#fff" stroke="#dbe9f5" strokeWidth="1" transform="rotate(-18 46 18)" />
      <ellipse cx="74" cy="18" rx="6" ry="15" fill="#fff" stroke="#dbe9f5" strokeWidth="1" transform="rotate(18 74 18)" />
      <ellipse cx="43" cy="10" rx="3.5" ry="6" fill="#9fd0f2" transform="rotate(-18 43 10)" />
      <ellipse cx="77" cy="10" rx="3.5" ry="6" fill="#9fd0f2" transform="rotate(18 77 10)" />
      <circle cx="60" cy="28" r="17" fill="#fff" stroke="#e6eef5" strokeWidth="1.2" />
      <circle cx="54" cy="26" r="2.6" fill="#3a2b2b" />
      <circle cx="66" cy="26" r="2.6" fill="#3a2b2b" />
      <ellipse cx="49" cy="31" rx="3" ry="2" fill="#ff9dbb" opacity="0.75" />
      <ellipse cx="71" cy="31" rx="3" ry="2" fill="#ff9dbb" opacity="0.75" />
      <path d="M57 31 Q60 34 63 31" stroke="#3a2b2b" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </g>
  )
}

function PuddingHead() {
  return (
    <g className="driver-bob">
      <ellipse cx="46" cy="26" rx="6" ry="11" fill="#e2a24a" transform="rotate(-20 46 26)" />
      <ellipse cx="74" cy="26" rx="6" ry="11" fill="#e2a24a" transform="rotate(20 74 26)" />
      <circle cx="60" cy="28" r="17" fill="#ffd766" stroke="#eabf4d" strokeWidth="1.2" />
      <path d="M44 20 Q60 6 76 20 Q60 15 44 20 Z" fill="#8a5a2b" />
      <ellipse cx="60" cy="15" rx="5" ry="3" fill="#8a5a2b" />
      <circle cx="54" cy="27" r="2.6" fill="#3a2b2b" />
      <circle cx="66" cy="27" r="2.6" fill="#3a2b2b" />
      <ellipse cx="49" cy="31" rx="3" ry="2" fill="#ff9dbb" opacity="0.7" />
      <ellipse cx="71" cy="31" rx="3" ry="2" fill="#ff9dbb" opacity="0.7" />
      <ellipse cx="60" cy="33" rx="2.4" ry="1.8" fill="#6b4a2b" />
    </g>
  )
}

export function RaceCarArt({ racer }: { racer: Racer }) {
  const c = RACERS[racer]
  return (
    <svg viewBox="0 0 120 92" role="img" aria-label={c.name}>
      <ellipse cx="60" cy="86" rx="46" ry="6" fill="rgba(0,0,0,0.12)" />
      <Wheels />
      {/* car body */}
      <path
        d="M14 66 Q10 50 26 48 L40 48 Q48 40 60 40 Q72 40 80 48 L94 48 Q110 50 106 66 Q108 74 96 74 L24 74 Q12 74 14 66 Z"
        fill={c.car}
        stroke={c.color}
        strokeWidth="2"
      />
      <path d="M46 48 Q52 43 60 43 Q68 43 74 48 Z" fill="#eafaff" opacity="0.9" />
      <rect x="20" y="62" width="80" height="5" rx="2.5" fill="rgba(255,255,255,0.5)" />
      <circle cx="24" cy="60" r="3.5" fill="#fff6c2" stroke="#f0d24a" />
      {racer === 'cinna' ? <CinnaHead /> : <PuddingHead />}
    </svg>
  )
}
