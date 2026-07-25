import { useCallback, useEffect, useRef, useState } from 'react'
import { RaceCarArt, RACERS, type Racer } from './RaceCar'

type Phase = 'select' | 'countdown' | 'racing' | 'result'

const FINISH = 100 // race distance (percent)
const PLAYER_BASE = 4.2 // % per second
const STEER = 0.85 // horizontal units per second
const PLAYER_Y = 0.82
const HIT_X = 0.1
const HIT_Y = 0.055

interface Entity {
  id: number
  type: 'cone' | 'boost'
  x: number // 0..1
  y: number // 0..1 (0 top, 1 bottom)
  hit: boolean
}

interface RaceState {
  playerX: number
  playerDist: number
  rivalDist: number
  playerSpeed: number
  rivalSpeed: number
  boostT: number
  slowT: number
  entities: Entity[]
  spawnT: number
  gifts: number
  nextId: number
}

function freshState(): RaceState {
  return {
    playerX: 0.5,
    playerDist: 0,
    rivalDist: 0,
    playerSpeed: PLAYER_BASE,
    rivalSpeed: 3.8,
    boostT: 0,
    slowT: 0,
    entities: [],
    spawnT: 0,
    gifts: 0,
    nextId: 1,
  }
}

export default function RacingGame({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>('select')
  const [player, setPlayer] = useState<Racer>('cinna')
  const [count, setCount] = useState(3)
  const [, setFrame] = useState(0)
  const [result, setResult] = useState<'win' | 'lose'>('win')

  const st = useRef<RaceState>(freshState())
  const keys = useRef({ left: false, right: false })
  const rafRef = useRef<number | null>(null)
  const lastT = useRef(0)

  const rival: Racer = player === 'cinna' ? 'pudding' : 'cinna'

  // Keyboard controls
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.current.left = true
      if (e.key === 'ArrowRight' || e.key === 'd') keys.current.right = true
    }
    const up = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.current.left = false
      if (e.key === 'ArrowRight' || e.key === 'd') keys.current.right = false
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
      } else {
        setCount(n)
      }
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
      const s = st.current

      // steering
      if (keys.current.left) s.playerX -= STEER * dt
      if (keys.current.right) s.playerX += STEER * dt
      s.playerX = Math.max(0.06, Math.min(0.94, s.playerX))

      // speed modifiers
      if (s.boostT > 0) s.boostT -= dt
      if (s.slowT > 0) s.slowT -= dt
      let speed = PLAYER_BASE
      if (s.boostT > 0) speed += 3.2
      if (s.slowT > 0) speed *= 0.45
      s.playerSpeed = speed

      // rival wanders around its base pace
      s.rivalSpeed += (Math.random() - 0.5) * 0.6 * dt * 10
      s.rivalSpeed = Math.max(2.9, Math.min(4.6, s.rivalSpeed))

      // advance distances
      s.playerDist += speed * dt
      s.rivalDist += s.rivalSpeed * dt

      // move + spawn entities (vertical flow speed scales with player speed)
      const flow = 0.55 * (speed / PLAYER_BASE)
      for (const e of s.entities) e.y += flow * dt
      s.entities = s.entities.filter((e) => e.y < 1.15)

      s.spawnT -= dt
      if (s.spawnT <= 0) {
        s.spawnT = 0.62
        s.entities.push({
          id: s.nextId++,
          type: Math.random() < 0.58 ? 'cone' : 'boost',
          x: 0.1 + Math.random() * 0.8,
          y: -0.1,
          hit: false,
        })
      }

      // collisions
      for (const e of s.entities) {
        if (e.hit) continue
        if (Math.abs(e.y - PLAYER_Y) < HIT_Y && Math.abs(e.x - s.playerX) < HIT_X) {
          e.hit = true
          if (e.type === 'boost') {
            s.boostT = 2.0
            s.playerDist += 2.2
            s.gifts += 1
          } else {
            s.slowT = 0.9
            s.playerDist = Math.max(0, s.playerDist - 1.6)
          }
        }
      }

      // finish?
      if (s.playerDist >= FINISH || s.rivalDist >= FINISH) {
        setResult(s.playerDist >= s.rivalDist ? 'win' : 'lose')
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
    st.current = freshState()
    setPhase('countdown')
  }, [])

  const s = st.current
  const rivalRoadY = Math.max(
    0.08,
    Math.min(0.9, PLAYER_Y - (s.rivalDist - s.playerDist) / 22),
  )

  return (
    <>
      {phase === 'select' && (
        <RacerSelect
          player={player}
          onPick={setPlayer}
          onStart={start}
          onExit={onExit}
        />
      )}

      {phase === 'result' && (
        <RaceResult
          result={result}
          player={player}
          rival={rival}
          gifts={s.gifts}
          onReplay={start}
          onExit={onExit}
        />
      )}

      {(phase === 'racing' || phase === 'countdown') && (
        <main className="screen play">
          <div className="hud">
            <div className="hud-left">
              <button className="pill pill-back" onClick={onExit}>← 選單</button>
              <div className="pill pill-score">🎁 {s.gifts}</div>
            </div>
            <div className="race-progress">
              <ProgressBar racer={player} pct={(s.playerDist / FINISH) * 100} label="你" />
              <ProgressBar racer={rival} pct={(s.rivalDist / FINISH) * 100} label="對手" />
            </div>
          </div>

          <div className="board-wrap">
            <div className="track">
              <div className="lane-lines" style={{ animationDuration: `${1.2 / (s.playerSpeed / PLAYER_BASE)}s` }} />

              {/* rival car on the road */}
              <div
                className="race-car rival-car"
                style={{ left: '50%', top: `${rivalRoadY * 100}%` }}
              >
                <RaceCarArt racer={rival} />
              </div>

              {/* entities */}
              {s.entities.map((e) => (
                <div
                  key={e.id}
                  className={`track-item ${e.type} ${e.hit ? 'consumed' : ''}`}
                  style={{ left: `${e.x * 100}%`, top: `${e.y * 100}%` }}
                >
                  {e.type === 'cone' ? '🚧' : '🎁'}
                </div>
              ))}

              {/* player car */}
              <div
                className={`race-car player-car ${s.boostT > 0 ? 'boosting' : ''} ${s.slowT > 0 ? 'slowed' : ''}`}
                style={{ left: `${s.playerX * 100}%`, top: `${PLAYER_Y * 100}%` }}
              >
                <RaceCarArt racer={player} />
                {s.boostT > 0 && <span className="boost-flame">💨</span>}
              </div>

              {phase === 'countdown' && (
                <div className="countdown">{count}</div>
              )}
            </div>

            <div className="steer-row">
              <button
                className="btn steer-btn"
                onPointerDown={() => (keys.current.left = true)}
                onPointerUp={() => (keys.current.left = false)}
                onPointerLeave={() => (keys.current.left = false)}
              >◀</button>
              <div className="steer-hint">用 ← → 方向鍵或按鈕操控，吃 🎁 加速、避開 🚧</div>
              <button
                className="btn steer-btn"
                onPointerDown={() => (keys.current.right = true)}
                onPointerUp={() => (keys.current.right = false)}
                onPointerLeave={() => (keys.current.right = false)}
              >▶</button>
            </div>
          </div>
        </main>
      )}
    </>
  )
}

function ProgressBar({ racer, pct, label }: { racer: Racer; pct: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, pct))
  return (
    <div className="prog">
      <span className="prog-label">{label}</span>
      <div className="prog-track">
        <div className="prog-fill" style={{ width: `${clamped}%`, background: RACERS[racer].car }} />
        <div className="prog-marker" style={{ left: `${clamped}%` }}>
          <RaceCarArt racer={racer} />
        </div>
        <span className="prog-flag">🏁</span>
      </div>
    </div>
  )
}

function RacerSelect({
  player,
  onPick,
  onStart,
  onExit,
}: {
  player: Racer
  onPick: (r: Racer) => void
  onStart: () => void
  onExit: () => void
}) {
  return (
    <main className="screen center card-pop">
      <div className="hero">
        <h1>🏁 可愛賽車大賽</h1>
        <p className="lead">大耳狗 🆚 布丁狗！選一位選手，比賽開始～</p>
        <div className="racer-pick">
          {(['cinna', 'pudding'] as Racer[]).map((r) => (
            <button
              key={r}
              className={`racer-card ${player === r ? 'selected' : ''}`}
              onClick={() => onPick(r)}
            >
              <div className="racer-art">
                <RaceCarArt racer={r} />
              </div>
              <span className="racer-name">{RACERS[r].name}</span>
            </button>
          ))}
        </div>
        <ul className="rules">
          <li>⬅️➡️ 用方向鍵或畫面按鈕左右移動賽車</li>
          <li>🎁 吃到禮物會加速並收集禮物</li>
          <li>🚧 撞到路障會減速，小心閃避！</li>
          <li>🏁 比對手先抵達終點就獲勝</li>
        </ul>
        <div className="result-actions">
          <button className="btn btn-primary btn-lg" onClick={onStart}>開始比賽</button>
          <button className="btn btn-ghost" onClick={onExit}>← 返回選單</button>
        </div>
      </div>
    </main>
  )
}

function RaceResult({
  result,
  player,
  rival,
  gifts,
  onReplay,
  onExit,
}: {
  result: 'win' | 'lose'
  player: Racer
  rival: Racer
  gifts: number
  onReplay: () => void
  onExit: () => void
}) {
  const win = result === 'win'
  return (
    <main className="screen center card-pop">
      <div className="result">
        <div className="result-emoji">{win ? '🏆' : '😤'}</div>
        <h1>{win ? '你贏了！' : '對手先到終點了！'}</h1>
        <div className="result-cars">
          <div className={`result-car ${win ? 'winner' : ''}`}>
            <RaceCarArt racer={player} />
            <span>{RACERS[player].name}（你）</span>
          </div>
          <div className={`result-car ${!win ? 'winner' : ''}`}>
            <RaceCarArt racer={rival} />
            <span>{RACERS[rival].name}（對手）</span>
          </div>
        </div>
        <div className="score-big">🎁 收集到 {gifts} 個禮物</div>
        <div className="result-actions">
          <button className="btn btn-primary btn-lg" onClick={onReplay}>再比一次</button>
          <button className="btn btn-ghost" onClick={onExit}>返回選單</button>
        </div>
      </div>
    </main>
  )
}
