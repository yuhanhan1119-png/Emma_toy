import { createFighter, ENERGY_TO_ULTIMATE } from './characters.js';

export class Battle {
  constructor(mode, p1CharId, p2CharId, p1Attack = null, p2Attack = null) {
    this.mode = mode;
    this.p1 = createFighter(p1CharId, p1Attack);
    this.p2 = createFighter(p2CharId, p2Attack);
    this.currentTurn = 'p1';
    this.gameOver = false;
    this.log = [];
    this.onUpdate = null;
    this.onEnd = null;
  }

  getCurrentFighter() {
    return this.currentTurn === 'p1' ? this.p1 : this.p2;
  }

  getOpponent() {
    return this.currentTurn === 'p1' ? this.p2 : this.p1;
  }

  addLog(msg) {
    this.log.push(msg);
    if (this.log.length > 6) this.log.shift();
  }

  canUseUltimate(fighter) {
    return fighter.energy >= ENERGY_TO_ULTIMATE;
  }

  executeAction(action) {
    if (this.gameOver) return null;

    const actor = this.getCurrentFighter();
    const target = this.getOpponent();
    let result = { action, actor: this.currentTurn, damage: 0, healed: 0 };

    if (this.mode === '1p' && this.currentTurn === 'p1') {
      return this.executeSinglePlayerAction(action, actor, target, result);
    }

    switch (action) {
      case 'attack': {
        const variance = Math.floor(Math.random() * 6) - 2;
        const damage = Math.max(1, actor.attack + variance);
        target.currentHp = Math.max(0, target.currentHp - damage);
        result.damage = damage;
        this.addLog(`${actor.name} 發動攻擊，造成 ${damage} 點傷害！`);
        break;
      }
      case 'special': {
        if (actor.specialUsed) {
          this.addLog(`${actor.name} 的必殺技已用過了！改為普通攻擊。`);
          return this.executeAction('attack');
        }
        const variance = Math.floor(Math.random() * 8) - 2;
        const damage = Math.max(1, actor.special + variance);
        target.currentHp = Math.max(0, target.currentHp - damage);
        actor.specialUsed = true;
        result.damage = damage;
        this.addLog(`${actor.name} 使出「${actor.chosenAttack}」！造成 ${damage} 點傷害！`);
        break;
      }
      case 'heal': {
        actor.currentHp = Math.min(actor.hp, actor.currentHp + actor.heal);
        result.healed = actor.heal;
        this.addLog(`${actor.name} 回復了 ${actor.heal} 點生命！`);
        break;
      }
    }

    return this.finishAction(actor, target, result);
  }

  executeSinglePlayerAction(action, actor, target, result) {
    switch (action) {
      case 'attack': {
        const damage = actor.basicDamage;
        target.currentHp = Math.max(0, target.currentHp - damage);
        actor.energy = Math.min(ENERGY_TO_ULTIMATE, actor.energy + 1);
        result.damage = damage;
        this.addLog(`${actor.name} 普通攻擊，造成 ${damage} 點傷害！（能量 ${actor.energy}/${ENERGY_TO_ULTIMATE}）`);
        break;
      }
      case 'ultimate': {
        if (!this.canUseUltimate(actor)) {
          this.addLog(`能量不足！需要連續攻擊 ${ENERGY_TO_ULTIMATE} 次（目前 ${actor.energy}/${ENERGY_TO_ULTIMATE}）`);
          return null;
        }
        const damage = actor.ultimateDamage;
        target.currentHp = Math.max(0, target.currentHp - damage);
        actor.energy = 0;
        result.damage = damage;
        this.addLog(`${actor.name} 使出大招「${actor.ultimateName}」！造成 ${damage} 點傷害！`);
        break;
      }
      default:
        return null;
    }

    return this.finishAction(actor, target, result);
  }

  finishAction(actor, target, result) {
    if (target.currentHp <= 0) {
      this.gameOver = true;
      result.winner = this.currentTurn;
      this.addLog(`🎉 ${actor.name} 獲勝！`);
      if (this.onEnd) this.onEnd(actor, target);
    } else {
      this.currentTurn = this.currentTurn === 'p1' ? 'p2' : 'p1';
    }

    if (this.onUpdate) this.onUpdate(result);
    return result;
  }

  cpuChooseAction() {
    const cpu = this.getCurrentFighter();
    const opponent = this.getOpponent();
    const hpRatio = cpu.currentHp / cpu.hp;

    if (this.mode === '1p') {
      if (this.canUseUltimate(cpu)) return 'ultimate';
      return 'attack';
    }

    if (hpRatio < 0.35 && Math.random() < 0.6) return 'heal';
    if (!cpu.specialUsed && opponent.currentHp < 40 && Math.random() < 0.7) return 'special';
    if (!cpu.specialUsed && Math.random() < 0.35) return 'special';
    if (Math.random() < 0.25) return 'heal';
    return 'attack';
  }

  executeCpuAction(action) {
    if (this.gameOver || this.currentTurn !== 'p2') return null;

    const cpu = this.p2;
    const target = this.p1;
    let result = { action, actor: 'p2', damage: 0, healed: 0 };

    if (this.mode === '1p') {
      if (action === 'ultimate' && this.canUseUltimate(cpu)) {
        const damage = cpu.ultimateDamage;
        target.currentHp = Math.max(0, target.currentHp - damage);
        cpu.energy = 0;
        result.damage = damage;
        this.addLog(`🤖 ${cpu.name} 使出「${cpu.ultimateName}」！造成 ${damage} 點傷害！`);
      } else {
        const damage = cpu.basicDamage;
        target.currentHp = Math.max(0, target.currentHp - damage);
        cpu.energy = Math.min(ENERGY_TO_ULTIMATE, cpu.energy + 1);
        result.damage = damage;
        this.addLog(`🤖 ${cpu.name} 普通攻擊，造成 ${damage} 點傷害！`);
      }
      return this.finishAction(cpu, target, result);
    }

    return this.executeAction(action);
  }
}
