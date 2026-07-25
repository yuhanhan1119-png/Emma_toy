import { useMemo } from 'react'

export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter']

export const SEASON_INFO: Record<
  Season,
  { label: string; slope: string; slopeDark: string; particle: string; sky: string }
> = {
  spring: { label: '富士市 · 春', slope: '#8ec96f', slopeDark: '#6fae53', particle: '🌸', sky: 'linear-gradient(180deg,#ffe3ef 0%,#d9f0ff 60%)' },
  summer: { label: '富士市 · 夏', slope: '#3fa15a', slopeDark: '#2f7e45', particle: '☀️', sky: 'linear-gradient(180deg,#a7e9ff 0%,#7fd0ff 60%)' },
  autumn: { label: '富士市 · 秋', slope: '#cf9142', slopeDark: '#a86f2c', particle: '🍁', sky: 'linear-gradient(180deg,#ffdcae 0%,#ffc98f 60%)' },
  winter: { label: '富士市 · 冬', slope: '#e7eef7', slopeDark: '#c7d6e6', particle: '❄️', sky: 'linear-gradient(180deg,#eaf4ff 0%,#d3e6f8 60%)' },
}

export function FujiScene({ season }: { season: Season }) {
  const info = SEASON_INFO[season]

  const particles = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 6,
        dur: 5 + Math.random() * 6,
        size: 14 + Math.random() * 16,
      })),
    // regenerate positions when season changes
    [season],
  )

  return (
    <div className="fuji-scene" style={{ background: info.sky }}>
      <div className="season-badge">{info.label}</div>

      {/* sun / moon */}
      <div className="fuji-sun" />

      {/* Mt. Fuji */}
      <svg className="fuji-mtn" viewBox="0 0 400 180" preserveAspectRatio="xMidYMax meet">
        <path d="M0 180 L150 40 Q200 0 250 40 L400 180 Z" fill={info.slope} />
        <path d="M0 180 L150 40 Q200 0 250 40 L400 180 Z" fill={info.slopeDark} opacity="0.25" transform="translate(6,0)" />
        {/* snow cap */}
        <path d="M150 40 Q200 0 250 40 L232 62 Q222 52 214 60 Q206 50 198 60 Q190 50 182 60 Q174 52 168 62 Z" fill="#ffffff" />
        <path d="M168 62 L172 74 M198 60 L200 76 M214 60 L220 74" stroke="#eaf2ff" strokeWidth="3" fill="none" opacity="0.8" />
      </svg>

      {/* rolling hills at the base */}
      <div className="fuji-hills" style={{ background: info.slopeDark }} />

      {/* seasonal particles */}
      <div className="fuji-particles">
        {particles.map((p) => (
          <span
            key={p.id}
            className="particle"
            style={{
              left: `${p.left}%`,
              fontSize: p.size,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
            }}
          >
            {info.particle}
          </span>
        ))}
      </div>
    </div>
  )
}
