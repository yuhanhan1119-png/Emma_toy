/**
 * 原創 Q 版角色繪製（參考三麗鷗可愛風格，非官方素材）
 */

function shade(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `rgb(${r},${g},${b})`;
}

function blob(ctx, cx, cy, rx, ry, color, stroke = '#FFFFFF', lineW = 3) {
  const grad = ctx.createRadialGradient(cx - rx * 0.2, cy - ry * 0.35, 1, cx, cy + ry * 0.1, Math.max(rx, ry));
  grad.addColorStop(0, color);
  grad.addColorStop(1, shade(color, -28));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineW;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath();
  ctx.ellipse(cx - rx * 0.28, cy - ry * 0.38, rx * 0.22, ry * 0.14, -0.4, 0, Math.PI * 2);
  ctx.fill();
}

function blush(ctx, cx, cy, spread = 13) {
  ctx.fillStyle = 'rgba(255, 140, 165, 0.5)';
  ctx.beginPath();
  ctx.ellipse(cx - spread, cy + 5, 8, 5, 0, 0, Math.PI * 2);
  ctx.ellipse(cx + spread, cy + 5, 8, 5, 0, 0, Math.PI * 2);
  ctx.fill();
}

function eyesRound(ctx, cx, cy, style = 'cute') {
  const positions = [cx - 12, cx + 12];
  positions.forEach((ex) => {
    if (style === 'kitty') {
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.ellipse(ex, cy, 2.8, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    if (style === 'kuromi') {
      blob(ctx, ex, cy, 7, 9, '#FF9EC8', '#FF6B9D', 2);
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(ex - 2, cy - 3, 2.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3D2B3F';
      ctx.beginPath();
      ctx.arc(ex + 1, cy + 1, 2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    ctx.fillStyle = '#2D2030';
    ctx.beginPath();
    ctx.ellipse(ex, cy, 6.5, 8.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ex - 2.5, cy - 3, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ex + 2, cy + 2, 1.6, 0, Math.PI * 2);
    ctx.fill();
  });
}

function mouthSmile(ctx, cx, cy) {
  ctx.strokeStyle = '#D4838F';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy - 1, 5.5, 0.12 * Math.PI, 0.88 * Math.PI);
  ctx.stroke();
}

/** 布丁狗風格 — 原創奶油犬 */
function drawPudding(ctx, cx, cy, r) {
  blob(ctx, cx, cy + 14, r * 1.05, r * 0.88, '#FFE566', '#F0C830');
  blob(ctx, cx, cy - 2, r * 0.95, r * 0.88, '#FFF59D', '#FFE082');

  ctx.fillStyle = '#A67C00';
  ctx.beginPath();
  ctx.ellipse(cx, cy - r * 1.05, r * 0.88, r * 0.32, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#C49A1A';
  ctx.fillRect(cx - r * 0.5, cy - r * 1.0, r * 1.0, r * 0.1);

  [-1, 1].forEach((s) => {
    blob(ctx, cx + s * r * 0.72, cy + r * 0.62, r * 0.2, r * 0.26, '#FFF9C4', '#FFE082', 2);
  });

  blush(ctx, cx, cy + 2);
  eyesRound(ctx, cx, cy - 4);
  mouthSmile(ctx, cx, cy + 9);
}

/** 大耳狗風格 — 原創雲朵犬 */
function drawCinnamoroll(ctx, cx, cy, r) {
  [-1, 1].forEach((s) => {
    blob(ctx, cx + s * r * 1.18, cy - r * 0.28, r * 0.4, r * 0.92, '#FFFFFF', '#D6EEFF', 2.5);
    ctx.fillStyle = '#E8F6FF';
    ctx.beginPath();
    ctx.ellipse(cx + s * r * 1.18, cy - r * 0.28, r * 0.2, r * 0.55, s * 0.2, 0, Math.PI * 2);
    ctx.fill();
  });

  blob(ctx, cx, cy + 12, r * 1.02, r * 0.82, '#FFFFFF', '#C8E6F5');
  blob(ctx, cx, cy + 2, r * 0.88, r * 0.78, '#FFFFFF', '#E3F4FF');

  blush(ctx, cx, cy + 6);
  eyesRound(ctx, cx, cy + 2);
  mouthSmile(ctx, cx, cy + 14);

  ctx.fillStyle = '#FFB6C1';
  ctx.beginPath();
  ctx.arc(cx, cy + 16, 4.5, 0, Math.PI * 2);
  ctx.fill();
}

/** Hello Kitty 風格 — 原創蝴蝶結貓 */
function drawHelloKitty(ctx, cx, cy, r) {
  blob(ctx, cx, cy + 10, r * 0.98, r * 0.78, '#FFFFFF', '#FFE4EC');
  blob(ctx, cx, cy, r * 0.9, r * 0.82, '#FFFFFF', '#FFF5F8');

  ctx.fillStyle = '#FF3D6B';
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.3, cy - r * 0.5);
  ctx.lineTo(cx + r * 1.05, cy - r * 0.95);
  ctx.lineTo(cx + r * 0.68, cy - r * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#FF8FA8';
  ctx.beginPath();
  ctx.arc(cx + r * 0.68, cy - r * 0.52, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FF3D6B';
  ctx.beginPath();
  ctx.arc(cx + r * 0.68, cy - r * 0.52, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#E0E0E0';
  ctx.lineWidth = 1.5;
  [-1, 1].forEach((s) => {
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + s * r * 0.5, cy + i * 4);
      ctx.lineTo(cx + s * r * 1.0, cy + i * 3);
      ctx.stroke();
    }
  });

  blush(ctx, cx, cy + 4);
  eyesRound(ctx, cx, cy - 2, 'kitty');

  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 9, 3.8, 4.8, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** 酷洛米風格 — 原創惡魔兔 */
function drawKuromi(ctx, cx, cy, r) {
  [-1, 1].forEach((s) => {
    ctx.fillStyle = '#2B2B2B';
    ctx.beginPath();
    ctx.moveTo(cx + s * r * 0.2, cy - r * 0.4);
    ctx.quadraticCurveTo(cx + s * r * 1.15, cy - r * 1.35, cx + s * r * 0.6, cy - r * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#C9A0FF';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  });

  blob(ctx, cx, cy + 12, r * 1.0, r * 0.82, '#4A4A4A', '#9B59B6');
  blob(ctx, cx, cy + 2, r * 0.88, r * 0.78, '#3A3A3A', '#7B4BB7');

  ctx.fillStyle = '#FFF';
  ctx.font = `bold ${r * 0.5}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('☠', cx, cy - r * 0.78);

  blush(ctx, cx, cy + 4);
  eyesRound(ctx, cx, cy, 'kuromi');

  ctx.strokeStyle = '#FF9EC8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy + 14);
  ctx.quadraticCurveTo(cx, cy + 10, cx + 6, cy + 14);
  ctx.stroke();

  ctx.fillStyle = '#2B2B2B';
  ctx.beginPath();
  ctx.moveTo(cx, cy + r * 0.75);
  ctx.quadraticCurveTo(cx + r * 0.45, cy + r * 1.05, cx + r * 0.35, cy + r * 0.85);
  ctx.stroke();
}

/** 美樂蒂風格 — 原創帽帽兔 */
function drawMelody(ctx, cx, cy, r) {
  ctx.fillStyle = '#FFB6C1';
  ctx.strokeStyle = '#FF8FAB';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy - r * 0.5, r * 1.0, Math.PI, 0);
  ctx.lineTo(cx + r, cy + r * 0.15);
  ctx.quadraticCurveTo(cx, cy + r * 0.38, cx - r, cy + r * 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  [-1, 1].forEach((s) => {
    blob(ctx, cx + s * r * 0.58, cy - r * 1.02, r * 0.2, r * 0.52, '#FFC0D0', '#FF9EB8', 2);
  });

  blob(ctx, cx, cy + 12, r * 0.82, r * 0.72, '#FFF0F5', '#FF9EC8');

  blush(ctx, cx, cy + 10);
  eyesRound(ctx, cx, cy + 6);
  mouthSmile(ctx, cx, cy + 18);

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(cx, cy - r * 0.1, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#FFD6E7';
  ctx.lineWidth = 2;
  ctx.stroke();
}

const DRAWERS = {
  pompompurin: drawPudding,
  cinnamoroll: drawCinnamoroll,
  hellokitty: drawHelloKitty,
  kuromi: drawKuromi,
  mymelody: drawMelody,
};

export function drawCharacter(ctx, x, y, size, charId, facing = 1) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size * 0.36;
  const flip = facing < 0 ? -1 : 1;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(flip, 1);
  ctx.translate(-cx, -cy);

  const draw = DRAWERS[charId];
  if (draw) draw(ctx, cx, cy, r);
  else {
    blob(ctx, cx, cy, r, r, '#FFB6C1');
    blush(ctx, cx, cy);
    eyesRound(ctx, cx, cy - 2);
    mouthSmile(ctx, cx, cy + 8);
  }

  ctx.restore();
}

export function createSpriteCanvas(charId, size = 80) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  canvas.className = 'char-sprite-canvas';

  const ctx = canvas.getContext('2d');
  const pad = Math.max(4, size * 0.05);
  ctx.fillStyle = 'rgba(255, 245, 250, 0.6)';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.2);
  ctx.fill();

  drawCharacter(ctx, pad, pad, size - pad * 2, charId, 1);
  return canvas;
}
