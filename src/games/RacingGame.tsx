import { useCallback, useEffect, useRef, useState } from 'react'
import { RaceCarArt, RACERS, CAR_TYPES, type Racer, type CarType } from './RaceCar'
import { FujiScene, SEASONS, type Season } from './FujiScene'

type Phase = 'setup' | 'countdown' | 'racing' | 'result'
type Mode = 'cpu' | '2p'
type SetupStep = 'main' | 'car'

const FINISH = 170 // race distance
const BASE = 2.6 // % per second auto-cruise (car moves without holding accel)
const CPU_CRUISE = 0.6 // CPU cruises slower so the game stays beginner-friendly/winnable
const STEER = 0.9
const CAR_Y = 0.82
const HIT_X = 0.12
const HIT_Y = 0.06
const RACE_SECONDS = 180 // 3-minute cap; first to finish (or ahead at 0) wins

const FRUITS = ['🍓', '🍎', '🍊', '🍇', '🍑', '🍉', '🍌', '🍒', '🥝']
const OBSTACLES = ['🚧', '🪨', '🛢️', '⚠️']

interface Entity {
  id: number
  type: 'fruit' | 'cone'
  emoji: string
  x: number
  y: number
  hit: boolean
}

interface Lane {
  x: number
  dist: number
  boostT: number
  slowT: number
  spinT: number
  hits: number
  entities: Entity[]
  spawnT: number
  gifts: number
  nextId: number
  speed: number
}

interface Keys {
  left: boolean
  right: boolean
  accel: boolean
  brake: boolean
}

function freshLane(offset: number): Lane {
  return {
    x: 0.5,
    dist: 0,
    boostT: 0,
    slowT: 0,
    spinT: 0,
    hits: 0,
    entities: [],
    spawnT: offset,
    gifts: 0,
    nextId: 1,
    speed: BASE,
  }
}

function stepLane(lane: Lane, steer: number, accel: boolean, brake: boolean, dt: number, speedMul = 1) {
  lane.x = Math.max(0.08, Math.min(0.92, lane.x + steer * STEER * dt))

  if (lane.boostT > 0) lane.boostT -= dt
  if (lane.slowT > 0) lane.slowT -= dt
  if (lane.spinT > 0) lane.spinT -= dt

  let speed = BASE * speedMul
  if (accel) speed *= 1.8
  if (brake) speed *= 0.45
  if (lane.boostT > 0) speed *= 1.5 // fruit transform boost
  if (lane.slowT > 0) speed *= 0.5 // obstacle slow-down
  lane.speed = speed
  lane.dist += speed * dt

  const flow = 0.62 * (speed / BASE)
  for (const e of lane.entities) e.y += flow * dt
  lane.entities = lane.entities.filter((e) => e.y < 1.15)

  lane.spawnT -= dt
  if (lane.spawnT <= 0) {
    lane.spawnT = 0.55
    const isFruit = Math.random() < 0.5
    lane.entities.push({
      id: lane.nextId++,
      type: isFruit ? 'fruit' : 'cone',
      emoji: isFruit
        ? FRUITS[Math.floor(Math.random() * FRUITS.length)]
        : OBSTACLES[Math.floor(Math.random() * OBSTACLES.length)],
      x: 0.12 + Math.random() * 0.76,
      y: -0.12,
      hit: false,
    })
  }

  for (const e of lane.entities) {
    if (e.hit) continue
    if (Math.abs(e.y - CAR_Y) < HIT_Y && Math.abs(e.x - lane.x) < HIT_X) {
      e.hit = true
      if (e.type === 'fruit') {
        lane.boostT = 3.0 // score + transform-boost 3s (no free distance)
        lane.gifts += 1
      } else {
        lane.slowT = 2.0 // slow 2s
        lane.spinT = 0.5 // spin-out feedback
        lane.hits += 1
      }
    }
  }
}

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
  if (target.type === 'fruit') return Math.abs(target.x - lane.x) > 0.03 ? dir : 0
  return Math.abs(target.x - lane.x) < 0.2 ? -dir : 0
}

export default function RacingGame({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>('setup')
  const [step, setStep] = useState<SetupStep>('main')
  const [p1char, setP1char] = useState<Racer>('cinna')
  const [mode, setMode] = useState<Mode>('cpu')
  const [carA, setCarA] = useState<CarType>('toyota')
  const [count, setCount] = useState(3)
  const [, setFrame] = useState(0)
  const [winner, setWinner] = useState<'A' | 'B'>('A')
  const [season, setSeason] = useState<Season>('spring')

  const laneA = useRef<Lane>(freshLane(0.3))
  const laneB = useRef<Lane>(freshLane(0.55))
  const keysA = useRef<Keys>({ left: false, right: false, accel: false, brake: false })
  const keysB = useRef<Keys>({ left: false, right: false, accel: false, brake: false })
  const modeRef = useRef<Mode>(mode)
  const rafRef = useRef<number | null>(null)
  const lastT = useRef(0)
  const raceLeft = useRef(RACE_SECONDS)

  modeRef.current = mode
  const p2char: Racer = p1char === 'cinna' ? 'pudding' : 'cinna'
  const carOrder: CarType[] = ['toyota', 'mazda', 'honda']
  const carB: CarType = carOrder[(carOrder.indexOf(carA) + 1) % carOrder.length]

  // Keyboard controls
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageDown'].includes(k)) e.preventDefault()
      // 1P (arrows)
      if (k === 'ArrowLeft') keysA.current.left = true
      if (k === 'ArrowRight') keysA.current.right = true
      if (k === 'ArrowDown') keysA.current.accel = true
      if (k === 'PageDown') keysA.current.brake = true
      // 2P (WASD-style) only in 2p mode
      if (modeRef.current === '2p') {
        if (k === 'a' || k === 'A') keysB.current.left = true
        if (k === 'd' || k === 'D') keysB.current.right = true
        if (k === 's' || k === 'S') keysB.current.accel = true
        if (k === 'x' || k === 'X') keysB.current.brake = true
      }
    }
    const up = (e: KeyboardEvent) => {
      const k = e.key
      if (k === 'ArrowLeft') keysA.current.left = false
      if (k === 'ArrowRight') keysA.current.right = false
      if (k === 'ArrowDown') keysA.current.accel = false
      if (k === 'PageDown') keysA.current.brake = false
      if (k === 'a' || k === 'A') keysB.current.left = false
      if (k === 'd' || k === 'D') keysB.current.right = false
      if (k === 's' || k === 'S') keysB.current.accel = false
      if (k === 'x' || k === 'X') keysB.current.brake = false
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

  // Season cycling while racing (streetscape keeps changing)
  useEffect(() => {
    if (phase !== 'racing') return
    const iv = setInterval(() => {
      setSeason((s) => SEASONS[(SEASONS.indexOf(s) + 1) % SEASONS.length])
    }, 9000)
    return () => clearInterval(iv)
  }, [phase])

  // Game loop
  useEffect(() => {
    if (phase !== 'racing') return
    lastT.current = performance.now()

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - lastT.current) / 1000)
      lastT.current = now
      raceLeft.current = Math.max(0, raceLeft.current - dt)

      const a = laneA.current
      const b = laneB.current

      const steerA = (keysA.current.left ? -1 : 0) + (keysA.current.right ? 1 : 0)
      stepLane(a, steerA, keysA.current.accel, keysA.current.brake, dt, 1)

      if (modeRef.current === '2p') {
        const steerB = (keysB.current.left ? -1 : 0) + (keysB.current.right ? 1 : 0)
        stepLane(b, steerB, keysB.current.accel, keysB.current.brake, dt, 1)
      } else {
        stepLane(b, cpuSteer(b), false, false, dt, CPU_CRUISE)
      }

      if (a.dist >= FINISH || b.dist >= FINISH || raceLeft.current <= 0) {
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
    keysA.current = { left: false, right: false, accel: false, brake: false }
    keysB.current = { left: false, right: false, accel: false, brake: false }
    raceLeft.current = RACE_SECONDS
    setSeason('spring')
    setPhase('countdown')
  }, [])

  if (phase === 'setup') {
    return (
      <Setup
        step={step}
        setStep={setStep}
        p1char={p1char}
        mode={mode}
        carA={carA}
        carB={carB}
        onPickChar={setP1char}
        onPickMode={setMode}
        onPickCar={setCarA}
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
        carA={carA}
        carB={carB}
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
  const clock = Math.ceil(raceLeft.current)

  return (
    <main className="screen play">
      <div className="hud">
        <div className="hud-left">
          <button className="pill pill-back" onClick={onExit}>← 選單</button>
          <div className="pill pill-level">{mode === '2p' ? '雙人對戰' : '單人對電腦'}</div>
          <div className={`pill pill-time ${clock <= 15 ? 'time-low' : ''}`}>⏱️ {Math.floor(clock / 60)}:{(clock % 60).toString().padStart(2, '0')}</div>
        </div>
        <div className="race-progress">
          <ProgressBar racer={p1char} car={carA} pct={(a.dist / FINISH) * 100} label={labelA} />
          <ProgressBar racer={p2char} car={carB} pct={(b.dist / FINISH) * 100} label={labelB} />
        </div>
      </div>

      <div className="board-wrap">
        <div className="track track-split">
          <FujiScene season={season} />

          {/* tiny control hints in the corners */}
          <div className="key-hint hint-left">
            1P：← → 轉向 · ↓ 加速 · PgDn 減速 · 閃避 🚧
          </div>
          <div className="key-hint hint-right">
            {mode === '2p' ? '2P：A D 轉向 · S 加速 · X 減速' : '電腦 🤖 自動駕駛'}
          </div>

          <div className="lane-row">
            <LaneView racer={p1char} car={carA} lane={a} label={`${labelA}｜${RACERS[p1char].name}`} />
            <div className="lane-divider" />
            <LaneView racer={p2char} car={carB} lane={b} label={`${labelB}｜${RACERS[p2char].name}`} cpu={mode === 'cpu'} />
          </div>

          {phase === 'countdown' && <div className="countdown">{count}</div>}
        </div>

        <div className="steer-panel">
          <div className="steer-group">
            <span className="steer-owner">{labelA}（← → / ↓ 加速）</span>
            <div className="steer-btns">
              <button className="btn steer-btn" onPointerDown={() => (keysA.current.left = true)} onPointerUp={() => (keysA.current.left = false)} onPointerLeave={() => (keysA.current.left = false)}>◀</button>
              <button className="btn steer-btn accel" onPointerDown={() => (keysA.current.accel = true)} onPointerUp={() => (keysA.current.accel = false)} onPointerLeave={() => (keysA.current.accel = false)}>加速</button>
              <button className="btn steer-btn" onPointerDown={() => (keysA.current.right = true)} onPointerUp={() => (keysA.current.right = false)} onPointerLeave={() => (keysA.current.right = false)}>▶</button>
            </div>
          </div>

          {mode === '2p' && (
            <div className="steer-group">
              <span className="steer-owner">{labelB}（A D / S 加速）</span>
              <div className="steer-btns">
                <button className="btn steer-btn" onPointerDown={() => (keysB.current.left = true)} onPointerUp={() => (keysB.current.left = false)} onPointerLeave={() => (keysB.current.left = false)}>◀</button>
                <button className="btn steer-btn accel" onPointerDown={() => (keysB.current.accel = true)} onPointerUp={() => (keysB.current.accel = false)} onPointerLeave={() => (keysB.current.accel = false)}>加速</button>
                <button className="btn steer-btn" onPointerDown={() => (keysB.current.right = true)} onPointerUp={() => (keysB.current.right = false)} onPointerLeave={() => (keysB.current.right = false)}>▶</button>
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
  car,
  lane,
  label,
  cpu,
}: {
  racer: Racer
  car: CarType
  lane: Lane
  label: string
  cpu?: boolean
}) {
  return (
    <div className="lane">
      <div className="lane-label">{label}{cpu ? ' 🤖' : ''}</div>
      <div className="lane-road">
        <div className="lane-lines" style={{ animationDuration: `${1.0 / (lane.speed / BASE)}s` }} />
        {lane.entities.map((e) => (
          <div
            key={e.id}
            className={`track-item ${e.hit ? 'consumed' : ''}`}
            style={{ left: `${e.x * 100}%`, top: `${e.y * 100}%` }}
          >
            {e.emoji}
          </div>
        ))}
        <div
          className={`race-car player-car ${lane.boostT > 0 ? 'boosting' : ''} ${lane.slowT > 0 ? 'slowed' : ''} ${lane.spinT > 0 ? 'spinning' : ''}`}
          style={{ left: `${lane.x * 100}%`, top: `${CAR_Y * 100}%` }}
        >
          <RaceCarArt racer={racer} car={car} number={cpu ? 11 : 7} />
          {lane.boostT > 0 && <span className="boost-flame">💨</span>}
          {lane.spinT > 0 && <span className="hit-mark">💥</span>}
        </div>
      </div>
    </div>
  )
}

function ProgressBar({ racer, car, pct, label }: { racer: Racer; car: CarType; pct: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, pct))
  return (
    <div className="prog">
      <span className="prog-label">{label}</span>
      <div className="prog-track">
        <div className="prog-fill" style={{ width: `${clamped}%`, background: CAR_TYPES[car].body }} />
        <div className="prog-marker" style={{ left: `${clamped}%` }}>
          <RaceCarArt racer={racer} car={car} />
        </div>
        <span className="prog-flag">🏁</span>
      </div>
    </div>
  )
}

function Setup({
  step,
  setStep,
  p1char,
  mode,
  carA,
  carB,
  onPickChar,
  onPickMode,
  onPickCar,
  onStart,
  onExit,
}: {
  step: SetupStep
  setStep: (s: SetupStep) => void
  p1char: Racer
  mode: Mode
  carA: CarType
  carB: CarType
  onPickChar: (r: Racer) => void
  onPickMode: (m: Mode) => void
  onPickCar: (c: CarType) => void
  onStart: () => void
  onExit: () => void
}) {
  const p2char: Racer = p1char === 'cinna' ? 'pudding' : 'cinna'

  if (step === 'car') {
    return (
      <main className="screen center card-pop">
        <div className="hero">
          <h1>🏎️ 選擇車種</h1>
          <p className="lead">為 {RACERS[p1char].name} 選一台經典賽車！</p>
          <div className="racer-pick car-pick">
            {(['toyota', 'mazda', 'honda'] as CarType[]).map((c) => (
              <button
                key={c}
                className={`racer-card ${carA === c ? 'selected' : ''}`}
                onClick={() => onPickCar(c)}
              >
                <div className="racer-art"><RaceCarArt racer={p1char} car={c} number={7} /></div>
                <span className="racer-name">{CAR_TYPES[c].name}</span>
              </button>
            ))}
          </div>
          <p className="lead sm">對手 {RACERS[p2char].name} 將駕駛 {CAR_TYPES[carB].name}</p>
          <div className="result-actions setup-actions">
            <button className="btn btn-primary btn-lg" onClick={onStart}>遊戲開始 🏁</button>
            <button className="btn btn-ghost" onClick={() => setStep('main')}>← 上一步</button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="screen center card-pop">
      <div className="hero">
        <h1>🏁 富士市可愛賽車大賽</h1>

        <h3 className="setup-h">① 選擇你的選手</h3>
        <div className="racer-pick">
          {(['cinna', 'pudding'] as Racer[]).map((r) => (
            <button
              key={r}
              className={`racer-card ${p1char === r ? 'selected' : ''}`}
              onClick={() => onPickChar(r)}
            >
              <div className="racer-art"><RaceCarArt racer={r} car={carA} number={7} /></div>
              <span className="racer-name">{RACERS[r].name}</span>
            </button>
          ))}
        </div>

        <h3 className="setup-h">② 選擇對戰模式</h3>
        <div className="mode-pick">
          <button className={`mode-card ${mode === 'cpu' ? 'selected' : ''}`} onClick={() => onPickMode('cpu')}>
            <span className="mode-emoji">🤖</span>
            <span className="mode-title">單人對電腦</span>
            <span className="mode-desc">你操控 {RACERS[p1char].name}，電腦操控 {RACERS[p2char].name}</span>
          </button>
          <button className={`mode-card ${mode === '2p' ? 'selected' : ''}`} onClick={() => onPickMode('2p')}>
            <span className="mode-emoji">👥</span>
            <span className="mode-title">雙人對戰</span>
            <span className="mode-desc">1P 用 ← → ↓，2P 用 A D S 同場競速</span>
          </button>
        </div>

        <div className="result-actions setup-actions">
          <button className="btn btn-primary btn-lg" onClick={() => setStep('car')}>下一步：選車 →</button>
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
  carA,
  carB,
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
  carA: CarType
  carB: CarType
  humanWon: boolean
  giftsA: number
  giftsB: number
  onReplay: () => void
  onExit: () => void
}) {
  const winRacer = winner === 'A' ? p1char : p2char
  const winCar = winner === 'A' ? carA : carB
  const winWho = mode === '2p' ? (winner === 'A' ? '1P' : '2P') : humanWon ? '你' : '電腦'
  const confetti = Array.from({ length: 40 }, (_, i) => i)

  return (
    <main className="screen center card-pop">
      <div className="celebrate">
        {confetti.map((i) => (
          <span
            key={i}
            className="confetti"
            style={{
              left: `${(i * 2.5) % 100}%`,
              background: ['#ff5c8a', '#ffd84d', '#7ec7ff', '#9ede6f', '#b39ddb'][i % 5],
              animationDelay: `${(i % 10) * 0.15}s`,
              animationDuration: `${2.4 + (i % 5) * 0.4}s`,
            }}
          />
        ))}
      </div>
      <div className="result result-win">
        <div className="fireworks">🎆🎉🎊✨🥳</div>
        <h1 className="win-title">🏆 恭喜 {winWho}！</h1>
        <div className="win-car"><RaceCarArt racer={winRacer} car={winCar} number={7} /></div>
        <h2 className="win-name">{RACERS[winRacer].name} 駕駛 {CAR_TYPES[winCar].name} 奪冠！！！</h2>
        <p className="lead">🎇 太～～～厲害啦！！全場歡呼！！！🎇</p>
        <div className="result-cars">
          <div className={`result-car ${winner === 'A' ? 'winner' : ''}`}>
            <RaceCarArt racer={p1char} car={carA} />
            <span>{mode === '2p' ? '1P' : '你'}｜{RACERS[p1char].name}</span>
            <span className="result-gift">🍓 {giftsA}</span>
          </div>
          <div className={`result-car ${winner === 'B' ? 'winner' : ''}`}>
            <RaceCarArt racer={p2char} car={carB} />
            <span>{mode === '2p' ? '2P' : '電腦'}｜{RACERS[p2char].name}</span>
            <span className="result-gift">🍓 {giftsB}</span>
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
