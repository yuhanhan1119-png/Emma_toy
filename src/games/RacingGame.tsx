import { useCallback, useEffect, useRef, useState } from 'react'
import { RaceCarArt, RACERS, type Racer } from './RaceCar'

type Phase = 'setup' | 'countdown' | 'racing' | 'result'
type Mode = 'cpu' | '2p'

const FINISH = 100 // race distance (percent)
const BASE = 4.2 // % per second
const STEER = 0.9 // horizontal units per second
const CAR_Y = 0.82
const HIT_X = 0.12
const HIT_Y = 0.06

interface Entity {
  id: number
  type: 'cone' | 'boost'
  x: number
  y: number
  hit: boolean
}

interface Lane {
  x: number
  dist: number
  boostT: number
  slowT: number
  entities: Entity[]
  spawnT: number
  gifts: number
  nextId: number
  speed: number
}

function freshLane(offset: number): Lane {
  return {
    x: 0.5,
    dist: 0,
    boostT: 0,
    slowT: 0,
    entities: [],
    spawnT: offset,
    gifts: 0,
    nextId: 1,
    speed: BASE,
  }
}

// Advance one lane by dt seconds given a steering input (-1,0,1).
function stepLane(lane: Lane, steer: number, dt: number) {
  lane.x = Math.max(0.08, Math.min(0.92, lane.x + steer * STEER * dt))

  if (lane.boostT > 0) lane.boostT -= dt
  if (lane.slowT > 0) lane.slowT -= dt
  let speed = BASE
  if (lane.boostT > 0) speed += 3.2
  if (lane.slowT > 0) speed *= 0.45
  lane.speed = speed
  lane.dist += speed * dt

  const flow = 0.6 * (speed / BASE)
  for (const e of lane.entities) e.y += flow * dt
  lane.entities = lane.entities.filter((e) => e.y < 1.15)

  lane.spawnT -= dt
  if (lane.spawnT <= 0) {
    lane.spawnT = 0.66
    lane.entities.push({
      id: lane.nextId++,
      type: Math.random() < 0.56 ? 'cone' : 'boost',
      x: 0.12 + Math.random() * 0.76,
      y: -0.12,
      hit: false,
    })
  }

  for (const e of lane.entities) {
    if (e.hit) continue
    if (Math.abs(e.y - CAR_Y) < HIT_Y && Math.abs(e.x - lane.x) < HIT_X) {
      e.hit = true
      if (e.type === 'boost') {
        lane.boostT = 2.0
        lane.dist += 2.2
        lane.gifts += 1
      } else {
        lane.slowT = 0.9
        lane.dist = Math.max(0, lane.dist - 1.6)
      }
    }
  }
}

// Simple CPU steering: chase the nearest gift ahead, dodge the nearest cone.
function cpuSteer(lane: Lane): number {
  let target: Entity | null = null
  let best = Infinity
  for (const e of lane.entities) {
    if (e.hit) continue
    if (e.y > 0.3 && e.y < CAR_Y) {
      const d = CAR_Y - e.y
      if (d < best) {
        best = d
        target = e
      }
    }
  }
  if (!target) return 0
  const dir = target.x > lane.x ? 1 : -1
  if (target.type === 'boost') return Math.abs(target.x - lane.x) > 0.03 ? dir : 0
  // cone: steer away
  return Math.abs(target.x - lane.x) < 0.2 ? -dir : 0
}

export default function RacingGame({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>('setup')
  const [p1char, setP1char] = useState<Racer>('cinna')
  const [mode, setMode] = useState<Mode>('cpu')
  const [count, setCount] = useState(3)
  const [, setFrame] = useState(0)
  const [winner, setWinner] = useState<'A' | 'B'>('A')

  const laneA = useRef<Lane>(freshLane(0.3))
  const laneB = useRef<Lane>(freshLane(0.55))
  const keysA = useRef({ left: false, right: false })
  const keysB = useRef({ left: false, right: false })
  const modeRef = useRef<Mode>(mode)
  const rafRef = useRef<number | null>(null)
  const lastT = useRef(0)

  modeRef.current = mode
  const p2char: Racer = p1char === 'cinna' ? 'pudding' : 'cinna'

  // Keyboard controls
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key
      if (k === 'a' || k === 'A') keysA.current.left = true
      if (k === 'd' || k === 'D') keysA.current.right = true
      if (k === 'ArrowLeft') {
        if (modeRef.current === '2p') keysB.current.left = true
        else keysA.current.left = true
      }
      if (k === 'ArrowRight') {
        if (modeRef.current === '2p') keysB.current.right = true
        else keysA.current.right = true
      }
    }
    const up = (e: KeyboardEvent) => {
      const k = e.key
      if (k === 'a' || k === 'A') keysA.current.left = false
      if (k === 'd' || k === 'D') keysA.current.right = false
      if (k === 'ArrowLeft') {
        keysB.current.left = false
        keysA.current.left = false
      }
      if (k === 'ArrowRight') {
        keysB.current.right = false
        keysA.current.right = false
      }
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  // Countdown
  useEffect(() => {
    if (phase !== 'countdown') return
    setCount(3)
    let n = 3
    const iv = setInterval(() => {
      n -= 1
      if (n <= 0) {
        clearInterval(iv)
        setPhase('racing')
      } else setCount(n)
    }, 800)
    return () => clearInterval(iv)
  }, [phase])

  // Game loop
  useEffect(() => {
    if (phase !== 'racing') return
    lastT.current = performance.now()

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - lastT.current) / 1000)
      lastT.current = now

      const a = laneA.current
      const b = laneB.current

      const steerA = (keysA.current.left ? -1 : 0) + (keysA.current.right ? 1 : 0)
      stepLane(a, steerA, dt)

      const steerB =
        modeRef.current === '2p'
          ? (keysB.current.left ? -1 : 0) + (keysB.current.right ? 1 : 0)
          : cpuSteer(b)
      stepLane(b, steerB, dt)

      if (a.dist >= FINISH || b.dist >= FINISH) {
        setWinner(a.dist >= b.dist ? 'A' : 'B')
        setPhase('result')
        return
      }

      setFrame((f) => (f + 1) % 1000000)
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [phase])

  const start = useCallback(() => {
    laneA.current = freshLane(0.3)
    laneB.current = freshLane(0.55)
    keysA.current = { left: false, right: false }
    keysB.current = { left: false, right: false }
    setPhase('countdown')
  }, [])

  if (phase === 'setup') {
    return (
      <Setup
        p1char={p1char}
        mode={mode}
        onPickChar={setP1char}
        onPickMode={setMode}
        onStart={start}
        onExit={onExit}
      />
    )
  }

  if (phase === 'result') {
    const humanWon = winner === 'A'
    return (
      <RaceResult
        mode={mode}
        winner={winner}
        p1char={p1char}
        p2char={p2char}
        humanWon={humanWon}
        giftsA={laneA.current.gifts}
        giftsB={laneB.current.gifts}
        onReplay={start}
        onExit={onExit}
      />
    )
  }

  const a = laneA.current
  const b = laneB.current
  const labelA = mode === '2p' ? '1P' : '你'
  const labelB = mode === '2p' ? '2P' : '電腦'

  return (
    <main className="screen play">
      <div className="hud">
        <div className="hud-left">
          <button className="pill pill-back" onClick={onExit}>← 選單</button>
          <div className="pill pill-level">{mode === '2p' ? '雙人對戰' : '單人對電腦'}</div>
        </div>
        <div className="race-progress">
          <ProgressBar racer={p1char} pct={(a.dist / FINISH) * 100} label={labelA} />
          <ProgressBar racer={p2char} pct={(b.dist / FINISH) * 100} label={labelB} />
        </div>
      </div>

      <div className="board-wrap">
        <div className="track track-split">
          <LaneView racer={p1char} lane={a} label={`${labelA}｜${RACERS[p1char].name}`} />
          <div className="lane-divider" />
          <LaneView racer={p2char} lane={b} label={`${labelB}｜${RACERS[p2char].name}`} cpu={mode === 'cpu'} />
          {phase === 'countdown' && <div className="countdown">{count}</div>}
        </div>

        <div className="steer-panel">
          <div className="steer-group">
            <span className="steer-owner">{labelA}（A / D）</span>
            <div className="steer-btns">
              <button
                className="btn steer-btn"
                onPointerDown={() => (keysA.current.left = true)}
                onPointerUp={() => (keysA.current.left = false)}
                onPointerLeave={() => (keysA.current.left = false)}
              >◀</button>
              <button
                className="btn steer-btn"
                onPointerDown={() => (keysA.current.right = true)}
                onPointerUp={() => (keysA.current.right = false)}
                onPointerLeave={() => (keysA.current.right = false)}
              >▶</button>
            </div>
          </div>

          {mode === '2p' && (
            <div className="steer-group">
              <span className="steer-owner">{labelB}（← / →）</span>
              <div className="steer-btns">
                <button
                  className="btn steer-btn"
                  onPointerDown={() => (keysB.current.left = true)}
                  onPointerUp={() => (keysB.current.left = false)}
                  onPointerLeave={() => (keysB.current.left = false)}
                >◀</button>
                <button
                  className="btn steer-btn"
                  onPointerDown={() => (keysB.current.right = true)}
                  onPointerUp={() => (keysB.current.right = false)}
                  onPointerLeave={() => (keysB.current.right = false)}
                >▶</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function LaneView({
  racer,
  lane,
  label,
  cpu,
}: {
  racer: Racer
  lane: Lane
  label: string
  cpu?: boolean
}) {
  return (
    <div className="lane">
      <div className="lane-label">{label}{cpu ? ' 🤖' : ''}</div>
      <div
        className="lane-lines"
        style={{ animationDuration: `${1.2 / (lane.speed / BASE)}s` }}
      />
      {lane.entities.map((e) => (
        <div
          key={e.id}
          className={`track-item ${e.type} ${e.hit ? 'consumed' : ''}`}
          style={{ left: `${e.x * 100}%`, top: `${e.y * 100}%` }}
        >
          {e.type === 'cone' ? '🚧' : '🎁'}
        </div>
      ))}
      <div
        className={`race-car player-car ${lane.boostT > 0 ? 'boosting' : ''} ${lane.slowT > 0 ? 'slowed' : ''}`}
        style={{ left: `${lane.x * 100}%`, top: `${CAR_Y * 100}%` }}
      >
        <RaceCarArt racer={racer} />
        {lane.boostT > 0 && <span className="boost-flame">💨</span>}
      </div>
    </div>
  )
}

function ProgressBar({ racer, pct, label }: { racer: Racer; pct: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, pct))
  return (
    <div className="prog">
      <span className="prog-label">{label}</span>
      <div className="prog-track">
        <div className="prog-fill" style={{ width: `${clamped}%`, background: racer === 'cinna' ? '#8fd0ff' : '#ffd766' }} />
        <div className="prog-marker" style={{ left: `${clamped}%` }}>
          <RaceCarArt racer={racer} />
        </div>
        <span className="prog-flag">🏁</span>
      </div>
    </div>
  )
}

function Setup({
  p1char,
  mode,
  onPickChar,
  onPickMode,
  onStart,
  onExit,
}: {
  p1char: Racer
  mode: Mode
  onPickChar: (r: Racer) => void
  onPickMode: (m: Mode) => void
  onStart: () => void
  onExit: () => void
}) {
  const p2char: Racer = p1char === 'cinna' ? 'pudding' : 'cinna'
  return (
    <main className="screen center card-pop">
      <div className="hero">
        <h1>🏁 可愛賽車大賽</h1>

        <h3 className="setup-h">① 選擇你的選手</h3>
        <div className="racer-pick">
          {(['cinna', 'pudding'] as Racer[]).map((r) => (
            <button
              key={r}
              className={`racer-card ${p1char === r ? 'selected' : ''}`}
              onClick={() => onPickChar(r)}
            >
              <div className="racer-art"><RaceCarArt racer={r} /></div>
              <span className="racer-name">{RACERS[r].name}</span>
            </button>
          ))}
        </div>

        <h3 className="setup-h">② 選擇對戰模式</h3>
        <div className="mode-pick">
          <button
            className={`mode-card ${mode === 'cpu' ? 'selected' : ''}`}
            onClick={() => onPickMode('cpu')}
          >
            <span className="mode-emoji">🤖</span>
            <span className="mode-title">單人對電腦</span>
            <span className="mode-desc">你操控 {RACERS[p1char].name}，電腦操控 {RACERS[p2char].name}</span>
          </button>
          <button
            className={`mode-card ${mode === '2p' ? 'selected' : ''}`}
            onClick={() => onPickMode('2p')}
          >
            <span className="mode-emoji">👥</span>
            <span className="mode-title">雙人對戰</span>
            <span className="mode-desc">1P 用 A / D，2P 用 ← / → 同場競速</span>
          </button>
        </div>

        <div className="result-actions setup-actions">
          <button className="btn btn-primary btn-lg" onClick={onStart}>遊戲開始</button>
          <button className="btn btn-ghost" onClick={onExit}>← 返回選單</button>
        </div>
      </div>
    </main>
  )
}

function RaceResult({
  mode,
  winner,
  p1char,
  p2char,
  humanWon,
  giftsA,
  giftsB,
  onReplay,
  onExit,
}: {
  mode: Mode
  winner: 'A' | 'B'
  p1char: Racer
  p2char: Racer
  humanWon: boolean
  giftsA: number
  giftsB: number
  onReplay: () => void
  onExit: () => void
}) {
  const title =
    mode === '2p'
      ? winner === 'A'
        ? '🏆 1P 獲勝！'
        : '🏆 2P 獲勝！'
      : humanWon
        ? '🏆 你贏了！'
        : '😤 電腦先到終點了！'
  const emoji = mode === 'cpu' && !humanWon ? '😤' : '🏆'
  return (
    <main className="screen center card-pop">
      <div className="result">
        <div className="result-emoji">{emoji}</div>
        <h1>{title}</h1>
        <div className="result-cars">
          <div className={`result-car ${winner === 'A' ? 'winner' : ''}`}>
            <RaceCarArt racer={p1char} />
            <span>{mode === '2p' ? '1P' : '你'}｜{RACERS[p1char].name}</span>
            <span className="result-gift">🎁 {giftsA}</span>
          </div>
          <div className={`result-car ${winner === 'B' ? 'winner' : ''}`}>
            <RaceCarArt racer={p2char} />
            <span>{mode === '2p' ? '2P' : '電腦'}｜{RACERS[p2char].name}</span>
            <span className="result-gift">🎁 {giftsB}</span>
          </div>
        </div>
        <div className="result-actions">
          <button className="btn btn-primary btn-lg" onClick={onReplay}>再比一次</button>
          <button className="btn btn-ghost" onClick={onExit}>返回選單</button>
        </div>
      </div>
    </main>
  )
}
