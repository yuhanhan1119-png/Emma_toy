function shade(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `rgb(${r},${g},${b})`;
}

function softCircle(ctx, cx, cy, r, color, stroke = '#FFFFFF', lineW = 3) {
  const grad = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.35, r * 0.1, cx, cy + r * 0.1, r);
  grad.addColorStop(0, color);
  grad.addColorStop(1, shade(color, -25));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineW;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.28, cy - r * 0.32, r * 0.22, r * 0.14, -0.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawBlush(ctx, cx, cy, spread = 14) {
  ctx.fillStyle = 'rgba(255, 150, 170, 0.55)';
  ctx.beginPath();
  ctx.ellipse(cx - spread, cy + 6, 7, 4, 0, 0, Math.PI * 2);
  ctx.ellipse(cx + spread, cy + 6, 7, 4, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawKawaiiEyes(ctx, cx, cy, style = 'round') {
  const eyes = [
    { x: cx - 11, y: cy },
    { x: cx + 11, y: cy },
  ];

  eyes.forEach((eye) => {
    if (style === 'kitty') {
      ctx.fillStyle = '#2D2D2D';
      ctx.beginPath();
      ctx.ellipse(eye.x, eye.y, 2.5, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    if (style === 'kuromi') {
      ctx.fillStyle = '#FF8FC8';
      ctx.beginPath();
      ctx.ellipse(eye.x, eye.y, 7, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(eye.x - 2, eye.y - 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3D2B3F';
      ctx.beginPath();
      ctx.arc(eye.x + 1, eye.y + 1, 2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    ctx.fillStyle = '#3D2B3F';
    ctx.beginPath();
    ctx.ellipse(eye.x, eye.y, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(eye.x - 2, eye.y - 3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(eye.x + 2, eye.y + 2, 1.5, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawHappyMouth(ctx, cx, cy) {
  ctx.strokeStyle = '#C97B8A';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy - 2, 5, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
}

function drawPompompurin(ctx, cx, cy, r) {
  softCircle(ctx, cx, cy + 8, r * 1.05, '#FFE566', '#F0C830', 3);
  softCircle(ctx, cx, cy - 2, r * 0.92, '#FFF176', '#F5D76E', 3);

  ctx.fillStyle = '#A67C00';
  ctx.beginPath();
  ctx.ellipse(cx, cy - r * 1.05, r * 0.85, r * 0.35, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#C49A1A';
  ctx.fillRect(cx - r * 0.55, cy - r * 1.02, r * 1.1, r * 0.12);

  [-1, 1].forEach((side) => {
    softCircle(ctx, cx + side * r * 0.75, cy + r * 0.55, r * 0.22, '#FFF59D', '#F5D76E', 2);
  });

  drawBlush(ctx, cx, cy + 2, 12);
  drawKawaiiEyes(ctx, cx, cy - 4);
  drawHappyMouth(ctx, cx, cy + 8);
}

function drawCinnamoroll(ctx, cx, cy, r) {
  [-1, 1].forEach((side) => {
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#C5E7FA';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(cx + side * r * 1.15, cy - r * 0.35, r * 0.42, r * 0.88, side * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#DDF3FF';
    ctx.beginPath();
    ctx.ellipse(cx + side * r * 1.15, cy - r * 0.35, r * 0.22, r * 0.55, side * 0.25, 0, Math.PI * 2);
    ctx.fill();
  });

  softCircle(ctx, cx, cy + 10, r * 1.0, '#FFFFFF', '#D0ECFF', 3);
  softCircle(ctx, cx, cy, r * 0.88, '#FFFFFF', '#E8F6FF', 3);

  drawBlush(ctx, cx, cy + 6, 11);
  drawKawaiiEyes(ctx, cx, cy + 2);
  drawHappyMouth(ctx, cx, cy + 14);

  ctx.fillStyle = '#FFB6C1';
  ctx.beginPath();
  ctx.arc(cx, cy + 16, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawHelloKitty(ctx, cx, cy, r) {
  softCircle(ctx, cx, cy + 6, r * 1.0, '#FFFFFF', '#FFD6E7', 3);
  softCircle(ctx, cx, cy - 2, r * 0.9, '#FFFFFF', '#FFF0F5', 3);

  ctx.fillStyle = '#FF4D6D';
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.35, cy - r * 0.55);
  ctx.lineTo(cx + r * 1.05, cy - r * 0.95);
  ctx.lineTo(cx + r * 0.75, cy - r * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#FF8FA8';
  ctx.beginPath();
  ctx.arc(cx + r * 0.72, cy - r * 0.55, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#DDDDDD';
  ctx.lineWidth = 1.5;
  [-1, 1].forEach((side) => {
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + side * r * 0.55, cy + i * 4);
      ctx.lineTo(cx + side * r * 1.05, cy + i * 3);
      ctx.stroke();
    }
  });

  drawBlush(ctx, cx, cy + 4, 10);
  drawKawaiiEyes(ctx, cx, cy - 2, 'kitty');

  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 8, 3.5, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawKuromi(ctx, cx, cy, r) {
  [-1, 1].forEach((side) => {
    ctx.fillStyle = '#2B2B2B';
    ctx.beginPath();
    ctx.moveTo(cx + side * r * 0.25, cy - r * 0.45);
    ctx.quadraticCurveTo(cx + side * r * 1.2, cy - r * 1.35, cx + side * r * 0.65, cy - r * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#B57BFF';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  softCircle(ctx, cx, cy + 8, r * 1.02, '#4A4A4A', '#9B59B6', 3);
  softCircle(ctx, cx, cy, r * 0.88, '#3A3A3A', '#7B4BB7', 3);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${r * 0.55}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('💀', cx, cy - r * 0.82);

  drawBlush(ctx, cx, cy + 4, 10);
  drawKawaiiEyes(ctx, cx, cy, 'kuromi');

  ctx.strokeStyle = '#FF8FC8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy + 14);
  ctx.quadraticCurveTo(cx, cy + 10, cx + 6, cy + 14);
  ctx.stroke();
}

function drawMyMelody(ctx, cx, cy, r) {
  ctx.fillStyle = '#FFB6C1';
  ctx.strokeStyle = '#FF8FAB';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy - r * 0.55, r * 1.0, Math.PI, 0);
  ctx.lineTo(cx + r, cy + r * 0.1);
  ctx.quadraticCurveTo(cx, cy + r * 0.35, cx - r, cy + r * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  [-1, 1].forEach((side) => {
    ctx.fillStyle = '#FFC0D0';
    ctx.beginPath();
    ctx.ellipse(cx + side * r * 0.58, cy - r * 1.05, r * 0.2, r * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FF9EB8';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  softCircle(ctx, cx, cy + 10, r * 0.82, '#FFF0F5', '#FF9EC8', 3);

  drawBlush(ctx, cx, cy + 10, 9);
  drawKawaiiEyes(ctx, cx, cy + 6);
  drawHappyMouth(ctx, cx, cy + 18);

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(cx, cy - r * 0.15, 5, 0, Math.PI * 2);
  ctx.fill();
}

export function drawCharacter(ctx, x, y, size, charId, facing = 1) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size * 0.34;
  const flip = facing < 0 ? -1 : 1;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(flip, 1);
  ctx.translate(-cx, -cy);

  switch (charId) {
    case 'pompompurin': drawPompompurin(ctx, cx, cy, r); break;
    case 'cinnamoroll': drawCinnamoroll(ctx, cx, cy, r); break;
    case 'hellokitty': drawHelloKitty(ctx, cx, cy, r); break;
    case 'kuromi': drawKuromi(ctx, cx, cy, r); break;
    case 'mymelody': drawMyMelody(ctx, cx, cy, r); break;
    default:
      softCircle(ctx, cx, cy, r, '#FFB6C1');
      drawBlush(ctx, cx, cy);
      drawKawaiiEyes(ctx, cx, cy - 2);
      drawHappyMouth(ctx, cx, cy + 8);
  }

  ctx.restore();
}

export function createSpriteCanvas(charId, size = 80) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  canvas.className = 'char-sprite-canvas';
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);
  drawCharacter(ctx, 2, 2, size - 4, charId, 1);
  return canvas;
}
