function drawFace(ctx, cx, cy, eyeY, mouthY) {
  ctx.fillStyle = '#4A3728';
  ctx.beginPath();
  ctx.arc(cx - 8, eyeY, 3, 0, Math.PI * 2);
  ctx.arc(cx + 8, eyeY, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#4A3728';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, mouthY, 6, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();
}

function drawBody(ctx, cx, cy, r, color, stroke = '#FFFFFF') {
  const grad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.1, cx, cy, r);
  grad.addColorStop(0, color);
  grad.addColorStop(1, shade(color, -20));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 3;
  ctx.stroke();
}

function shade(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `rgb(${r},${g},${b})`;
}

export function drawCharacter(ctx, charId, x, y, size, facing = 1) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size * 0.38;
  const flip = facing < 0 ? -1 : 1;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(flip, 1);
  ctx.translate(-cx, -cy);

  switch (charId) {
    case 'pompompurin':
      ctx.fillStyle = '#8B6914';
      ctx.beginPath();
      ctx.ellipse(cx, y + r * 0.2, r * 0.9, r * 0.35, 0, Math.PI, 0);
      ctx.fill();
      drawBody(ctx, cx, cy + 4, r, '#F5D76E', '#E8C547');
      drawFace(ctx, cx, cy - 2, cy - 6, cy + 8);
      ctx.fillStyle = '#8B6914';
      ctx.fillRect(cx - r * 0.7, y + 2, r * 1.4, r * 0.25);
      break;

    case 'cinnamoroll':
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#D0E8F8';
      ctx.lineWidth = 2;
      [-1, 1].forEach((side) => {
        ctx.beginPath();
        ctx.ellipse(cx + side * r * 1.1, cy - r * 0.5, r * 0.45, r * 0.75, side * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
      drawBody(ctx, cx, cy + 6, r * 0.95, '#FFFFFF', '#C8E6F5');
      drawFace(ctx, cx, cy + 2, cy - 2, cy + 10);
      ctx.fillStyle = '#FFB6C1';
      ctx.beginPath();
      ctx.arc(cx, cy + 12, 4, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'hellokitty':
      ctx.fillStyle = '#FF4D6D';
      ctx.beginPath();
      ctx.moveTo(cx + r * 0.5, y + 4);
      ctx.lineTo(cx + r * 1.1, y - r * 0.2);
      ctx.lineTo(cx + r * 0.7, y + r * 0.3);
      ctx.closePath();
      ctx.fill();
      drawBody(ctx, cx, cy + 4, r, '#FFFFFF', '#FFD6E7');
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 10, 3, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4A3728';
      ctx.beginPath();
      ctx.arc(cx - 7, cy - 2, 2.5, 0, Math.PI * 2);
      ctx.arc(cx + 7, cy - 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx, cy + 6, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.moveTo(cx - 4, cy + 6);
      ctx.lineTo(cx, cy + 10);
      ctx.lineTo(cx + 4, cy + 6);
      ctx.fill();
      break;

    case 'kuromi':
      ctx.fillStyle = '#2C2C2C';
      [-1, 1].forEach((side) => {
        ctx.beginPath();
        ctx.moveTo(cx + side * r * 0.3, cy - r * 0.5);
        ctx.lineTo(cx + side * r * 1.0, cy - r * 1.3);
        ctx.lineTo(cx + side * r * 0.7, cy - r * 0.3);
        ctx.closePath();
        ctx.fill();
      });
      drawBody(ctx, cx, cy + 4, r, '#3D3D3D', '#9B59B6');
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${r * 0.5}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('💀', cx, cy - r * 0.9);
      ctx.fillStyle = '#FF69B4';
      ctx.beginPath();
      ctx.arc(cx - 8, cy - 2, 4, 0, Math.PI * 2);
      ctx.arc(cx + 8, cy - 2, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4A3728';
      ctx.beginPath();
      ctx.arc(cx - 8, cy - 2, 1.5, 0, Math.PI * 2);
      ctx.arc(cx + 8, cy - 2, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#4A3728';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy + 10);
      ctx.lineTo(cx + 5, cy + 10);
      ctx.stroke();
      break;

    case 'mymelody':
      ctx.fillStyle = '#FFB6C1';
      ctx.beginPath();
      ctx.arc(cx, cy - r * 0.8, r * 0.95, Math.PI, 0);
      ctx.lineTo(cx + r * 0.95, cy - r * 0.2);
      ctx.lineTo(cx - r * 0.95, cy - r * 0.2);
      ctx.closePath();
      ctx.fill();
      [-1, 1].forEach((side) => {
        ctx.beginPath();
        ctx.ellipse(cx + side * r * 0.55, cy - r * 1.1, r * 0.22, r * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
      });
      drawBody(ctx, cx, cy + 6, r * 0.9, '#FFD6E7', '#FF9EC8');
      drawFace(ctx, cx, cy + 2, cy - 2, cy + 10);
      break;

    default:
      drawBody(ctx, cx, cy, r, '#FFB6C1');
      drawFace(ctx, cx, cy, cy - 4, cy + 8);
  }

  ctx.restore();
}
