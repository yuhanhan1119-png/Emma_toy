import { CHARACTERS, BATTLE_MAX_HP } from './characters.js';

const ARENA_W = 900;
const ARENA_H = 520;
const MOVE_SPEED = 4;
const JUMP_VELOCITY = -12;
const GRAVITY = 0.55;
const GROUND_Y = ARENA_H - 80;
const DRAIN_PER_SEC = 1.5;
const HIT_DAMAGE = 20;
const PROJECTILE_DAMAGE = 25;
const PROJECTILE_INTERVAL = 2200;
const PLAYER_SIZE = 56;

function createPlayer(charId, x, isCpu = false) {
  const char = CHARACTERS[charId];
  return {
    charId,
    name: char.name,
    color: char.color,
    emoji: char.emoji,
    ultimateName: char.ultimateName,
    x,
    y: GROUND_Y - PLAYER_SIZE,
    vx: 0,
    vy: 0,
    w: PLAYER_SIZE,
    h: PLAYER_SIZE,
    hp: BATTLE_MAX_HP,
    maxHp: BATTLE_MAX_HP,
    grounded: true,
    jumping: false,
    invulnUntil: 0,
    isCpu,
    shootTimer: PROJECTILE_INTERVAL * Math.random(),
    moveTimer: 0,
    moveDir: 0,
  };
}

export class ActionArena {
  constructor(canvas, mode, p1CharId, p2CharId, onEnd) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.mode = mode;
    this.onEnd = onEnd;
    this.running = false;
    this.frameId = null;
    this.lastTime = 0;
    this.projectiles = [];
    this.keys = {};
    this.gameOver = false;

    this.p1 = createPlayer(p1CharId, 120, false);
    this.p2 = createPlayer(p2CharId, ARENA_W - 120 - PLAYER_SIZE, mode === '1p');

    canvas.width = ARENA_W;
    canvas.height = ARENA_H;
  }

  bindKeys() {
    this.onKeyDown = (e) => {
      if (!this.running) return;
      this.keys[e.key] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === ' ' || e.key === 'Spacebar') this.tryJump(this.p1);
    };
    this.onKeyUp = (e) => { this.keys[e.key] = false; };
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  unbindKeys() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  tryJump(player) {
    if (player.grounded && player.hp > 0) {
      player.vy = JUMP_VELOCITY;
      player.grounded = false;
      player.jumping = true;
    }
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    this.bindKeys();
    this.loop(this.lastTime);
  }

  stop() {
    this.running = false;
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.unbindKeys();
  }

  loop(now) {
    if (!this.running) return;
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;
    this.update(dt, now);
    this.draw();
    if (!this.gameOver) {
      this.frameId = requestAnimationFrame((t) => this.loop(t));
    }
  }

  update(dt, now) {
    this.updatePlayer(this.p1, dt, {
      left: this.keys.ArrowLeft,
      right: this.keys.ArrowRight,
      up: this.keys.ArrowUp,
      down: this.keys.ArrowDown,
    });

    if (this.mode === '2p') {
      this.updatePlayer(this.p2, dt, {
        left: this.keys.a || this.keys.A,
        right: this.keys.d || this.keys.D,
        up: this.keys.w || this.keys.W,
        down: this.keys.s || this.keys.S,
      });
      if (this.keys.Shift) this.tryJump(this.p2);
    } else {
      this.updateCpu(this.p2, dt, now);
    }

    this.applyGravity(this.p1, dt);
    this.applyGravity(this.p2, dt);
    this.clampPlayer(this.p1);
    this.clampPlayer(this.p2);

    this.drainHp(dt);
    this.updateProjectiles(dt, now);
    this.cpuShoot(this.p2, this.p1, dt);
    if (this.mode === '2p') this.cpuShoot(this.p1, this.p2, dt, true);

    if (this.p1.hp <= 0 || this.p2.hp <= 0) {
      this.endGame();
    }
  }

  updatePlayer(p, dt, input) {
    if (p.hp <= 0) return;
    let dx = 0;
    let dy = 0;
    if (input.left) dx -= MOVE_SPEED;
    if (input.right) dx += MOVE_SPEED;
    if (input.up) dy -= MOVE_SPEED * 0.6;
    if (input.down) dy += MOVE_SPEED * 0.6;
    p.x += dx;
    p.y += dy;
  }

  updateCpu(cpu, target, dt) {
    if (cpu.hp <= 0) return;
    cpu.moveTimer -= dt * 1000;
    if (cpu.moveTimer <= 0) {
      cpu.moveDir = Math.floor(Math.random() * 5) - 2;
      cpu.moveTimer = 400 + Math.random() * 600;
    }
    cpu.x += cpu.moveDir * MOVE_SPEED * 0.8;

    const incoming = this.projectiles.find(
      (pr) => pr.owner !== cpu && this.willHitPlayer(pr, target === this.p1 ? this.p2 : this.p1)
    );
    if (incoming && cpu.grounded && Math.random() < 0.04) this.tryJump(cpu);

    const dist = target.x - cpu.x;
    if (Math.abs(dist) > 40) cpu.x += Math.sign(dist) * MOVE_SPEED * 0.5;
  }

  willHitPlayer(pr, player) {
    return Math.abs(pr.x - (player.x + player.w / 2)) < 80;
  }

  applyGravity(p, dt) {
    if (!p.grounded) {
      p.vy += GRAVITY;
      p.y += p.vy;
      if (p.y >= GROUND_Y - p.h) {
        p.y = GROUND_Y - p.h;
        p.vy = 0;
        p.grounded = true;
        p.jumping = false;
      }
    }
  }

  clampPlayer(p) {
    p.x = Math.max(10, Math.min(ARENA_W - p.w - 10, p.x));
    p.y = Math.max(60, Math.min(GROUND_Y - p.h, p.y));
  }

  drainHp(dt) {
    [this.p1, this.p2].forEach((p) => {
      if (p.hp > 0) p.hp = Math.max(0, p.hp - DRAIN_PER_SEC * dt);
    });
  }

  cpuShoot(shooter, target, dt, manual = false) {
    if (shooter.hp <= 0 || target.hp <= 0) return;
    shooter.shootTimer -= dt * 1000;
    if (shooter.shootTimer <= 0) {
      shooter.shootTimer = PROJECTILE_INTERVAL + Math.random() * 800;
      const dir = target.x > shooter.x ? 1 : -1;
      this.projectiles.push({
        x: shooter.x + shooter.w / 2,
        y: shooter.y + shooter.h * 0.6,
        vx: dir * 6,
        vy: 0,
        r: 12,
        owner: shooter,
        damage: PROJECTILE_DAMAGE,
      });
    }
  }

  updateProjectiles(dt, now) {
    this.projectiles = this.projectiles.filter((pr) => {
      pr.x += pr.vx;
      pr.y += pr.vy;
      if (pr.x < -20 || pr.x > ARENA_W + 20) return false;

      const target = pr.owner === this.p1 ? this.p2 : this.p1;
      if (target.hp <= 0) return false;
      if (now < target.invulnUntil) return true;

      const cx = target.x + target.w / 2;
      const cy = target.y + target.h / 2;
      const dx = pr.x - cx;
      const dy = pr.y - cy;
      const dist = Math.hypot(dx, dy);

      const dodged = target.jumping || !target.grounded || target.y < GROUND_Y - target.h - 10;
      if (dist < pr.r + target.w * 0.35 && !dodged) {
        target.hp = Math.max(0, target.hp - pr.damage);
        target.invulnUntil = now + 400;
        return false;
      }
      return true;
    });
  }

  endGame() {
    this.gameOver = true;
    this.running = false;
    const winner = this.p1.hp > this.p2.hp ? this.p1
      : this.p2.hp > this.p1.hp ? this.p2
      : null;
    if (this.onEnd) this.onEnd(winner, this.p1, this.p2);
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, ARENA_W, ARENA_H);

    const sky = ctx.createLinearGradient(0, 0, 0, ARENA_H);
    sky.addColorStop(0, '#87CEEB');
    sky.addColorStop(0.6, '#B8E0F5');
    sky.addColorStop(1, '#A8E6A0');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, ARENA_W, ARENA_H);

    ctx.fillStyle = '#7BC96F';
    ctx.fillRect(0, GROUND_Y, ARENA_W, ARENA_H - GROUND_Y);
    ctx.fillStyle = '#8FD480';
    ctx.fillRect(0, GROUND_Y, ARENA_W, 8);

    this.projectiles.forEach((pr) => {
      ctx.beginPath();
      ctx.arc(pr.x, pr.y, pr.r, 0, Math.PI * 2);
      ctx.fillStyle = pr.owner === this.p1 ? '#FF6B9D' : '#9B59B6';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    this.drawPlayer(this.p1);
    this.drawPlayer(this.p2);
  }

  drawPlayer(p) {
    if (p.hp <= 0) return;
    const ctx = this.ctx;
    const { x, y, w, h } = p;

    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, GROUND_Y + 4, w * 0.4, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = '28px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.emoji, x + w / 2, y + h / 2);

    if (p.jumping || !p.grounded) {
      ctx.font = 'bold 12px Nunito, sans-serif';
      ctx.fillStyle = '#FF6B9D';
      ctx.fillText('閃避!', x + w / 2, y - 10);
    }
  }

  getHpPercent(p) {
    return (p.hp / p.maxHp) * 100;
  }
}

export { ARENA_W, ARENA_H };
