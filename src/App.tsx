import { useState } from 'react'
import { CharacterArt } from './characters'
import { RaceCarArt } from './games/RaceCar'
import SeekGame from './games/SeekGame'
import RacingGame from './games/RacingGame'

type Screen = 'menu' | 'seek' | 'racing'

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu')

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-emoji">🎀</span>
          <span>可愛遊戲樂園</span>
        </div>
        <div className="brand-sub">Kawaii Game Land · 三麗鷗風格小遊戲</div>
      </header>

      {screen === 'menu' && <Menu onPick={setScreen} />}
      {screen === 'seek' && <SeekGame onExit={() => setScreen('menu')} />}
      {screen === 'racing' && <RacingGame onExit={() => setScreen('menu')} />}
    </div>
  )
}

function Menu({ onPick }: { onPick: (s: Screen) => void }) {
  return (
    <main className="screen center card-pop">
      <div className="menu">
        <h1>選擇遊戲</h1>
        <div className="menu-grid">
          <button className="menu-card" onClick={() => onPick('seek')}>
            <div className="menu-icons">
              <div className="menu-icon"><CharacterArt id="cinna" /></div>
              <div className="menu-icon"><CharacterArt id="purin" /></div>
              <div className="menu-icon"><CharacterArt id="cinnaBow" /></div>
            </div>
            <h2>尋找可愛夥伴</h2>
            <p>在人群中找出指定角色！15 關、每關 3 分鐘的找找看。</p>
          </button>

          <button className="menu-card" onClick={() => onPick('racing')}>
            <div className="menu-icons menu-icons-cars">
              <div className="menu-icon-car"><RaceCarArt racer="cinna" /></div>
              <div className="menu-icon-car"><RaceCarArt racer="pudding" /></div>
            </div>
            <h2>可愛賽車大賽</h2>
            <p>大耳狗 🆚 布丁狗！閃避路障、收集禮物，衝向終點線。</p>
          </button>
        </div>
      </div>
    </main>
  )
}
