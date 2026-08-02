import { createFighter } from './characters.js';

export class Battle {
  constructor(mode, p1CharId, p2CharId) {
    this.mode = mode;
    this.p1 = createFighter(p1CharId);
    this.p2 = createFighter(p2CharId);
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

  executeAction(action) {
    if (this.gameOver) return null;

    const actor = this.getCurrentFighter();
    const target = this.getOpponent();
    let result = { action, actor: this.currentTurn, damage: 0, healed: 0 };

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
        this.addLog(`${actor.name} 使出「${actor.specialName}」！造成 ${damage} 點傷害！`);
        break;
      }
      case 'heal': {
        const healed = Math.min(actor.heal, actor.hp - actor.currentHp);
        actor.currentHp = Math.min(actor.hp, actor.currentHp + actor.heal);
        result.healed = healed;
        this.addLog(`${actor.name} 回復了 ${actor.heal} 點生命！`);
        break;
      }
    }

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

    if (hpRatio < 0.35 && Math.random() < 0.6) return 'heal';
    if (!cpu.specialUsed && opponent.currentHp < 40 && Math.random() < 0.7) return 'special';
    if (!cpu.specialUsed && Math.random() < 0.35) return 'special';
    if (Math.random() < 0.25) return 'heal';
    return 'attack';
  }
}
