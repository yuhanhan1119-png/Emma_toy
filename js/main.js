import { CHARACTERS, getRandomCharacter } from './characters.js';
import { Battle } from './battle.js';

const screens = {
  opening: document.getElementById('opening-scene'),
  menu: document.getElementById('main-menu'),
  select: document.getElementById('char-select'),
  attack: document.getElementById('attack-select'),
  battle: document.getElementById('battle-screen'),
};

let gameMode = null;
let selectedP1 = null;
let selectedP2 = null;
let selectedAttackP1 = null;
let selectedAttackP2 = null;
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

function showAttackSelect() {
  selectedAttackP1 = null;
  selectedAttackP2 = null;

  const title = document.getElementById('attack-title');
  const panelP2 = document.getElementById('attack-panel-p2');
  const startBtn = document.getElementById('start-battle');

  title.textContent = gameMode === '1p' ? '選擇你的攻擊招式' : '選擇攻擊招式';
  document.getElementById('attack-p1-label').textContent =
    gameMode === '1p' ? '你的攻擊' : '玩家 1 的攻擊';
  panelP2.classList.toggle('hidden', gameMode === '1p');
  startBtn.disabled = true;

  renderAttackPanel('p1', selectedP1, selectedAttackP1, (attack) => {
    selectedAttackP1 = attack;
    renderAttackPanel('p1', selectedP1, selectedAttackP1, null);
    updateAttackStartButton();
  });

  if (gameMode === '2p') {
    renderAttackPanel('p2', selectedP2, selectedAttackP2, (attack) => {
      selectedAttackP2 = attack;
      renderAttackPanel('p2', selectedP2, selectedAttackP2, null);
      updateAttackStartButton();
    });
  }

  showScreen('attack');
}

function renderAttackPanel(player, charId, selectedAttack, onSelect) {
  if (!charId) return;

  const char = CHARACTERS[charId];
  const preview = document.getElementById(`attack-preview-${player}`);
  const options = document.getElementById(`attack-options-${player}`);

  preview.innerHTML = `
    <div class="char-sprite ${charId}"></div>
    <div class="attack-char-info">
      <span class="char-select-name">${char.name}</span>
      <span class="char-select-stats">HP ${char.hp} | 大招威力 ${char.ultimateDamage}</span>
    </div>
  `;

  options.innerHTML = '';
  const card = document.createElement('button');
  card.className = `attack-card${selectedAttack === char.ultimateName ? ' selected' : ''}`;
  card.innerHTML = `
    <span class="attack-card-icon">🔥</span>
    <span class="attack-card-name">${char.ultimateName}</span>
    <span class="attack-card-desc">${char.attackDesc}</span>
    <span class="attack-card-power">大招威力：${char.ultimateDamage}（連攻 5 次後按 W 發動）</span>
  `;
  if (onSelect) {
    card.addEventListener('click', () => onSelect(char.ultimateName));
  }
  options.appendChild(card);

  if (!selectedAttack && onSelect) {
    onSelect(char.ultimateName);
  }
}

function updateAttackStartButton() {
  const ready = selectedAttackP1 && (gameMode === '1p' || selectedAttackP2);
  document.getElementById('start-battle').disabled = !ready;
}

function pickCpuCharacter() {
  selectedP2 = getRandomCharacter(selectedP1);
  return selectedP2;
}

function startBattle() {
  if (gameMode === '1p') {
    pickCpuCharacter();
    selectedAttackP2 = CHARACTERS[selectedP2].ultimateName;
  }

  battle = new Battle(gameMode, selectedP1, selectedP2, selectedAttackP1, selectedAttackP2);
  battle.onUpdate = (result) => updateBattleUI(result);
  battle.onEnd = () => showBattleResult();

  const p1 = CHARACTERS[selectedP1];
  const p2 = CHARACTERS[selectedP2];

  document.getElementById('name-left').textContent = p1.name;
  document.getElementById('name-right').textContent = p2.name;
  document.getElementById('sprite-left').className = `fighter-sprite ${selectedP1}`;
  document.getElementById('sprite-right').className = `fighter-sprite ${selectedP2}`;

  configureBattleUI();

  document.getElementById('battle-result').classList.add('hidden');
  document.getElementById('battle-actions').style.display = 'flex';
  updateBattleUI();

  if (gameMode === '1p') {
    const cpu = CHARACTERS[selectedP2];
    battle.addLog(`🤖 電腦選擇了 ${cpu.name}，大招：${cpu.ultimateName}！`);
    updateBattleUI();
  }

  showScreen('battle');

  if (gameMode === '1p' && battle.currentTurn === 'p2') {
    setTimeout(cpuTurn, 800);
  }
}

function configureBattleUI() {
  const is1p = gameMode === '1p';
  document.getElementById('energy-panel').classList.toggle('hidden', !is1p);
  document.getElementById('btn-special').classList.toggle('hidden', is1p);
  document.getElementById('btn-heal').classList.toggle('hidden', is1p);
  document.getElementById('btn-ultimate').classList.toggle('hidden', !is1p);
  document.getElementById('btn-attack').textContent = is1p ? '⚔️ 普通攻擊' : '⚔️ 攻擊';

  const hint = document.getElementById('controls-hint');
  if (is1p) {
    const ultName = CHARACTERS[selectedP1].ultimateName;
    hint.textContent = `普通攻擊累積能量，連攻 5 次後按 W 發動「${ultName}」`;
  } else {
    hint.textContent = '玩家 1：A/S/D 攻擊/必殺/治療 | 玩家 2：J/K/L 攻擊/必殺/治療';
  }
}

function updateEnergyUI() {
  if (gameMode !== '1p') return;

  const energy = battle.p1.energy;
  const segments = document.querySelectorAll('.energy-segment');
  segments.forEach((seg, i) => {
    seg.classList.toggle('filled', i < energy);
  });

  const ready = battle.canUseUltimate(battle.p1);
  document.getElementById('energy-hint').textContent = ready
    ? `能量已滿！按 W 或點擊大招按鈕發動「${battle.p1.ultimateName}」`
    : `${energy}/5 — 再攻擊 ${5 - energy} 次可發動大招`;

  const btnUlt = document.getElementById('btn-ultimate');
  btnUlt.disabled = !ready || battle.currentTurn !== 'p1';
  btnUlt.textContent = `🔥 ${battle.p1.ultimateName} (W)`;
}

function updateBattleActionLabels() {
  if (gameMode === '1p') return;
  const current = battle.getCurrentFighter();
  document.getElementById('btn-special').textContent = `✨ ${current.chosenAttack}`;
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
    document.getElementById('energy-panel').classList.add('hidden');
  } else if (gameMode === '1p') {
    actions.style.display = battle.currentTurn === 'p1' ? 'flex' : 'none';
    document.getElementById('controls-hint').textContent =
      battle.currentTurn === 'p1'
        ? `普通攻擊累積能量（${battle.p1.energy}/5），滿了按 W 發動大招`
        : '🤖 電腦思考中...';
    updateEnergyUI();
  } else {
    const turnLabel = battle.currentTurn === 'p1' ? '玩家 1' : '玩家 2';
    document.getElementById('controls-hint').textContent = `${turnLabel} 的回合！`;
  }

  if (!battle.gameOver) {
    updateBattleActionLabels();
  }
}

function cpuTurn() {
  if (battle.gameOver || battle.currentTurn !== 'p2') return;
  const action = battle.cpuChooseAction();
  if (gameMode === '1p') {
    battle.executeCpuAction(action);
  } else {
    battle.executeAction(action);
  }
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

  const result = battle.executeAction(action);
  if (!result && action === 'ultimate') return;

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

    if (gameMode === '1p' && battle.currentTurn === 'p1') {
      if (key === 'w') handleBattleAction('ultimate');
      return;
    }

    if (gameMode === '2p') {
      if (battle.currentTurn === 'p1' && keyMap.p1[key]) {
        handleBattleAction(keyMap.p1[key]);
      } else if (battle.currentTurn === 'p2' && keyMap.p2[key]) {
        handleBattleAction(keyMap.p2[key]);
      }
    }
  });

  document.getElementById('confirm-characters').addEventListener('click', showAttackSelect);
  document.getElementById('start-battle').addEventListener('click', startBattle);
  document.getElementById('back-to-menu').addEventListener('click', () => showScreen('menu'));
  document.getElementById('back-to-char-select').addEventListener('click', () => showScreen('select'));
  document.getElementById('rematch').addEventListener('click', () => {
    if (gameMode === '1p') {
      pickCpuCharacter();
      selectedAttackP2 = CHARACTERS[selectedP2].ultimateName;
    }
    startBattle();
  });
  document.getElementById('to-menu').addEventListener('click', () => showScreen('menu'));
}

initOpening();
initMenu();
initBattleControls();
showScreen('menu');
