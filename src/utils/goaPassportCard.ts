import type { PhotoAdjustments, IDCardData } from '../types';
import QRCode from 'qrcode';
import { encodeVerificationUrl } from './verifier';

export interface GoaPassportOpts {
  image: HTMLImageElement | null;
  adjustments: PhotoAdjustments;
  cardData: IDCardData;
}

function applyFilters(ctx: CanvasRenderingContext2D, adj: PhotoAdjustments) {
  let filterStr = `brightness(${adj.brightness}%) contrast(${adj.contrast}%) saturate(${adj.saturation}%)`;
  switch (adj.filter) {
    case 'cyber':    filterStr += ' hue-rotate(180deg) contrast(125%)'; break;
    case 'sunset':   filterStr += ' sepia(35%) hue-rotate(330deg) saturate(140%)'; break;
    case 'crisp':    filterStr += ' contrast(130%) saturate(110%)'; break;
    case 'vintage':  filterStr += ' sepia(50%) contrast(90%)'; break;
    case 'mono':     filterStr += ' grayscale(100%) contrast(120%)'; break;
    case 'dramatic': filterStr += ' contrast(150%) brightness(90%)'; break;
  }
  ctx.filter = filterStr;
}

function drawPalmTree(
  ctx: CanvasRenderingContext2D,
  tx: number, ty: number,
  scale: number, flip: boolean,
  color: string
) {
  ctx.save();
  ctx.translate(tx, ty);
  if (flip) ctx.scale(-1, 1);
  ctx.scale(scale, scale);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(0, 180);
  ctx.quadraticCurveTo(-8, 90, -4, 0);
  ctx.stroke();
  ctx.lineWidth = 4;
  const fronds: [number, number, number, number][] = [
    [-90, -20, -130, -10],
    [-55, -70, -70, -110],
    [10, -85, 20, -130],
    [70, -55, 110, -70],
    [95, -15, 140, -5],
  ];
  fronds.forEach(([cx, cy, ex, ey]) => {
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.quadraticCurveTo(cx, cy, ex, ey);
    ctx.stroke();
  });
  ctx.restore();
}

function drawCoderOnChair(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  shirt: string, skin: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#06231A';
  ctx.fillRect(8, 42, 36, 6);
  ctx.fillRect(14, 20, 6, 28);
  ctx.fillRect(34, 20, 6, 28);
  ctx.fillStyle = shirt;
  ctx.beginPath();
  ctx.ellipse(26, 28, 16, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(26, 8, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#06231A';
  ctx.fillRect(18, 38, 22, 14);
  ctx.fillStyle = '#F5D505';
  ctx.fillRect(20, 40, 18, 10);
  ctx.restore();
}

function drawPersonWalking(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  color: string, scale = 1
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, -28, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-5, -20, 10, 22);
  ctx.beginPath();
  ctx.moveTo(-5, 2);
  ctx.lineTo(-12, 22);
  ctx.lineTo(-6, 22);
  ctx.lineTo(0, 8);
  ctx.lineTo(6, 22);
  ctx.lineTo(12, 22);
  ctx.lineTo(5, 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawPinkScooter(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  pink: string, cream: string, yellow: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#06231A';
  ctx.beginPath();
  ctx.arc(18, 36, 10, 0, Math.PI * 2);
  ctx.arc(78, 36, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = pink;
  ctx.beginPath();
  ctx.moveTo(28, 28);
  ctx.lineTo(70, 28);
  ctx.quadraticCurveTo(88, 28, 88, 14);
  ctx.lineTo(78, 14);
  ctx.quadraticCurveTo(74, 22, 60, 22);
  ctx.lineTo(30, 22);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = yellow;
  ctx.fillRect(70, 6, 6, 14);
  ctx.fillStyle = cream;
  ctx.beginPath();
  ctx.ellipse(28, 8, 14, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawIllustratedBeachBand(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number
) {
  const YELLOW = '#F5D505';
  const PINK = '#F0127A';
  const GREEN = '#004D33';
  const GREEN2 = '#0A6644';
  const CREAM = '#F2E8D9';
  const WHITE = '#FFFFFF';

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  ctx.fillStyle = GREEN;
  ctx.fillRect(x, y, w, h);

  const glow = ctx.createRadialGradient(x + w * 0.3, y + h * 0.3, 20, x + w * 0.35, y + h * 0.35, h * 0.5);
  glow.addColorStop(0, 'rgba(245,213,5,0.22)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(x, y, w, h);

  ctx.beginPath();
  ctx.arc(x + w * 0.16, y + h * 0.26, h * 0.1, 0, Math.PI * 2);
  ctx.fillStyle = YELLOW;
  ctx.fill();

  ctx.strokeStyle = WHITE;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  [[0.26, 0.16], [0.32, 0.12], [0.38, 0.18], [0.5, 0.1]].forEach(([fx, fy]) => {
    const bx = x + w * fx;
    const by = y + h * fy;
    ctx.beginPath();
    ctx.moveTo(bx - 10, by);
    ctx.quadraticCurveTo(bx, by - 8, bx + 10, by);
    ctx.stroke();
  });

  ctx.fillStyle = GREEN2;
  ctx.fillRect(x, y + h * 0.52, w, h * 0.18);
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const wy = y + h * 0.55 + i * 10;
    ctx.beginPath();
    ctx.moveTo(x, wy);
    for (let px = 0; px <= w; px += 18) ctx.lineTo(x + px, wy + Math.sin(px * 0.05 + i) * 3);
    ctx.stroke();
  }

  ctx.fillStyle = '#1a6b45';
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.68);
  ctx.quadraticCurveTo(x + w * 0.5, y + h * 0.62, x + w, y + h * 0.7);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fill();

  drawPalmTree(ctx, x + 48, y + h * 0.4, 0.85, false, 'rgba(255,255,255,0.55)');
  drawPalmTree(ctx, x + 105, y + h * 0.46, 0.65, false, 'rgba(255,255,255,0.4)');

  ctx.fillStyle = YELLOW;
  ctx.beginPath();
  ctx.ellipse(x + w * 0.2, y + h * 0.6, 8, 34, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PINK;
  ctx.beginPath();
  ctx.ellipse(x + w * 0.23, y + h * 0.62, 7, 30, -0.25, 0, Math.PI * 2);
  ctx.fill();

  const hx = x + w * 0.28;
  const hy = y + h * 0.46;
  ctx.fillStyle = CREAM;
  ctx.fillRect(hx, hy + 32, 70, 48);
  ctx.fillStyle = PINK;
  ctx.beginPath();
  ctx.moveTo(hx - 8, hy + 32);
  ctx.lineTo(hx + 35, hy);
  ctx.lineTo(hx + 78, hy + 32);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = GREEN;
  ctx.fillRect(hx + 26, hy + 45, 20, 35);

  const lx = x + w * 0.58;
  const ly = y + h * 0.32;
  ctx.fillStyle = CREAM;
  ctx.fillRect(lx, ly + 18, 26, 95);
  ctx.fillStyle = PINK;
  ctx.fillRect(lx - 4, ly + 8, 34, 16);
  ctx.beginPath();
  ctx.moveTo(lx + 3, ly + 8);
  ctx.lineTo(lx + 13, ly - 10);
  ctx.lineTo(lx + 23, ly + 8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = YELLOW;
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.moveTo(lx + 13, ly + 20);
  ctx.lineTo(lx + 85, ly + 42);
  ctx.lineTo(lx + 13, ly + 52);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  const house = (hx2: number, hy2: number, ww: number, hh2: number, roof: string) => {
    ctx.fillStyle = WHITE;
    ctx.fillRect(hx2, hy2, ww, hh2);
    ctx.fillStyle = roof;
    ctx.beginPath();
    ctx.moveTo(hx2 - 4, hy2);
    ctx.lineTo(hx2 + ww / 2, hy2 - 20);
    ctx.lineTo(hx2 + ww + 4, hy2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = PINK;
    ctx.fillRect(hx2 + ww * 0.35, hy2 + hh2 * 0.4, ww * 0.28, hh2 * 0.4);
    ctx.fillStyle = YELLOW;
    ctx.fillRect(hx2 + 6, hy2 + 10, 9, 9);
    ctx.fillRect(hx2 + ww - 15, hy2 + 10, 9, 9);
  };
  house(x + w * 0.7, y + h * 0.48, 52, 48, '#E8A317');
  house(x + w * 0.76, y + h * 0.4, 46, 44, PINK);
  house(x + w * 0.84, y + h * 0.5, 50, 46, YELLOW);

  drawPalmTree(ctx, x + w - 55, y + h * 0.38, 0.9, true, 'rgba(255,255,255,0.5)');

  const ux = x + w * 0.42;
  const uy = y + h * 0.76;
  ctx.strokeStyle = '#06231A';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(ux, uy - 6);
  ctx.lineTo(ux, uy + 38);
  ctx.stroke();
  ctx.fillStyle = PINK;
  ctx.beginPath();
  ctx.moveTo(ux - 38, uy);
  ctx.quadraticCurveTo(ux, uy - 30, ux + 38, uy);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = YELLOW;
  ctx.beginPath();
  ctx.moveTo(ux - 18, uy);
  ctx.quadraticCurveTo(ux, uy - 14, ux + 18, uy);
  ctx.closePath();
  ctx.fill();
  drawCoderOnChair(ctx, ux - 52, uy + 4, YELLOW, CREAM);
  drawCoderOnChair(ctx, ux + 2, uy + 8, PINK, CREAM);
  drawPersonWalking(ctx, x + w * 0.55, y + h * 0.8, CREAM, 0.85);

  ctx.restore();
}

/** Unique Builder Passport badge — flat Goa illustration + cream info panel. */
export function renderGoaResortCard(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  opts: GoaPassportOpts
) {
  const W = 1200, H = 1800;
  canvas.width = W;
  canvas.height = H;
  ctx.clearRect(0, 0, W, H);

  const YELLOW = '#F5D505';
  const PINK   = '#F0127A';
  const GREEN  = '#004D33';
  const CREAM  = '#F2E8D9';
  const WHITE  = '#FFFFFF';
  const INK    = '#06231A';

  ctx.save();
  const r = 52;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') ctx.roundRect(0, 0, W, H, r);
  else ctx.rect(0, 0, W, H);
  ctx.fillStyle = GREEN;
  ctx.fill();
  ctx.save();
  ctx.clip();

  // Lanyard punch hole
  ctx.fillStyle = INK;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') ctx.roundRect(W / 2 - 48, 28, 96, 28, 14);
  else ctx.rect(W / 2 - 48, 28, 96, 28);
  ctx.fill();
  ctx.strokeStyle = 'rgba(245,213,5,0.45)';
  ctx.lineWidth = 3;
  ctx.stroke();

  // HACKER गोवा HOUSE
  ctx.textAlign = 'center';
  ctx.fillStyle = YELLOW;
  ctx.font = '900 78px "Fraunces", "Arial Black", sans-serif';
  ctx.fillText('HACKER', W / 2 - 140, 140);
  ctx.fillText('HOUSE', W / 2 + 155, 140);
  ctx.fillStyle = PINK;
  ctx.font = '900 50px "Fraunces", serif';
  ctx.fillText('गोवा', W / 2 + 10, 136);

  ctx.fillStyle = WHITE;
  ctx.font = '700 26px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('📍  GOA, INDIA', 72, 195);
  ctx.textAlign = 'right';
  ctx.fillText('📅  28 – 31 OCT 2026', W - 72, 195);
  ctx.strokeStyle = YELLOW;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 40, 188);
  ctx.quadraticCurveTo(W / 2, 176, W / 2 + 40, 188);
  ctx.stroke();

  const sceneY = 220;
  const sceneH = 560;
  drawIllustratedBeachBand(ctx, 0, sceneY, W, sceneH);

  const photoR = 210;
  const photoX = W / 2;
  const photoY = sceneY + sceneH - 20;

  const ring = ctx.createRadialGradient(photoX, photoY, photoR - 8, photoX, photoY, photoR + 30);
  ring.addColorStop(0, 'rgba(245,213,5,0.55)');
  ring.addColorStop(1, 'transparent');
  ctx.fillStyle = ring;
  ctx.beginPath();
  ctx.arc(photoX, photoY, photoR + 30, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(photoX, photoY, photoR + 12, 0, Math.PI * 2);
  ctx.fillStyle = INK;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(photoX, photoY, photoR + 5, 0, Math.PI * 2);
  ctx.strokeStyle = YELLOW;
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  ctx.arc(photoX, photoY, photoR, 0, Math.PI * 2);
  ctx.clip();
  if (opts.image) {
    const adj = opts.adjustments;
    const d = photoR * 2;
    ctx.translate(photoX, photoY);
    ctx.rotate((adj.rotation * Math.PI) / 180);
    ctx.scale(adj.zoom, adj.zoom);
    applyFilters(ctx, adj);
    ctx.drawImage(opts.image, -d / 2 - adj.panX, -d / 2 - adj.panY, d, d);
    ctx.filter = 'none';
  } else {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(photoX - photoR, photoY - photoR, photoR * 2, photoR * 2);
    ctx.fillStyle = WHITE;
    ctx.font = '700 28px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DROP YOUR PHOTO HERE', photoX, photoY);
    ctx.textBaseline = 'alphabetic';
  }
  ctx.restore();

  // Cream lower panel with wavy top
  const creamTop = photoY + photoR - 20;
  ctx.fillStyle = CREAM;
  ctx.beginPath();
  ctx.moveTo(0, creamTop + 40);
  for (let px = 0; px <= W; px += 50) {
    ctx.quadraticCurveTo(
      px + 25,
      creamTop + (Math.floor(px / 50) % 2 === 0 ? 6 : 52),
      px + 50,
      creamTop + 40
    );
  }
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();

  // BUILDER badge
  const bw = 190;
  ctx.fillStyle = PINK;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') ctx.roundRect(W / 2 - bw / 2, photoY + photoR + 8, bw, 48, 8);
  else ctx.rect(W / 2 - bw / 2, photoY + photoR + 8, bw, 48);
  ctx.fill();
  ctx.fillStyle = WHITE;
  ctx.font = '800 24px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('BUILDER', W / 2, photoY + photoR + 40);

  const infoY = photoY + photoR + 90;
  ctx.fillStyle = GREEN;
  ctx.beginPath();
  ctx.arc(105, infoY + 42, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = WHITE;
  ctx.font = '800 22px "JetBrains Mono", monospace';
  ctx.fillText('</>', 105, infoY + 50);

  ctx.textAlign = 'left';
  ctx.fillStyle = GREEN;
  ctx.font = '900 54px "Fraunces", "Arial Black", sans-serif';
  const name = (opts.cardData.fullName || 'YOUR NAME').toUpperCase();
  ctx.fillText(name.length > 18 ? name.slice(0, 18) + '…' : name, 165, infoY + 32);

  ctx.font = '700 24px "Inter", sans-serif';
  ctx.globalAlpha = 0.85;
  ctx.fillText((opts.cardData.role || 'Builder').toUpperCase(), 165, infoY + 72);
  ctx.globalAlpha = 1;

  ctx.fillStyle = PINK;
  ctx.font = '800 26px "JetBrains Mono", monospace';
  ctx.fillText((opts.cardData.builderTitle || 'THE GOA SHIPPER').toUpperCase(), 165, infoY + 112);

  const dashY = infoY + 145;
  ctx.strokeStyle = 'rgba(0,77,51,0.3)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(64, dashY);
  ctx.lineTo(W - 64, dashY);
  ctx.stroke();
  ctx.setLineDash([]);

  const qrSize = 150;
  const qrX = 80;
  const qrY = dashY + 28;
  ctx.fillStyle = WHITE;
  ctx.fillRect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 12);
  ctx.strokeStyle = GREEN;
  ctx.lineWidth = 3;
  ctx.strokeRect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 12);

  QRCode.toDataURL(encodeVerificationUrl(opts.cardData), {
    width: qrSize, margin: 1, color: { dark: GREEN, light: '#FFFFFF' },
  }).then((url: string) => {
    const img = new Image();
    img.onload = () => canvas.getContext('2d')?.drawImage(img, qrX, qrY, qrSize, qrSize);
    img.src = url;
  });

  ctx.fillStyle = GREEN;
  ctx.font = '800 20px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('SCAN TO JOIN', qrX + qrSize + 24, qrY + 55);
  ctx.fillText('THE FRAME', qrX + qrSize + 24, qrY + 84);

  const team = (opts.cardData.handle || '@builder').replace(/^@/, '').toUpperCase();
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(0,77,51,0.6)';
  ctx.font = '700 20px "JetBrains Mono", monospace';
  ctx.fillText('TEAM NAME', W - 80, qrY + 55);
  ctx.fillStyle = GREEN;
  ctx.font = '900 36px "Fraunces", sans-serif';
  ctx.fillText(team.length > 14 ? team.slice(0, 14) : team, W - 80, qrY + 100);

  drawPinkScooter(ctx, 70, H - 230, PINK, CREAM, YELLOW);

  const sx = W - 130, sy = H - 190;
  ctx.beginPath();
  ctx.arc(sx, sy, 56, 0, Math.PI * 2);
  ctx.fillStyle = YELLOW;
  ctx.fill();
  ctx.fillStyle = PINK;
  ctx.beginPath();
  ctx.arc(sx, sy - 6, 28, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = GREEN;
  ctx.beginPath();
  ctx.moveTo(sx - 20, sy + 10);
  ctx.quadraticCurveTo(sx, sy - 6, sx + 24, sy + 14);
  ctx.quadraticCurveTo(sx, sy + 26, sx - 20, sy + 10);
  ctx.fill();

  ctx.fillStyle = GREEN;
  ctx.fillRect(0, H - 95, W, 95);
  ctx.fillStyle = PINK;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') ctx.roundRect(40, H - 72, 52, 52, 10);
  else ctx.rect(40, H - 72, 52, 52);
  ctx.fill();
  ctx.fillStyle = WHITE;
  ctx.font = '900 22px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('HH', 66, H - 38);

  ctx.textAlign = 'left';
  ctx.fillStyle = WHITE;
  ctx.font = '700 22px "JetBrains Mono", monospace';
  ctx.fillText('BUILDING  •  LEARNING  •  CONNECTING', 110, H - 40);
  ctx.textAlign = 'right';
  ctx.fillStyle = YELLOW;
  ctx.font = '800 24px "JetBrains Mono", monospace';
  ctx.fillText('#FrameInGoa', W - 40, H - 40);

  ctx.restore();
  ctx.restore();
}
