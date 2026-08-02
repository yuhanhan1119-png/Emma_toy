import { CHARACTERS, getRandomCharacter } from './characters.js';
import { Battle } from './battle.js';

const screens = {
  opening: document.getElementById('opening-scene'),
  menu: document.getElementById('main-menu'),
  select: document.getElementById('char-select'),
  battle: document.getElementById('battle-screen'),
};

let gameMode = null;
let selectedP1 = null;
let selectedP2 = null;
let battle = null;
let openingTimer = null;

function showScreen(name) {
  Object.values(screens).forEach((s) => s.classList.remove('active'));
  screens[name].classList.add('active');
}

function initOpening() {
  const skip = () => {
    clearTimeout(openingTimer);
    showScreen('menu');
  };

  document.getElementById('skip-opening').addEventListener('click', skip);
  document.getElementById('watch-intro').addEventListener('click', () => {
    showScreen('opening');
    openingTimer = setTimeout(skip, 6000);
  });
  document.addEventListener('keydown', (e) => {
    if (screens.opening.classList.contains('active') && e.key === 'Enter') skip();
  });
}

function initMenu() {
  document.querySelectorAll('.btn-menu[data-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      gameMode = btn.dataset.mode;
      showCharacterSelect();
    });
  });
}

function renderCharCard(charId, selected, onClick) {
  const char = CHARACTERS[charId];
  const card = document.createElement('button');
  card.className = `char-select-card${selected === charId ? ' selected' : ''}`;
  card.innerHTML = `
    <div class="char-sprite ${charId}"></div>
    <span class="char-select-name">${char.name}</span>
    <span class="char-select-stats">HP ${char.hp} | ATK ${char.attack}</span>
  `;
  card.addEventListener('click', () => onClick(charId));
  return card;
}

function showCharacterSelect() {
  selectedP1 = null;
  selectedP2 = null;

  const title = document.getElementById('select-title');
  const panelP2 = document.getElementById('panel-p2');
  const panelCpu = document.getElementById('panel-cpu');
  const startBtn = document.getElementById('start-battle');

  title.textContent = gameMode === '1p' ? '單人對戰 — 選擇你的角色' : '雙人對戰 — 選擇角色';
  document.getElementById('panel-p1-label').textContent =
    gameMode === '1p' ? '選擇你的角色' : '玩家 1';
  panelP2.classList.toggle('hidden', gameMode === '1p');
  panelCpu.classList.toggle('hidden', gameMode === '2p');
  startBtn.disabled = true;

  const gridP1 = document.getElementById('grid-p1');
  const gridP2 = document.getElementById('grid-p2');
  gridP1.innerHTML = '';
  gridP2.innerHTML = '';

  const refresh = () => {
    gridP1.innerHTML = '';
    gridP2.innerHTML = '';
    Object.keys(CHARACTERS).forEach((id) => {
      gridP1.appendChild(renderCharCard(id, selectedP1, (cid) => {
        selectedP1 = cid;
        refresh();
        updateStartButton();
      }));
      if (gameMode === '2p') {
        gridP2.appendChild(renderCharCard(id, selectedP2, (cid) => {
          selectedP2 = cid;
          refresh();
          updateStartButton();
        }));
      }
    });
  };

  refresh();
  showScreen('select');
}

function updateStartButton() {
  const ready = selectedP1 && (gameMode === '1p' || selectedP2);
  document.getElementById('start-battle').disabled = !ready;
}

function pickCpuCharacter() {
  selectedP2 = getRandomCharacter(selectedP1);
  return selectedP2;
}

function startBattle() {
  if (gameMode === '1p') {
    pickCpuCharacter();
  }

  battle = new Battle(gameMode, selectedP1, selectedP2);
  battle.onUpdate = (result) => updateBattleUI(result);
  battle.onEnd = () => showBattleResult();

  const p1 = CHARACTERS[selectedP1];
  const p2 = CHARACTERS[selectedP2];

  document.getElementById('name-left').textContent = p1.name;
  document.getElementById('name-right').textContent = p2.name;
  document.getElementById('sprite-left').className = `fighter-sprite ${selectedP1}`;
  document.getElementById('sprite-right').className = `fighter-sprite ${selectedP2}`;

  const hint = document.getElementById('controls-hint');
  if (gameMode === '1p') {
    hint.textContent = '你的回合：點擊下方按鈕行動';
  } else {
    hint.textContent = '玩家 1：A/S/D 攻擊/必殺/治療 | 玩家 2：J/K/L 攻擊/必殺/治療';
  }

  document.getElementById('battle-result').classList.add('hidden');
  document.getElementById('battle-actions').style.display = 'flex';
  updateBattleUI();

  if (gameMode === '1p') {
    const cpu = CHARACTERS[selectedP2];
    battle.addLog(`🤖 電腦選擇了 ${cpu.name}！`);
    updateBattleUI();
  }

  showScreen('battle');

  if (gameMode === '1p' && battle.currentTurn === 'p2') {
    setTimeout(cpuTurn, 800);
  }
}

function updateBattleUI(result) {
  const { p1, p2 } = battle;

  document.getElementById('hp-left').style.width = `${(p1.currentHp / p1.hp) * 100}%`;
  document.getElementById('hp-right').style.width = `${(p2.currentHp / p2.hp) * 100}%`;
  document.getElementById('hp-text-left').textContent = `${p1.currentHp}/${p1.hp}`;
  document.getElementById('hp-text-right').textContent = `${p2.currentHp}/${p2.hp}`;

  const logEl = document.getElementById('battle-log');
  logEl.innerHTML = battle.log.map((m) => `<p>${m}</p>`).join('');

  if (result?.damage > 0) {
    const side = result.actor === 'p1' ? 'right' : 'left';
    const sprite = document.getElementById(`sprite-${side}`);
    sprite.classList.add('hit');
    setTimeout(() => sprite.classList.remove('hit'), 400);
  }

  const actions = document.getElementById('battle-actions');
  if (battle.gameOver) {
    actions.style.display = 'none';
  } else if (gameMode === '1p') {
    actions.style.display = battle.currentTurn === 'p1' ? 'flex' : 'none';
    document.getElementById('controls-hint').textContent =
      battle.currentTurn === 'p1' ? '你的回合：點擊下方按鈕行動' : '🤖 電腦思考中...';
  } else {
    const turnLabel = battle.currentTurn === 'p1' ? '玩家 1' : '玩家 2';
    document.getElementById('controls-hint').textContent = `${turnLabel} 的回合！`;
  }
}

function cpuTurn() {
  if (battle.gameOver || battle.currentTurn !== 'p2') return;
  const action = battle.cpuChooseAction();
  battle.executeAction(action);
  if (!battle.gameOver && battle.currentTurn === 'p2') {
    setTimeout(cpuTurn, 800);
  }
}

function showBattleResult() {
  const winner = battle.currentTurn === 'p1' ? battle.p1 : battle.p2;
  document.getElementById('winner-text').textContent = `🎉 ${winner.name} 獲勝！`;
  document.getElementById('battle-result').classList.remove('hidden');
  document.getElementById('battle-actions').style.display = 'none';
}

function handleBattleAction(action) {
  if (battle.gameOver) return;
  if (gameMode === '1p' && battle.currentTurn !== 'p1') return;

  battle.executeAction(action);

  if (!battle.gameOver && gameMode === '1p' && battle.currentTurn === 'p2') {
    setTimeout(cpuTurn, 800);
  }
}

function initBattleControls() {
  document.querySelectorAll('.btn-action').forEach((btn) => {
    btn.addEventListener('click', () => handleBattleAction(btn.dataset.action));
  });

  const keyMap = {
    p1: { a: 'attack', s: 'special', d: 'heal' },
    p2: { j: 'attack', k: 'special', l: 'heal' },
  };

  document.addEventListener('keydown', (e) => {
    if (!screens.battle.classList.contains('active') || battle?.gameOver) return;
    const key = e.key.toLowerCase();

    if (gameMode === '2p') {
      if (battle.currentTurn === 'p1' && keyMap.p1[key]) {
        handleBattleAction(keyMap.p1[key]);
      } else if (battle.currentTurn === 'p2' && keyMap.p2[key]) {
        handleBattleAction(keyMap.p2[key]);
      }
    }
  });

  document.getElementById('start-battle').addEventListener('click', startBattle);
  document.getElementById('back-to-menu').addEventListener('click', () => showScreen('menu'));
  document.getElementById('rematch').addEventListener('click', startBattle);
  document.getElementById('to-menu').addEventListener('click', () => showScreen('menu'));
}

initOpening();
initMenu();
initBattleControls();
showScreen('menu');
