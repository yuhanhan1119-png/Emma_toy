import { CHARACTERS, BATTLE_MAX_HP, getRandomCharacter } from './characters.js';
import { ActionArena } from './arena.js';

const screens = {
  opening: document.getElementById('opening-scene'),
  menu: document.getElementById('main-menu'),
  select: document.getElementById('char-select'),
  battle: document.getElementById('battle-screen'),
};

let gameMode = null;
let selectedP1 = null;
let selectedP2 = null;
let arena = null;
let hudInterval = null;
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
    <span class="char-select-stats">生命 ${BATTLE_MAX_HP}</span>
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
  const startBtn = document.getElementById('confirm-characters');

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
  document.getElementById('confirm-characters').disabled = !ready;
}

function pickCpuCharacter() {
  selectedP2 = getRandomCharacter(selectedP1);
  return selectedP2;
}

function updateHud() {
  if (!arena) return;
  const { p1, p2 } = arena;

  document.getElementById('hp-left').style.width = `${arena.getHpPercent(p1)}%`;
  document.getElementById('hp-right').style.width = `${arena.getHpPercent(p2)}%`;
  document.getElementById('hp-text-left').textContent = `${Math.ceil(p1.hp)}/${BATTLE_MAX_HP}`;
  document.getElementById('hp-text-right').textContent = `${Math.ceil(p2.hp)}/${BATTLE_MAX_HP}`;
}

function showBattleResult(winner, p1, p2) {
  clearInterval(hudInterval);
  const resultEl = document.getElementById('battle-result');
  const detailEl = document.getElementById('result-detail');

  if (winner) {
    document.getElementById('winner-text').textContent = `🎉 ${winner.name} 獲勝！`;
    detailEl.textContent = `最終生命：${Math.ceil(p1.hp)} vs ${Math.ceil(p2.hp)} — 生命最高者獲勝！`;
  } else {
    document.getElementById('winner-text').textContent = '🤝 平手！';
    detailEl.textContent = `雙方生命皆為 ${Math.ceil(p1.hp)}`;
  }

  resultEl.classList.remove('hidden');
}

function startBattle() {
  if (gameMode === '1p') pickCpuCharacter();

  const p1 = CHARACTERS[selectedP1];
  const p2 = CHARACTERS[selectedP2];

  document.getElementById('name-left').textContent = p1.name;
  document.getElementById('name-right').textContent = p2.name;
  document.getElementById('btn-shoot-d').textContent = `⚔️ ${p1.specialName} (D)`;
  document.getElementById('btn-shoot-w').textContent = `🔥 ${p1.ultimateName} (W)`;
  document.getElementById('battle-result').classList.add('hidden');

  const hint = document.getElementById('controls-hint');
  if (gameMode === '1p') {
    hint.textContent = `↑↓←→ 移動 | D「${p1.specialName}」| W「${p1.ultimateName}」| Space 跳躍`;
  } else {
    hint.textContent = '玩家1：方向鍵移動 D攻擊 W強攻 Space跳躍 | 玩家2：WASD移動 J攻擊 K強攻 Shift跳躍';
  }

  if (arena) arena.stop();
  clearInterval(hudInterval);

  const canvas = document.getElementById('arena-canvas');
  arena = new ActionArena(canvas, gameMode, selectedP1, selectedP2, showBattleResult);
  showScreen('battle');
  arena.start();

  hudInterval = setInterval(updateHud, 100);
  updateHud();
}

function initBattleControls() {
  document.getElementById('btn-jump').addEventListener('click', () => {
    if (arena?.running) arena.tryJump(arena.p1);
  });
  document.getElementById('btn-shoot-d').addEventListener('click', () => {
    if (arena?.running) arena.tryShoot(arena.p1, 'basic');
  });
  document.getElementById('btn-shoot-w').addEventListener('click', () => {
    if (arena?.running) arena.tryShoot(arena.p1, 'strong');
  });

  document.getElementById('confirm-characters').addEventListener('click', startBattle);
  document.getElementById('back-to-menu').addEventListener('click', () => {
    if (arena) arena.stop();
    clearInterval(hudInterval);
    showScreen('menu');
  });
  document.getElementById('rematch').addEventListener('click', startBattle);
  document.getElementById('to-menu').addEventListener('click', () => {
    if (arena) arena.stop();
    clearInterval(hudInterval);
    showScreen('menu');
  });
}

initOpening();
initMenu();
initBattleControls();
showScreen('menu');
