import { useCallback, useEffect, useMemo, useState } from 'react'
import { CHARACTERS, CharacterArt, type CharacterId } from '../characters'
import { LEVELS, TOTAL_LEVELS } from '../levels'
import { generateScene, type PlacedSprite } from '../scene'

type Phase = 'start' | 'playing' | 'levelComplete' | 'timeUp' | 'win'

const WRONG_PENALTY_SEC = 3
const FIND_POINTS = 100
const TIME_BONUS_PER_SEC = 5

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function SeekGame({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>('start')
  const [levelIndex, setLevelIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [sprites, setSprites] = useState<PlacedSprite[]>([])
  const [timeLeft, setTimeLeft] = useState(180)
  const [miss, setMiss] = useState<{ x: number; y: number; key: number } | null>(null)
  const [lastEarnedBonus, setLastEarnedBonus] = useState(0)

  const cfg = LEVELS[levelIndex]

  const startLevel = useCallback((idx: number) => {
    const c = LEVELS[idx]
    setLevelIndex(idx)
    setSprites(generateScene(c))
    setTimeLeft(c.timeSeconds)
    setPhase('playing')
  }, [])

  const startGame = useCallback(() => {
    setScore(0)
    startLevel(0)
  }, [startLevel])

  useEffect(() => {
    if (phase !== 'playing') return
    if (timeLeft <= 0) {
      setPhase('timeUp')
      return
    }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, timeLeft])

  const remainingByTarget = useMemo(() => {
    const map = new Map<CharacterId, { total: number; remaining: number }>()
    for (const t of cfg.targets) map.set(t.id, { total: t.count, remaining: 0 })
    for (const s of sprites) {
      if (s.isTarget) {
        const e = map.get(s.id)
        if (e && !s.found) e.remaining += 1
      }
    }
    return map
  }, [sprites, cfg])

  const totalRemaining = useMemo(
    () => sprites.filter((s) => s.isTarget && !s.found).length,
    [sprites],
  )

  const handleSpriteClick = useCallback(
    (sprite: PlacedSprite, e: React.MouseEvent) => {
      e.stopPropagation()
      if (phase !== 'playing') return
      if (sprite.isTarget && !sprite.found) {
        setSprites((prev) => {
          const next = prev.map((s) =>
            s.key === sprite.key ? { ...s, found: true } : s,
          )
          const remaining = next.filter((s) => s.isTarget && !s.found).length
          if (remaining === 0) {
            setTimeout(() => {
              setTimeLeft((tl) => {
                const bonus = tl * TIME_BONUS_PER_SEC
                setLastEarnedBonus(bonus)
                setScore((sc) => sc + bonus)
                return tl
              })
              setPhase(levelIndex + 1 >= TOTAL_LEVELS ? 'win' : 'levelComplete')
            }, 220)
          }
          return next
        })
        setScore((sc) => sc + FIND_POINTS)
      } else if (!sprite.isTarget) {
        setTimeLeft((v) => Math.max(0, v - WRONG_PENALTY_SEC))
        setScore((sc) => Math.max(0, sc - 20))
        setMiss({ x: sprite.x, y: sprite.y, key: Date.now() })
      }
    },
    [phase, levelIndex],
  )

  const nextLevel = useCallback(() => startLevel(levelIndex + 1), [levelIndex, startLevel])
  const retryLevel = useCallback(() => startLevel(levelIndex), [levelIndex, startLevel])

  return (
    <>
      {phase === 'start' && <StartScreen onStart={startGame} onExit={onExit} />}

      {phase === 'win' && (
        <ResultScreen kind="win" score={score} onPrimary={startGame} onSecondary={onExit} />
      )}

      {phase === 'timeUp' && (
        <ResultScreen
          kind="timeUp"
          level={cfg.level}
          score={score}
          onPrimary={retryLevel}
          onSecondary={onExit}
        />
      )}

      {phase === 'levelComplete' && (
        <ResultScreen
          kind="levelComplete"
          level={cfg.level}
          score={score}
          bonus={lastEarnedBonus}
          onPrimary={nextLevel}
        />
      )}

      {phase === 'playing' && (
        <Playing
          cfg={cfg}
          timeLeft={timeLeft}
          score={score}
          sprites={sprites}
          totalRemaining={totalRemaining}
          remainingByTarget={remainingByTarget}
          miss={miss}
          onSpriteClick={handleSpriteClick}
          onExit={onExit}
        />
      )}
    </>
  )
}

function StartScreen({ onStart, onExit }: { onStart: () => void; onExit: () => void }) {
  return (
    <main className="screen center card-pop">
      <div className="hero">
        <div className="hero-row">
          {(['cinna', 'cinnaBow', 'purin', 'purinGlasses', 'cinnaStar'] as CharacterId[]).map((id) => (
            <div key={id} className="hero-char" title={CHARACTERS[id].name}>
              <CharacterArt id={id} />
            </div>
          ))}
        </div>
        <h1>尋找可愛夥伴</h1>
        <p className="lead">
          在滿滿的可愛角色中，找出指定的夥伴吧！
          <br />
          共 <b>{TOTAL_LEVELS}</b> 關，每關 <b>3 分鐘</b>，越後面越難喔～
        </p>
        <ul className="rules">
          <li>👀 依照上方提示，點擊畫面中指定的角色</li>
          <li>⏱️ 每關限時 3:00，找齊全部目標即可過關</li>
          <li>❌ 點錯會扣 {WRONG_PENALTY_SEC} 秒，小心看清楚！</li>
          <li>⭐ 剩餘時間越多，過關獎勵分數越高</li>
        </ul>
        <div className="result-actions">
          <button className="btn btn-primary btn-lg" onClick={onStart}>開始遊戲</button>
          <button className="btn btn-ghost" onClick={onExit}>← 返回選單</button>
        </div>
      </div>
    </main>
  )
}

function Playing({
  cfg,
  timeLeft,
  score,
  sprites,
  totalRemaining,
  remainingByTarget,
  miss,
  onSpriteClick,
  onExit,
}: {
  cfg: (typeof LEVELS)[number]
  timeLeft: number
  score: number
  sprites: PlacedSprite[]
  totalRemaining: number
  remainingByTarget: Map<CharacterId, { total: number; remaining: number }>
  miss: { x: number; y: number; key: number } | null
  onSpriteClick: (s: PlacedSprite, e: React.MouseEvent) => void
  onExit: () => void
}) {
  const low = timeLeft <= 20

  return (
    <main className="screen play">
      <div className="hud">
        <div className="hud-left">
          <button className="pill pill-back" onClick={onExit}>← 選單</button>
          <div className="pill pill-level">{cfg.name} / {TOTAL_LEVELS}</div>
          <div className={`pill pill-time ${low ? 'time-low' : ''}`}>⏱️ {formatTime(timeLeft)}</div>
          <div className="pill pill-score">⭐ {score}</div>
        </div>
        <div className="find-panel">
          <span className="find-label">尋找：</span>
          {cfg.targets.map((t) => {
            const info = remainingByTarget.get(t.id)!
            const done = info.remaining === 0
            return (
              <div key={t.id} className={`find-chip ${done ? 'done' : ''}`}>
                <div className="find-art">
                  <CharacterArt id={t.id} />
                </div>
                <div className="find-meta">
                  <span className="find-name">{CHARACTERS[t.id].name}</span>
                  <span className="find-count">
                    {done ? '✔ 完成' : `剩 ${info.remaining} / ${info.total}`}
                  </span>
                </div>
              </div>
            )
          })}
          <div className="find-total">還剩 {totalRemaining} 個</div>
        </div>
      </div>

      <div className="board-wrap">
        <div className="board" style={{ background: cfg.background }}>
          {sprites.map((s) => (
            <button
              key={s.key}
              className={`sprite ${s.found ? 'found' : ''}`}
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.size,
                height: s.size,
                zIndex: s.found ? 2000 : s.z,
                transform: `translate(-50%,-50%) rotate(${s.rotation}deg)`,
              }}
              onClick={(e) => onSpriteClick(s, e)}
              aria-label={s.isTarget ? '目標角色' : '角色'}
            >
              <CharacterArt id={s.id} />
              {s.found && <span className="found-mark">✔</span>}
            </button>
          ))}
          {miss && (
            <span
              key={miss.key}
              className="miss-mark"
              style={{ left: `${miss.x}%`, top: `${miss.y}%` }}
            >
              ✖ -{WRONG_PENALTY_SEC}s
            </span>
          )}
        </div>
      </div>
    </main>
  )
}

function ResultScreen({
  kind,
  level,
  score,
  bonus,
  onPrimary,
  onSecondary,
}: {
  kind: 'win' | 'timeUp' | 'levelComplete'
  level?: number
  score: number
  bonus?: number
  onPrimary: () => void
  onSecondary?: () => void
}) {
  const title =
    kind === 'win' ? '🎉 全部通關！' : kind === 'timeUp' ? '⏰ 時間到！' : `✨ 第 ${level} 關完成！`
  const emoji = kind === 'timeUp' ? '😿' : '🎊'
  return (
    <main className="screen center card-pop">
      <div className="result">
        <div className="result-emoji">{emoji}</div>
        <h1>{title}</h1>
        {kind === 'levelComplete' && (
          <p className="lead">時間獎勵 +{bonus} 分！準備好下一關了嗎？</p>
        )}
        {kind === 'win' && <p className="lead">你找齊了全部 {TOTAL_LEVELS} 關的夥伴，太厲害了！</p>}
        {kind === 'timeUp' && <p className="lead">別灰心，再挑戰一次這一關吧！</p>}
        <div className="score-big">總分 ⭐ {score}</div>
        <div className="result-actions">
          <button className="btn btn-primary btn-lg" onClick={onPrimary}>
            {kind === 'win' ? '再玩一次' : kind === 'timeUp' ? '重試本關' : '下一關 →'}
          </button>
          {onSecondary && (
            <button className="btn btn-ghost" onClick={onSecondary}>
              返回選單
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
