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
const FOOD_SIZE = 28;
const FOOD_SPAWN_MIN = 3500;
const FOOD_SPAWN_MAX = 7000;
const MAX_FOOD_ON_FIELD = 4;
const FOOD_LIFETIME = 12000;

const FOOD_TYPES = [
  { emoji: '🍫', name: '巧克力', heal: 5, weight: 1 },
  { emoji: '🍗', name: '雞腿', heal: 3, weight: 2 },
  { emoji: '🍓', name: '草莓', heal: 2, weight: 3 },
  { emoji: '🍎', name: '蘋果', heal: 1, weight: 4 },
  { emoji: '🍊', name: '橘子', heal: 1, weight: 4 },
  { emoji: '🍇', name: '葡萄', heal: 1, weight: 4 },
  { emoji: '🍌', name: '香蕉', heal: 1, weight: 4 },
  { emoji: '🍉', name: '西瓜', heal: 1, weight: 4 },
];

function pickRandomFood() {
  const total = FOOD_TYPES.reduce((sum, f) => sum + f.weight, 0);
  let roll = Math.random() * total;
  for (const food of FOOD_TYPES) {
    roll -= food.weight;
    if (roll <= 0) return food;
  }
  return FOOD_TYPES[FOOD_TYPES.length - 1];
}

function createPlayer(charId, x, isCpu = false) {
  const char = CHARACTERS[charId];
  return {
    charId,
    name: char.name,
    color: char.color,
    emoji: char.emoji,
    ultimateName: char.ultimateName,
    basicSkill: char.specialName,
    strongSkill: char.ultimateName,
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
    basicShootCd: 0,
    strongShootCd: 0,
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
    this.foods = [];
    this.pickupTexts = [];
    this.skillTexts = [];
    this.foodSpawnTimer = 2000;
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
      const key = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key) || e.key.startsWith('Arrow')) {
        e.preventDefault();
      }
      if (e.key === ' ' || e.key === 'Spacebar') this.tryJump(this.p1);

      if (key === 'd') this.tryShoot(this.p1, 'basic');
      if (key === 'w') this.tryShoot(this.p1, 'strong');
      if (this.mode === '2p') {
        if (key === 'j') this.tryShoot(this.p2, 'basic');
        if (key === 'k') this.tryShoot(this.p2, 'strong');
      }
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

  tryShoot(player, type) {
    if (!player || player.isCpu || player.hp <= 0 || this.gameOver) return;
    const target = player === this.p1 ? this.p2 : this.p1;
    if (target.hp <= 0) return;
    this.playerShoot(player, target, type);
  }

  playerShoot(shooter, target, type) {
    const now = performance.now();
    const isStrong = type === 'strong';
    const cdKey = isStrong ? 'strongShootCd' : 'basicShootCd';
    const cooldown = isStrong ? 600 : 350;
    if (now < shooter[cdKey]) return;
    shooter[cdKey] = now + cooldown;
    this.spawnSkillProjectile(shooter, target, type, now);
  }

  spawnSkillProjectile(shooter, target, type, now = performance.now()) {
    const isStrong = type === 'strong';
    const skillName = isStrong ? shooter.strongSkill : shooter.basicSkill;
    const sx = shooter.x + shooter.w / 2;
    const sy = shooter.y + shooter.h / 2;
    const tx = target.x + target.w / 2;
    const ty = target.y + target.h / 2;
    const angle = Math.atan2(ty - sy, tx - sx);
    const speed = isStrong ? 9 : 7;
    const damage = isStrong ? shooter.strongSkill === "Pudingo's Shaking Body" ? 40 : 35 : 22;

    this.projectiles.push({
      x: sx,
      y: sy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: isStrong ? 18 : 14,
      owner: shooter,
      damage,
      isStrong,
      skillName,
      skillEmoji: shooter.emoji,
      skillColor: shooter.color,
    });

    this.skillTexts.push({
      x: sx,
      y: sy - 30,
      text: `${shooter.name} 使出「${skillName}」！`,
      until: now + 1000,
    });
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
    this.updateFoods(dt, now);
    this.updateProjectiles(dt, now);
    this.cpuShoot(this.p2, this.p1, dt);
    if (this.mode === '2p') this.cpuShoot(this.p1, this.p2, dt);

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

    const nearestFood = this.getNearestFood(cpu);
    if (nearestFood && cpu.hp < cpu.maxHp * 0.9 && Math.random() < 0.03) {
      const fx = nearestFood.x + nearestFood.size / 2;
      const cx = cpu.x + cpu.w / 2;
      cpu.x += Math.sign(fx - cx) * MOVE_SPEED * 0.7;
    }
  }

  getNearestFood(player) {
    if (this.foods.length === 0) return null;
    const cx = player.x + player.w / 2;
    const cy = player.y + player.h / 2;
    return this.foods.reduce((best, food) => {
      const fx = food.x + food.size / 2;
      const fy = food.y + food.size / 2;
      const dist = Math.hypot(fx - cx, fy - cy);
      if (!best || dist < best.dist) return { food, dist };
      return best;
    }, null)?.food ?? null;
  }

  spawnFood(now) {
    if (this.foods.length >= MAX_FOOD_ON_FIELD) return;
    const type = pickRandomFood();
    const size = FOOD_SIZE;
    const x = 40 + Math.random() * (ARENA_W - 80 - size);
    const y = GROUND_Y - size - 4;
    this.foods.push({
      ...type,
      x,
      y,
      size,
      spawnAt: now,
      bob: Math.random() * Math.PI * 2,
    });
  }

  updateFoods(dt, now) {
    this.foodSpawnTimer -= dt * 1000;
    if (this.foodSpawnTimer <= 0) {
      this.spawnFood(now);
      this.foodSpawnTimer = FOOD_SPAWN_MIN + Math.random() * (FOOD_SPAWN_MAX - FOOD_SPAWN_MIN);
    }

    this.foods = this.foods.filter((food) => now - food.spawnAt < FOOD_LIFETIME);

    [this.p1, this.p2].forEach((player) => {
      if (player.hp <= 0) return;
      this.foods = this.foods.filter((food) => {
        if (!this.playerHitsFood(player, food)) return true;
        player.hp = Math.min(player.maxHp, player.hp + food.heal);
        this.pickupTexts.push({
          x: food.x + food.size / 2,
          y: food.y,
          text: `+${food.heal}`,
          label: food.name,
          until: now + 900,
        });
        return false;
      });
    });

    this.pickupTexts = this.pickupTexts.filter((t) => now < t.until);
    this.skillTexts = this.skillTexts.filter((t) => now < t.until);
  }

  playerHitsFood(player, food) {
    const cx = player.x + player.w / 2;
    const cy = player.y + player.h / 2;
    const fx = food.x + food.size / 2;
    const fy = food.y + food.size / 2;
    return Math.hypot(cx - fx, cy - fy) < player.w * 0.45 + food.size * 0.45;
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

  cpuShoot(shooter, target, dt) {
    if (shooter.hp <= 0 || target.hp <= 0) return;
    shooter.shootTimer -= dt * 1000;
    if (shooter.shootTimer <= 0) {
      shooter.shootTimer = PROJECTILE_INTERVAL + Math.random() * 800;
      const type = Math.random() < 0.35 ? 'strong' : 'basic';
      this.spawnSkillProjectile(shooter, target, type);
    }
  }

  updateProjectiles(dt, now) {
    this.projectiles = this.projectiles.filter((pr) => {
      pr.x += pr.vx;
      pr.y += pr.vy;
      if (pr.x < -20 || pr.x > ARENA_W + 20 || pr.y < -20 || pr.y > ARENA_H + 20) return false;

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
      const r = pr.r;
      ctx.fillStyle = pr.skillColor || (pr.owner === this.p1 ? '#FF6B9D' : '#9B59B6');
      ctx.beginPath();
      ctx.arc(pr.x, pr.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = pr.isStrong ? '#FFD700' : 'white';
      ctx.lineWidth = pr.isStrong ? 3 : 2;
      ctx.stroke();

      ctx.font = `${r}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pr.skillEmoji || '✨', pr.x, pr.y);

      ctx.font = `bold ${pr.isStrong ? 11 : 10}px Nunito, sans-serif`;
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#5C3D5E';
      ctx.lineWidth = 3;
      const label = pr.skillName || '攻擊';
      ctx.strokeText(label, pr.x, pr.y - r - 10);
      ctx.fillText(label, pr.x, pr.y - r - 10);
    });

    const now = performance.now();
    this.foods.forEach((food) => {
      const bobY = Math.sin(now / 300 + food.bob) * 3;
      const cx = food.x + food.size / 2;
      const cy = food.y + food.size / 2 + bobY;
      const lifeRatio = 1 - (now - food.spawnAt) / FOOD_LIFETIME;
      ctx.globalAlpha = lifeRatio < 0.2 ? lifeRatio * 5 : 1;

      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.arc(cx, cy, food.size / 2 + 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = `${food.size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(food.emoji, cx, cy);

      ctx.font = 'bold 10px Nunito, sans-serif';
      ctx.fillStyle = '#5C3D5E';
      ctx.fillText(`+${food.heal}`, cx, cy + food.size / 2 + 8);
      ctx.globalAlpha = 1;
    });

    this.pickupTexts.forEach((t) => {
      const alpha = (t.until - now) / 900;
      ctx.globalAlpha = alpha;
      ctx.font = 'bold 16px Nunito, sans-serif';
      ctx.fillStyle = '#2ECC71';
      ctx.textAlign = 'center';
      ctx.fillText(`${t.text} ${t.label}`, t.x, t.y - 20 * (1 - alpha));
      ctx.globalAlpha = 1;
    });

    this.skillTexts.forEach((t) => {
      const alpha = Math.min(1, (t.until - now) / 1000);
      ctx.globalAlpha = alpha;
      ctx.font = 'bold 14px Nunito, sans-serif';
      ctx.fillStyle = '#FF6B9D';
      ctx.textAlign = 'center';
      ctx.fillText(t.text, t.x, t.y - 15 * (1 - alpha));
      ctx.globalAlpha = 1;
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
