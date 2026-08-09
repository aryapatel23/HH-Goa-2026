import type { Mode, FrameTemplateId, IDCardStyleId, PhotoAdjustments, IDCardData, CornerStyle, StickerId, Theme, ThemeColors } from '../types';
import { THEMES } from '../types';
import { STICKER_LIST } from '../components/StickerSelector';
import QRCode from 'qrcode';
import { encodeVerificationUrl } from './verifier';

// Resolved at render time from the active theme
function getTheme(theme?: Theme): ThemeColors {
  return THEMES[theme ?? 'neon-shore'];
}

export interface RenderOptions {
  mode: Mode;
  image: HTMLImageElement | null;
  adjustments: PhotoAdjustments;
  frameTemplate: FrameTemplateId;
  cardStyle: IDCardStyleId;
  cardData: IDCardData;
  cornerStyle: CornerStyle;
  selectedStickers?: StickerId[];
  theme?: Theme;
}

export function drawCanvas(canvas: HTMLCanvasElement, options: RenderOptions) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (options.mode === 'pfp') {
    renderPfpFrame(canvas, ctx, options);
  } else if (options.mode === 'story') {
    renderStoryCard(canvas, ctx, options);
  } else {
    renderIdCard(canvas, ctx, options);
  }

  if (options.selectedStickers && options.selectedStickers.length > 0) {
    drawStickers(canvas, ctx, options);
  }

  if (options.adjustments.scanlinesEnabled) {
    drawScanlinesOverlay(canvas, ctx);
  }
}

// ----------------------------------------------------
// PFP FRAME RENDERER (2000 x 2000 HD Resolution)
// ----------------------------------------------------
function renderPfpFrame(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  opts: RenderOptions
) {
  const T = getTheme(opts.theme);
  const size = 2000;
  canvas.width = size;
  canvas.height = size;
  ctx.clearRect(0, 0, size, size);

  ctx.fillStyle = T.bg;
  ctx.fillRect(0, 0, size, size);

  if (opts.image) {
    ctx.save();
    if (opts.cornerStyle === 'rounded') {
      const radius = 240;
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(size - radius, 0);
      ctx.quadraticCurveTo(size, 0, size, radius);
      ctx.lineTo(size, size - radius);
      ctx.quadraticCurveTo(size, size, size - radius, size);
      ctx.lineTo(radius, size);
      ctx.quadraticCurveTo(0, size, 0, size - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.clip();
    }
    applyFilters(ctx, opts.adjustments);
    const cx = size / 2 + opts.adjustments.panX * 2;
    const cy = size / 2 + opts.adjustments.panY * 2;
    ctx.translate(cx, cy);
    ctx.rotate((opts.adjustments.rotation * Math.PI) / 180);
    ctx.scale(opts.adjustments.zoom, opts.adjustments.zoom);
    const imgWidth = opts.image.naturalWidth || opts.image.width;
    const imgHeight = opts.image.naturalHeight || opts.image.height;
    const aspect = imgWidth / imgHeight;
    let drawW = size, drawH = size;
    if (aspect > 1) { drawW = size * aspect; } else { drawH = size / aspect; }
    ctx.drawImage(opts.image, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  } else {
    drawPlaceholderBackground(ctx, size, size, 0, 0, T);
  }

  drawFrameOverlay(ctx, size, opts.frameTemplate, opts.cornerStyle, opts.adjustments.customColor, T);
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

function drawCornerBrackets(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  color: string, size = 36
) {
  ctx.strokeStyle = color; ctx.lineWidth = 4;
  const corners: [number, number, number, number][] = [
    [x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]
  ];
  corners.forEach(([cx, cy, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(cx + dx * size, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + dy * size);
    ctx.stroke();
  });
}

function drawFrameOverlay(
  ctx: CanvasRenderingContext2D,
  size: number,
  template: FrameTemplateId,
  cornerStyle: CornerStyle,
  customColor?: string,
  T?: ThemeColors
) {
  const theme = T ?? THEMES['neon-shore'];
  ctx.save();
  ctx.filter = 'none';
  const isSquare = cornerStyle === 'square';

  if (template === 'studio-emerald' || template === 'neon-sunset') {
    drawNeonShoreFrame(ctx, size, isSquare, customColor, template, theme);
    ctx.restore();
    return;
  }

  let primary = customColor || theme.primary;
  let secondary = theme.coral;

  if (template === 'hacker-cyber') {
    primary = customColor || '#00f0ff';
    secondary = '#00ff66';
  } else if (template === 'coastal-wave') {
    primary = customColor || theme.teal;
    secondary = '#0284c7';
  } else if (template === 'retro-synth') {
    primary = customColor || '#ff9100';
    secondary = '#ff2a85';
  } else if (template === 'gold-builder') {
    primary = customColor || '#ffd700';
    secondary = '#f59e0b';
  } else if (template === 'minimal-tech') {
    primary = customColor || '#ffffff';
    secondary = '#94a3b8';
  }

  const borderWidth = 60;
  ctx.strokeStyle = primary;
  ctx.lineWidth = borderWidth;
  if (isSquare) {
    ctx.strokeRect(borderWidth / 2, borderWidth / 2, size - borderWidth, size - borderWidth);
  } else {
    ctx.beginPath();
    ctx.roundRect(borderWidth / 2, borderWidth / 2, size - borderWidth, size - borderWidth, 160);
    ctx.stroke();
  }

  ctx.strokeStyle = secondary;
  ctx.lineWidth = 10;
  ctx.strokeRect(12, 12, size - 24, size - 24);

  const bannerH = 260, bannerY = size - bannerH - 40;
  const bannerW = size - 120, bannerX = 60;

  ctx.fillStyle = `${theme.bgDeep}f5`;
  ctx.strokeStyle = primary;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(bannerX, bannerY, bannerW, bannerH, isSquare ? 0 : 20);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = primary;
  ctx.font = '900 68px "Bodoni Moda", serif';
  ctx.textAlign = 'center';
  ctx.fillText('HACKER HOUSE GOA', size / 2, bannerY + 100);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 38px "JetBrains Mono", monospace';
  ctx.fillText('GOA, INDIA  •  28 - 31 OCT 2026', size / 2, bannerY + 180);

  ctx.restore();
}

function drawNeonShoreFrame(
  ctx: CanvasRenderingContext2D,
  size: number,
  _isSquare: boolean,
  customColor?: string,
  template?: FrameTemplateId,
  T?: ThemeColors
) {
  const theme = T ?? THEMES['neon-shore'];
  const gold = customColor || theme.primary;
  const coral = template === 'neon-sunset' ? (customColor || theme.teal) : theme.coral;

  const borderWidth = 50;
  ctx.strokeStyle = gold;
  ctx.lineWidth = borderWidth;
  ctx.strokeRect(borderWidth / 2, borderWidth / 2, size - borderWidth, size - borderWidth);

  // Second inner accent border
  ctx.strokeStyle = coral;
  ctx.lineWidth = 14;
  ctx.strokeRect(borderWidth + 10, borderWidth + 10, size - borderWidth * 2 - 20, size - borderWidth * 2 - 20);

  const brandX = 80;
  const brandY = 90;
  ctx.fillStyle = gold;
  ctx.font = '900 48px "VT323", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('2:47PM', brandX, brandY);
  ctx.fillText('STUDIO', brandX, brandY + 45);

  // Coral "APPLY" badge top right
  const btnW = 260, btnH = 80;
  const btnX = size - 80 - btnW, btnY = 70;
  drawRibbonPattern(ctx, btnX, btnY - 8, btnW, 8);
  drawRibbonPattern(ctx, btnX, btnY + btnH, btnW, 8);
  ctx.fillStyle = coral;
  ctx.fillRect(btnX, btnY, btnW, btnH);
  ctx.fillStyle = theme.bg;
  ctx.font = '900 42px "Bodoni Moda", serif';
  ctx.textAlign = 'center';
  ctx.fillText('APPLY', btnX + btnW / 2, btnY + 54);

  drawSunburstRays(ctx, size / 2, size - 60, size * 0.4, gold, 0.14);

  // Bottom banner
  const bannerY = size - 360, bannerH = 280;
  ctx.fillStyle = `${theme.bgDeep}f5`;
  ctx.fillRect(60, bannerY, size - 120, bannerH);
  ctx.strokeStyle = gold;
  ctx.lineWidth = 6;
  ctx.strokeRect(60, bannerY, size - 120, bannerH);

  // Left + right accent bars on banner
  ctx.fillStyle = coral;
  ctx.fillRect(60, bannerY, 10, bannerH);
  ctx.fillRect(size - 70, bannerY, 10, bannerH);

  ctx.fillStyle = gold;
  ctx.font = '900 110px "Bodoni Moda", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('HACKER         HOUSE', size / 2, bannerY + 110);

  ctx.save();
  const badgeW = 240, badgeH = 115;
  const badgeX = size / 2 - badgeW / 2, badgeY = bannerY + 110 - badgeH / 2;
  ctx.fillStyle = coral;
  ctx.strokeStyle = gold;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = gold;
  ctx.strokeStyle = theme.bg;
  ctx.lineWidth = 6;
  ctx.font = '900 78px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeText('गोवा', size / 2, bannerY + 110);
  ctx.fillText('गोवा', size / 2, bannerY + 110);
  ctx.restore();

  ctx.fillStyle = gold;
  ctx.font = 'bold 36px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('GOA, INDIA  •  28 - 31 OCT 2026', 100, bannerY + 230);
  ctx.textAlign = 'right';
  ctx.fillText('2:47 PM STUDIO', size - 100, bannerY + 230);
}

function drawSunburstRays(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, radius: number,
  color: string, alpha = 0.15
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.globalAlpha = alpha;
  const numRays = 18;
  for (let i = 0; i < numRays; i++) {
    const angle = (Math.PI / (numRays - 1)) * i - Math.PI;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
    ctx.stroke();
  }
  ctx.restore();
}

function drawRibbonPattern(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  T?: ThemeColors
) {
  const theme = T ?? THEMES['neon-shore'];
  ctx.save();
  ctx.fillStyle = theme.coral;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = theme.primary;
  const stripeW = 12;
  for (let i = 0; i < w; i += stripeW * 2) {
    ctx.fillRect(x + i, y, stripeW, h);
  }
  ctx.restore();
}

// ----------------------------------------------------
// BUILDER ID CARD RENDERER — routes to style sub-renderers
// ----------------------------------------------------
function renderIdCard(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  opts: RenderOptions
) {
  switch (opts.cardStyle) {
    case 'editorial-light':  renderEditorialCard(canvas, ctx, opts); break;
    case 'terminal-hacker':  renderTerminalCard(canvas, ctx, opts);  break;
    case 'magazine-cover':   renderMagazineCover(canvas, ctx, opts); break;
    default:                 renderClassicCard(canvas, ctx, opts);   break;
  }
}

// ── Style 1: CLASSIC DARK (original navy + gold + coral) ────────────────
function renderClassicCard(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  opts: RenderOptions
) {
  const T = getTheme(opts.theme);
  const W = 1200, H = 1800;
  canvas.width = W;
  canvas.height = H;
  ctx.clearRect(0, 0, W, H);
  ctx.save();

  const gold = opts.adjustments.customColor || T.primary;
  const coral = T.coral;

  // Outer background
  ctx.fillStyle = T.bgDeep;
  ctx.fillRect(0, 0, W, H);

  const margin = 40;
  const cW = W - margin * 2, cH = H - margin * 2;
  const isSquare = opts.cornerStyle === 'square';
  const cardRadius = isSquare ? 0 : 28;

  ctx.beginPath();
  ctx.roundRect(margin, margin, cW, cH, cardRadius);
  ctx.clip();

  // Card gradient background
  const bgGrad = ctx.createLinearGradient(margin, margin, W - margin, H - margin);
  bgGrad.addColorStop(0, T.bgCard.replace('rgba', 'rgb').replace(/,[^,]+\)/, ')') || T.bg);
  bgGrad.addColorStop(0.5, T.bg);
  bgGrad.addColorStop(1, T.bgDeep);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(margin, margin, cW, cH);

  // Subtle diagonal mesh
  ctx.save();
  ctx.globalAlpha = 0.04;
  ctx.strokeStyle = coral;
  ctx.lineWidth = 1;
  for (let i = -H; i < W + H; i += 60) {
    ctx.beginPath();
    ctx.moveTo(margin + i, margin);
    ctx.lineTo(margin + i + H, margin + H);
    ctx.stroke();
  }
  ctx.restore();

  drawSunburstRays(ctx, W / 2, H - margin - 80, 700, gold, 0.1);

  // Card border
  ctx.strokeStyle = gold;
  ctx.lineWidth = 10;
  ctx.strokeRect(margin, margin, cW, cH);

  // Top ribbon
  drawRibbonPattern(ctx, margin, margin, cW, 14, T);

  // Header
  const headerY = margin + 50;
  ctx.fillStyle = gold;
  ctx.font = '900 36px "VT323", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('2:47PM STUDIO', margin + 60, headerY + 30);

  ctx.fillStyle = gold;
  ctx.font = '900 44px "Bodoni Moda", serif';
  ctx.fillText('HACKER HOUSE GOA', margin + 60, headerY + 80);

  // गोवा badge
  ctx.fillStyle = coral;
  ctx.strokeStyle = gold;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(margin + 490, headerY + 42, 90, 46, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = gold;
  ctx.font = '900 30px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('गोवा', margin + 535, headerY + 74);

  // Status badge
  const statusText = opts.cardData.statusBadge || 'SHORTLISTED';
  ctx.font = 'bold 22px "JetBrains Mono", monospace';
  const statusWidth = ctx.measureText(statusText).width + 50;
  const statusX = W - margin - 60 - statusWidth;
  ctx.fillStyle = 'rgba(5, 13, 31, 0.95)';
  ctx.strokeStyle = gold;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(statusX, headerY + 35, statusWidth, 55, isSquare ? 0 : 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = gold;
  ctx.textAlign = 'center';
  ctx.fillText(statusText, statusX + statusWidth / 2, headerY + 70);

  // Divider
  ctx.strokeStyle = gold;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(margin + 60, headerY + 115);
  ctx.lineTo(W - margin - 60, headerY + 115);
  ctx.stroke();

  // Photo
  const photoSize = 480;
  const photoX = (W - photoSize) / 2;
  const photoY = headerY + 145;

  ctx.fillStyle = '#020810';
  ctx.fillRect(photoX - 12, photoY - 12, photoSize + 24, photoSize + 24);  ctx.strokeStyle = gold;
  ctx.lineWidth = 6;
  ctx.strokeRect(photoX - 12, photoY - 12, photoSize + 24, photoSize + 24);

  ctx.save();
  ctx.beginPath();
  ctx.rect(photoX, photoY, photoSize, photoSize);
  ctx.clip();
  if (opts.image) {
    applyFilters(ctx, opts.adjustments);
    const cx = photoX + photoSize / 2 + opts.adjustments.panX * 0.7;
    const cy = photoY + photoSize / 2 + opts.adjustments.panY * 0.7;
    ctx.translate(cx, cy);
    ctx.rotate((opts.adjustments.rotation * Math.PI) / 180);
    ctx.scale(opts.adjustments.zoom, opts.adjustments.zoom);
    const imgW = opts.image.naturalWidth || opts.image.width;
    const imgH = opts.image.naturalHeight || opts.image.height;
    const aspect = imgW / imgH;
    let dW = photoSize, dH = photoSize;
    if (aspect > 1) { dW = photoSize * aspect; } else { dH = photoSize / aspect; }
    ctx.drawImage(opts.image, -dW / 2, -dH / 2, dW, dH);
  } else {
    drawPlaceholderBackground(ctx, photoSize, photoSize, photoX, photoY, T);
  }
  ctx.restore();
  drawCornerBrackets(ctx, photoX - 18, photoY - 18, photoSize + 36, photoSize + 36, coral);

  // Name / handle block
  const infoY = photoY + photoSize + 55;
  const nameCardW = W - margin * 2 - 120;
  const nameCardX = (W - nameCardW) / 2;

  ctx.fillStyle = 'rgba(3, 8, 20, 0.92)';
  ctx.strokeStyle = 'rgba(255, 77, 0, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(nameCardX, infoY - 45, nameCardW, 115, isSquare ? 0 : 12);
  ctx.fill();
  ctx.stroke();

  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 10;
  ctx.fillStyle = gold;
  ctx.font = '900 58px "Bodoni Moda", serif';
  ctx.textAlign = 'center';
  ctx.fillText(opts.cardData.fullName || 'YOUR NAME HERE', W / 2, infoY + 5);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px "JetBrains Mono", monospace';
  ctx.fillText(
    opts.cardData.handle ? (opts.cardData.handle.startsWith('@') ? opts.cardData.handle : `@${opts.cardData.handle}`) : '@builder_goa',
    W / 2, infoY + 50
  );
  ctx.shadowBlur = 0;

  // Builder title pill
  const titleBoxY = infoY + 95;
  const titleBoxH = 65;
  ctx.fillStyle = coral;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(nameCardX, titleBoxY, nameCardW, titleBoxH, isSquare ? 0 : 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = T.bg;
  ctx.font = '900 28px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`⚡ ${opts.cardData.builderTitle || 'SOLANA SHIFT DRIFTER'}`, W / 2, titleBoxY + titleBoxH / 2 + 8);

  // Role + Stack boxes
  const metaY = titleBoxY + titleBoxH + 40;
  const roleBoxW = (nameCardW - 20) / 2;

  ctx.fillStyle = 'rgba(3, 8, 20, 0.92)';
  ctx.strokeStyle = 'rgba(255, 77, 0, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(nameCardX, metaY, roleBoxW, 90, isSquare ? 0 : 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = gold;
  ctx.font = 'bold 20px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('ROLE / SPECIALTY', nameCardX + 25, metaY + 30);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px "Outfit", sans-serif';
  ctx.fillText(opts.cardData.role || 'Full-Stack Hacker', nameCardX + 25, metaY + 65);

  ctx.fillStyle = 'rgba(3, 8, 20, 0.92)';
  ctx.beginPath();
  ctx.roundRect(nameCardX + roleBoxW + 20, metaY, roleBoxW, 90, isSquare ? 0 : 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = gold;
  ctx.font = 'bold 20px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('PRIMARY STACK', nameCardX + roleBoxW + 45, metaY + 30);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px "Outfit", sans-serif';
  ctx.fillText(opts.cardData.stack || 'Rust • TS • Solana', nameCardX + roleBoxW + 45, metaY + 65);

  // Footer area
  const footerY = H - margin - 145;
  ctx.strokeStyle = gold;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(margin + 60, footerY);
  ctx.lineTo(W - margin - 60, footerY);
  ctx.stroke();

  // Barcode
  const barcodeX = margin + 80, barcodeY = footerY + 20, barcodeH = 45;
  ctx.fillStyle = gold;
  const bars = [4, 8, 3, 12, 5, 8, 4, 16, 6, 4, 10, 5, 14, 4, 8, 3, 12, 6, 8, 4];
  let curX = barcodeX;
  bars.forEach((w) => { ctx.fillRect(curX, barcodeY, w, barcodeH); curX += w + 6; });
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(opts.cardData.hackerId || 'HH-GOA-2026-XXXX', barcodeX, barcodeY + barcodeH + 26);

  ctx.fillStyle = gold;
  ctx.font = 'bold 26px "Space Grotesk", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('GOA, INDIA 🌴', W - margin - 80, barcodeY + 25);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px "JetBrains Mono", monospace';
  ctx.fillText('28 - 31 OCT 2026', W - margin - 80, barcodeY + 58);

  // QR code (async — drawn after card renders)
  const verifyUrl = encodeVerificationUrl(opts.cardData);
  QRCode.toDataURL(verifyUrl, {
    width: 160, margin: 1,
    color: { dark: T.bg, light: T.primary }
  }).then((qrDataUrl: string) => {
    const qrImg = new Image();
    qrImg.onload = () => {
      const qrCtx = canvas.getContext('2d');
      if (!qrCtx) return;
      const qrSize = 130;
      const qrX = W - margin - 80 - qrSize;
      const qrY = barcodeY + barcodeH + 8;
      qrCtx.fillStyle = gold;
      qrCtx.fillRect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 12);
      qrCtx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
    };
    qrImg.src = qrDataUrl;
  });

  // Bottom ribbon
  drawRibbonPattern(ctx, margin, H - margin - 14, cW, 14, T);

  ctx.restore();
}

// ── Style 2: EDITORIAL LIGHT ─────────────────────────────────────────────
// Cream/beige, dark-green thick border, bold serif headline, stack pills
function renderEditorialCard(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  opts: RenderOptions
) {
  const W = 1200, H = 1800;
  canvas.width = W; canvas.height = H;
  ctx.clearRect(0, 0, W, H);

  const cream = '#f0ebe0';
  const forest = '#1a4a2e';
  const yellow = opts.adjustments.customColor || '#ffe500';
  const pink = '#ff007f';
  const isSquare = opts.cornerStyle === 'square';
  const r = isSquare ? 0 : 44;

  // Background
  ctx.fillStyle = cream;
  ctx.fillRect(0, 0, W, H);

  // Clip to card shape + thick border
  ctx.save();
  ctx.beginPath(); ctx.roundRect(0, 0, W, H, r); ctx.clip();
  ctx.fillStyle = cream; ctx.fillRect(0, 0, W, H);

  // Outer border
  ctx.strokeStyle = forest; ctx.lineWidth = 22;
  ctx.beginPath(); ctx.roundRect(11, 11, W - 22, H - 22, r); ctx.stroke();

  // ── Lanyard clip ──
  ctx.fillStyle = '#c4bfb2';
  ctx.strokeStyle = forest; ctx.lineWidth = 3;
  ctx.fillRect(W / 2 - 22, 0, 44, 36);
  ctx.strokeRect(W / 2 - 22, 0, 44, 36);
  ctx.fillStyle = cream;
  ctx.beginPath(); ctx.arc(W / 2, 36, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  // ── गोवा circular badge ──
  const bcy = 165, bcr = 78;
  ctx.fillStyle = yellow; ctx.strokeStyle = forest; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.arc(W / 2, bcy, bcr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = forest;
  ctx.font = '900 50px "Outfit", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('गोवा', W / 2, bcy);

  // ── "certified" ──
  ctx.fillStyle = '#888'; ctx.textBaseline = 'alphabetic';
  ctx.font = 'italic 28px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('certified', W / 2, bcy + bcr + 46);

  // ── BIG BOLD ROLE HEADLINE ──
  const role = (opts.cardData.role || 'full-stack builder').toLowerCase();
  const words = role.split(' ');
  ctx.fillStyle = forest;
  ctx.font = '900 94px "Bodoni Moda", serif';
  ctx.textAlign = 'center';
  if (words.length <= 2) {
    ctx.fillText(role + '.', W / 2, bcy + bcr + 165);
  } else {
    const mid = Math.ceil(words.length / 2);
    ctx.fillText(words.slice(0, mid).join(' ') + '.', W / 2, bcy + bcr + 150);
    ctx.fillText(words.slice(mid).join(' '), W / 2, bcy + bcr + 260);
  }

  // ── Name highlighted block ──
  const nameY = 550;
  const nameText = opts.cardData.fullName || 'Your Name';
  ctx.font = '900 56px "Space Grotesk", sans-serif';
  const nameMetrics = ctx.measureText(nameText);
  const nameBoxX = W / 2 - nameMetrics.width / 2 - 20;
  ctx.fillStyle = yellow;
  ctx.fillRect(nameBoxX, nameY - 50, nameMetrics.width + 40, 66);
  ctx.fillStyle = forest;
  ctx.fillText(nameText, W / 2, nameY);

  // Subtitle
  ctx.fillStyle = '#6a7060'; ctx.font = '500 26px "Outfit", sans-serif';
  ctx.fillText('Builder @ HH Goa 2026', W / 2, nameY + 50);

  // Divider
  ctx.strokeStyle = '#c4bfb2'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(80, nameY + 80); ctx.lineTo(W - 80, nameY + 80); ctx.stroke();

  // ── LEFT SIDEBAR: tech stack icons ──
  const stackRaw = opts.cardData.stack || 'Rust • TS • Solana';
  const stackItems = stackRaw.split(/[•,\/]/).map(s => s.trim()).filter(Boolean).slice(0, 7);
  const sX = 38, sStartY = nameY + 105;
  const iconSz = 76, iconGap = 16;
  const iconBgs = [yellow, forest, '#ff4d00', '#00d4c8', '#7c3aed', '#ff007f', '#ccbfa8'];
  const iconFgs = [forest, '#fff', '#fff', '#fff', '#fff', '#fff', forest];

  stackItems.forEach((tech, i) => {
    const iy = sStartY + i * (iconSz + iconGap);
    ctx.fillStyle = iconBgs[i % iconBgs.length];
    ctx.strokeStyle = forest; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(sX, iy, iconSz, iconSz, isSquare ? 0 : 14); ctx.fill(); ctx.stroke();
    ctx.fillStyle = iconFgs[i % iconFgs.length];
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `900 ${tech.length > 3 ? 20 : 26}px "JetBrains Mono", monospace`;
    ctx.fillText(tech.slice(0, 4), sX + iconSz / 2, iy + iconSz / 2);
  });

  // Sidebar divider
  ctx.strokeStyle = '#c4bfb2'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(130, nameY + 100); ctx.lineTo(130, nameY + 100 + 7 * (iconSz + iconGap)); ctx.stroke();

  // ── PHOTO ──
  const pX = 148, pY = nameY + 105, pW = W - pX - 50, pH = 700;
  ctx.strokeStyle = forest; ctx.lineWidth = 5;
  ctx.strokeRect(pX, pY, pW, pH);

  if (opts.image) {
    ctx.save();
    ctx.beginPath(); ctx.rect(pX, pY, pW, pH); ctx.clip();
    applyFilters(ctx, opts.adjustments);
    const cx = pX + pW / 2 + opts.adjustments.panX * 0.5;
    const cy = pY + pH / 2 + opts.adjustments.panY * 0.5;
    ctx.translate(cx, cy);
    ctx.rotate((opts.adjustments.rotation * Math.PI) / 180);
    ctx.scale(opts.adjustments.zoom, opts.adjustments.zoom);
    const imgW = opts.image.naturalWidth || opts.image.width;
    const imgH = opts.image.naturalHeight || opts.image.height;
    const asp = imgW / imgH;
    let dW = pW, dH = pH;
    if (asp > pW / pH) { dH = pH; dW = pH * asp; } else { dW = pW; dH = pW / asp; }
    ctx.drawImage(opts.image, -dW / 2, -dH / 2, dW, dH);
    ctx.restore();
  } else {
    ctx.fillStyle = '#e0dbd0'; ctx.fillRect(pX, pY, pW, pH);
    ctx.fillStyle = forest; ctx.font = '700 32px "Outfit", sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('📸 Upload your photo', pX + pW / 2, pY + pH / 2);
  }

  // Pink star ✦ accent
  ctx.fillStyle = pink; ctx.font = '900 70px serif';
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  ctx.fillText('✦', W - 24, pY + pH / 2);

  // ── BOTTOM SECTION ──
  const botY = pY + pH + 50;

  // Quote text (right-aligned)
  const quoteLines = ['Ideas shipped,', 'sleep skipped,', 'Goa lived.'];
  ctx.fillStyle = forest; ctx.font = '700 30px "Outfit", sans-serif';
  ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
  quoteLines.forEach((line, i) => ctx.fillText(line, W - 70, botY + 44 + i * 42));

  // Hashtag center
  ctx.fillStyle = '#9a9a8a'; ctx.font = '700 24px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('#FrameInGoa', W / 2, botY + 160);

  // Status badge
  const statusText = opts.cardData.statusBadge || 'SHORTLISTED';
  ctx.font = 'bold 22px "JetBrains Mono", monospace';
  const sw = ctx.measureText(statusText).width + 40;
  ctx.fillStyle = yellow; ctx.strokeStyle = forest; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect(W / 2 - sw / 2, botY + 175, sw, 48, isSquare ? 0 : 8); ctx.fill(); ctx.stroke();
  ctx.fillStyle = forest; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(statusText, W / 2, botY + 199);

  // QR code
  const verifyUrl = encodeVerificationUrl(opts.cardData);
  QRCode.toDataURL(verifyUrl, { width: 140, margin: 1, color: { dark: forest, light: cream } })
    .then((qr: string) => {
      const qrImg = new Image();
      qrImg.onload = () => {
        const qc = canvas.getContext('2d'); if (!qc) return;
        qc.drawImage(qrImg, 60, botY, 130, 130);
        qc.fillStyle = '#888'; qc.font = '400 18px "Outfit", sans-serif';
        qc.textAlign = 'left'; qc.textBaseline = 'alphabetic';
        qc.fillText('scan to view online', 60, botY + 148);
      };
      qrImg.src = qr;
    });

  ctx.restore();
}

// ── Style 3: TERMINAL HACKER ─────────────────────────────────────────────
// Pure black, neon green monospace, ASCII borders, photo with green tint
function renderTerminalCard(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  opts: RenderOptions
) {
  const W = 1200, H = 1800;
  canvas.width = W; canvas.height = H;
  ctx.clearRect(0, 0, W, H);

  const black = '#000000';
  const green = opts.adjustments.customColor || '#00ff88';
  const greenDim = '#005533';
  const greenMid = '#00aa55';
  const isSquare = opts.cornerStyle === 'square';

  // Black background
  ctx.fillStyle = black; ctx.fillRect(0, 0, W, H);

  // Grid scanline texture
  ctx.save(); ctx.globalAlpha = 0.04; ctx.strokeStyle = green; ctx.lineWidth = 1;
  for (let y = 0; y < H; y += 14) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.restore();

  // Outer double-line border
  ctx.strokeStyle = green; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.roundRect(14, 14, W - 28, H - 28, isSquare ? 0 : 12); ctx.stroke();
  ctx.strokeStyle = greenDim; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(24, 24, W - 48, H - 48, isSquare ? 0 : 8); ctx.stroke();

  // Corner brackets
  drawCornerBrackets(ctx, 14, 14, W - 28, H - 28, green);

  // ── Title bar ──
  ctx.fillStyle = green;
  ctx.fillRect(14, 14, W - 28, 70);
  ctx.fillStyle = black;
  ctx.font = '900 32px "JetBrains Mono", monospace';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('[ HH-GOA-2026 // BUILDER CREDENTIAL ]', 40, 49);

  // Window dots
  ['#ff5f57', '#ffbd2e', '#28c840'].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.arc(W - 60 - i * 38, 49, 12, 0, Math.PI * 2); ctx.fill();
  });

  // ── Photo with green tint ──
  const pX = 40, pY = 100, pW = 520, pH = 560;
  ctx.strokeStyle = green; ctx.lineWidth = 4;
  ctx.strokeRect(pX, pY, pW, pH);

  if (opts.image) {
    ctx.save();
    ctx.beginPath(); ctx.rect(pX, pY, pW, pH); ctx.clip();
    // Greyscale + green tint
    ctx.filter = `grayscale(80%) brightness(${opts.adjustments.brightness}%) contrast(${opts.adjustments.contrast}%)`;
    const cx = pX + pW / 2 + opts.adjustments.panX * 0.3;
    const cy = pY + pH / 2 + opts.adjustments.panY * 0.3;
    ctx.translate(cx, cy); ctx.rotate((opts.adjustments.rotation * Math.PI) / 180);
    ctx.scale(opts.adjustments.zoom, opts.adjustments.zoom);
    const imgW = opts.image.naturalWidth || opts.image.width;
    const imgH = opts.image.naturalHeight || opts.image.height;
    const asp = imgW / imgH;
    let dW = pW, dH = pH;
    if (asp > pW / pH) { dH = pH; dW = pH * asp; } else { dW = pW; dH = pW / asp; }
    ctx.drawImage(opts.image, -dW / 2, -dH / 2, dW, dH);
    // Green overlay tint
    ctx.filter = 'none'; ctx.globalAlpha = 0.15; ctx.fillStyle = green; ctx.fillRect(-dW / 2, -dH / 2, dW, dH);
    ctx.restore();
  }

  // Photo corner annotations
  ctx.fillStyle = green; ctx.font = '700 18px "JetBrains Mono", monospace';
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText('PHOTO.VERIFIED', pX + 8, pY + 8);
  ctx.textBaseline = 'bottom';
  ctx.fillText(`(${pW}x${pH}px)`, pX + 8, pY + pH - 8);

  // ── Terminal data block ──
  const dX = pX + pW + 40, dY = pY, dW2 = W - dX - 40;
  const lines: [string, string][] = [
    ['BUILDER_ID', opts.cardData.hackerId || 'HH-GOA-2026-XXXX'],
    ['NAME', opts.cardData.fullName || 'Anonymous'],
    ['HANDLE', opts.cardData.handle || '@builder'],
    ['ROLE', opts.cardData.role || 'Full-Stack Dev'],
    ['STACK', opts.cardData.stack || 'Rust • TS • Solana'],
    ['STATUS', opts.cardData.statusBadge || 'SHORTLISTED'],
    ['TITLE', opts.cardData.builderTitle || 'GOA HACKER ⚡'],
    ['EVENT', 'HH GOA 2026'],
    ['DATE', '28-31 OCT 2026'],
    ['LOCATION', 'GOA, INDIA 🌴'],
  ];

  ctx.textBaseline = 'alphabetic';
  lines.forEach(([key, val], i) => {
    const ly = dY + 40 + i * 54;
    // prompt
    ctx.fillStyle = greenMid; ctx.font = '700 20px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('>', dX, ly);
    // key
    ctx.fillStyle = greenDim; ctx.font = '700 20px "JetBrains Mono", monospace';
    ctx.fillText(`${key}:`, dX + 24, ly);
    // value (truncate if too wide)
    ctx.fillStyle = green; ctx.font = '700 22px "JetBrains Mono", monospace';
    const maxValW = dW2 - 20;
    let displayVal = val;
    while (ctx.measureText(displayVal).width > maxValW && displayVal.length > 4) {
      displayVal = displayVal.slice(0, -2) + '…';
    }
    ctx.fillText(displayVal, dX + 14, ly + 28);
    // separator
    ctx.strokeStyle = greenDim; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(dX, ly + 38); ctx.lineTo(dX + dW2, ly + 38); ctx.stroke();
  });

  // Blinking cursor
  ctx.fillStyle = green; ctx.font = '700 26px "JetBrains Mono", monospace';
  ctx.fillText('> _', dX, dY + 40 + lines.length * 54);

  // ── Bottom section ──
  const botY = pY + pH + 40;

  // Big name
  ctx.fillStyle = green; ctx.font = '900 72px "Bodoni Moda", serif';
  ctx.textAlign = 'left';
  ctx.fillText(opts.cardData.fullName || 'ANONYMOUS', pX, botY + 70);

  // Handle
  ctx.fillStyle = greenMid; ctx.font = '700 32px "JetBrains Mono", monospace';
  ctx.fillText(opts.cardData.handle || '@builder', pX, botY + 120);

  // Role tag
  ctx.fillStyle = greenDim; ctx.strokeStyle = green; ctx.lineWidth = 2;
  const roleTagW = 500, roleTagH = 52;
  ctx.beginPath(); ctx.roundRect(pX, botY + 140, roleTagW, roleTagH, isSquare ? 0 : 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = green; ctx.font = '900 26px "Space Grotesk", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`⚡ ${opts.cardData.builderTitle || 'SOLANA SHIFT DRIFTER'}`, pX + 14, botY + 174);

  // Barcode-style decoration
  let bX = pX;
  [3, 8, 4, 12, 5, 3, 9, 5, 14, 4, 7, 3, 11, 5, 8].forEach(bw => {
    ctx.fillStyle = green; ctx.fillRect(bX, botY + 215, bw, 40); bX += bw + 5;
  });

  // Hashtag bottom right
  ctx.fillStyle = greenMid; ctx.font = '700 28px "JetBrains Mono", monospace';
  ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
  ctx.fillText('#FrameInGoa', W - 50, botY + 250);

  // QR code
  const verifyUrl = encodeVerificationUrl(opts.cardData);
  QRCode.toDataURL(verifyUrl, { width: 140, margin: 1, color: { dark: green, light: '#000000' } })
    .then((qr: string) => {
      const qrImg = new Image();
      qrImg.onload = () => {
        const qc = canvas.getContext('2d'); if (!qc) return;
        const qrY = H - 250;
        qc.strokeStyle = green; qc.lineWidth = 3;
        qc.strokeRect(W - 210, qrY - 5, 150, 150);
        qc.drawImage(qrImg, W - 208, qrY - 3, 146, 146);
        qc.fillStyle = greenMid; qc.font = '400 16px "JetBrains Mono", monospace';
        qc.textAlign = 'right'; qc.textBaseline = 'alphabetic';
        qc.fillText('SCAN TO VERIFY', W - 50, qrY + 162);
      };
      qrImg.src = qr;
    });

  // Bottom status bar
  ctx.fillStyle = greenDim;
  ctx.fillRect(14, H - 74, W - 28, 60);
  ctx.strokeStyle = green; ctx.lineWidth = 2;
  ctx.strokeRect(14, H - 74, W - 28, 60);
  ctx.fillStyle = green; ctx.font = '700 22px "JetBrains Mono", monospace';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(`STATUS: ${opts.cardData.statusBadge || 'SHORTLISTED'} | GOA, INDIA | 28-31 OCT 2026`, 40, H - 44);
  ctx.textAlign = 'right';
  ctx.fillText('HH-GOA-2026', W - 40, H - 44);
}

// ── Style 4: MAGAZINE COVER ───────────────────────────────────────────────
// Full-bleed photo, bold text overlay, minimal poster aesthetic
function renderMagazineCover(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  opts: RenderOptions
) {
  const W = 1200, H = 1800;
  canvas.width = W; canvas.height = H;
  ctx.clearRect(0, 0, W, H);

  const T = getTheme(opts.theme);
  const accent = opts.adjustments.customColor || '#ff4d00';
  const gold = T.primary;
  const isSquare = opts.cornerStyle === 'square';

  // ── Full bleed photo ──
  if (opts.image) {
    ctx.save();
    applyFilters(ctx, opts.adjustments);
    const cx = W / 2 + opts.adjustments.panX * 1.5;
    const cy = H / 2 + opts.adjustments.panY * 1.5;
    ctx.translate(cx, cy);
    ctx.rotate((opts.adjustments.rotation * Math.PI) / 180);
    ctx.scale(opts.adjustments.zoom, opts.adjustments.zoom);
    const imgW = opts.image.naturalWidth || opts.image.width;
    const imgH = opts.image.naturalHeight || opts.image.height;
    const asp = imgW / imgH;
    let dW = W, dH = H;
    if (asp > W / H) { dH = H; dW = H * asp; } else { dW = W; dH = W / asp; }
    ctx.drawImage(opts.image, -dW / 2, -dH / 2, dW, dH);
    ctx.restore();
  } else {
    ctx.fillStyle = '#1a0a00'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#ff4d00'; ctx.font = '700 36px "Outfit", sans-serif';
    ctx.textAlign = 'center'; ctx.fillText('📸 Upload your photo', W / 2, H / 2);
  }

  // Top vignette gradient
  const topGrad = ctx.createLinearGradient(0, 0, 0, 600);
  topGrad.addColorStop(0, 'rgba(0,0,0,0.85)');
  topGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = topGrad; ctx.fillRect(0, 0, W, 600);

  // Bottom gradient
  const botGrad = ctx.createLinearGradient(0, H - 750, 0, H);
  botGrad.addColorStop(0, 'rgba(0,0,0,0)');
  botGrad.addColorStop(0.4, 'rgba(0,0,0,0.75)');
  botGrad.addColorStop(1, 'rgba(0,0,0,0.97)');
  ctx.fillStyle = botGrad; ctx.fillRect(0, H - 750, W, 750);

  // Left edge accent bar
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, 14, H);

  // ── TOP BRANDING ──
  // Event label top-left
  ctx.fillStyle = accent; ctx.strokeStyle = gold; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(34, 36, 280, 52, isSquare ? 0 : 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#000'; ctx.font = '900 26px "Space Grotesk", sans-serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('HACKER HOUSE GOA', 46, 62);

  // Issue/date top-right
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.strokeStyle = gold; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(W - 280, 36, 250, 52, isSquare ? 0 : 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = gold; ctx.font = '700 22px "JetBrains Mono", monospace';
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  ctx.fillText('28 – 31 OCT 2026', W - 42, 62);

  // गोवा sticker top-right
  ctx.fillStyle = gold; ctx.strokeStyle = accent; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(W - 80, 180, 64, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#000'; ctx.font = '900 42px "Outfit", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('गोवा', W - 80, 180);

  // ── BOTTOM TEXT SECTION ──
  const botStart = H - 660;

  // Builder title bar
  ctx.fillStyle = accent; ctx.strokeStyle = gold; ctx.lineWidth = 3;
  const titleBarH = 62;
  ctx.beginPath(); ctx.roundRect(34, botStart, W - 68, titleBarH, isSquare ? 0 : 8); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#000'; ctx.font = '900 30px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(`⚡ ${opts.cardData.builderTitle || 'SOLANA SHIFT DRIFTER'}`, W / 2, botStart + titleBarH / 2);

  // BIG NAME
  ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 20;
  ctx.fillStyle = '#ffffff'; ctx.font = '900 110px "Bodoni Moda", serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(opts.cardData.fullName || 'YOUR NAME', W / 2, botStart + titleBarH + 120);
  ctx.shadowBlur = 0;

  // Handle
  ctx.fillStyle = gold; ctx.font = 'bold 38px "JetBrains Mono", monospace';
  ctx.fillText(opts.cardData.handle ? (opts.cardData.handle.startsWith('@') ? opts.cardData.handle : `@${opts.cardData.handle}`) : '@builder', W / 2, botStart + titleBarH + 175);

  // Role + Stack two-column
  const colY = botStart + titleBarH + 220;
  const colW = (W - 100) / 2;
  [[opts.cardData.role || 'Full-Stack Dev', 'ROLE'], [opts.cardData.stack || 'Rust • TS • Solana', 'STACK']].forEach(([val, label], i) => {
    const cx2 = 50 + i * (colW + 20);
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.strokeStyle = gold; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(cx2, colY, colW, 90, isSquare ? 0 : 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = gold; ctx.font = 'bold 20px "JetBrains Mono", monospace';
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(label, cx2 + 18, colY + 28);
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 28px "Outfit", sans-serif';
    ctx.fillText(val, cx2 + 18, colY + 68);
  });

  // Status badge
  const stY = colY + 120;
  const stText = opts.cardData.statusBadge || 'SHORTLISTED';
  ctx.font = 'bold 24px "JetBrains Mono", monospace';
  const stW = ctx.measureText(stText).width + 50;
  ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.strokeStyle = gold; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect(W / 2 - stW / 2, stY, stW, 54, isSquare ? 0 : 8); ctx.fill(); ctx.stroke();
  ctx.fillStyle = gold; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(stText, W / 2, stY + 27);

  // Hashtag + bottom bar
  ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, H - 90, W, 90);
  ctx.fillStyle = accent; ctx.font = '700 28px "JetBrains Mono", monospace';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('#FrameInGoa', 50, H - 45);
  ctx.fillStyle = gold; ctx.textAlign = 'right';
  ctx.fillText('HH GOA 2026 • GOA, INDIA', W - 50, H - 45);

  // QR code
  const verifyUrl = encodeVerificationUrl(opts.cardData);
  QRCode.toDataURL(verifyUrl, { width: 120, margin: 1, color: { dark: '#ffffff', light: '#00000000' } })
    .then((qr: string) => {
      const qrImg = new Image();
      qrImg.onload = () => {
        const qc = canvas.getContext('2d'); if (!qc) return;
        qc.drawImage(qrImg, W / 2 - 55, H - 205, 110, 110);
      };
      qrImg.src = qr;
    });

  // Outer border
  ctx.strokeStyle = accent; ctx.lineWidth = 10;
  ctx.beginPath(); ctx.roundRect(5, 5, W - 10, H - 10, isSquare ? 0 : 28); ctx.stroke();
}
// ----------------------------------------------------
function renderStoryCard(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  opts: RenderOptions
) {
  const T = getTheme(opts.theme);
  const W = 1080, H = 1920;
  canvas.width = W;
  canvas.height = H;
  ctx.clearRect(0, 0, W, H);

  const gold = opts.adjustments.customColor || T.primary;
  const coral = T.coral;
  const teal = T.teal;

  // Background
  ctx.fillStyle = T.bg;
  ctx.fillRect(0, 0, W, H);

  // Diagonal grid lines
  ctx.save();
  ctx.globalAlpha = 0.035;
  ctx.strokeStyle = teal;
  ctx.lineWidth = 1;
  for (let i = -H; i < W + H; i += 80) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + H, H);
    ctx.stroke();
  }
  ctx.restore();

  // Center photo with fade at bottom
  if (opts.image) {
    ctx.save();
    const photoAreaH = H * 0.65;
    ctx.beginPath();
    ctx.rect(0, 0, W, photoAreaH);
    ctx.clip();
    applyFilters(ctx, opts.adjustments);    const cx = W / 2 + opts.adjustments.panX * 2;
    const cy = photoAreaH / 2 + opts.adjustments.panY * 2;
    ctx.translate(cx, cy);
    ctx.rotate((opts.adjustments.rotation * Math.PI) / 180);
    ctx.scale(opts.adjustments.zoom, opts.adjustments.zoom);
    const imgW = opts.image.naturalWidth || opts.image.width;
    const imgH = opts.image.naturalHeight || opts.image.height;
    const aspect = imgW / imgH;
    const targetAspect = W / photoAreaH;
    let dW, dH;
    if (aspect > targetAspect) { dH = photoAreaH; dW = photoAreaH * aspect; }
    else { dW = W; dH = W / aspect; }
    ctx.drawImage(opts.image, -dW / 2, -dH / 2, dW, dH);
    ctx.restore();
  } else {
    ctx.fillStyle = T.bg;
    ctx.fillRect(0, 0, W, H * 0.65);
    ctx.fillStyle = gold;
    ctx.font = '900 52px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📸 UPLOAD YOUR PHOTO', W / 2, H * 0.32);
  }

  // Top gradient overlay
  const topGrad = ctx.createLinearGradient(0, 0, 0, 380);
  topGrad.addColorStop(0, 'rgba(5, 13, 31, 0.97)');
  topGrad.addColorStop(1, 'rgba(5, 13, 31, 0)');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, W, 380);

  // Bottom gradient overlay
  const bottomGrad = ctx.createLinearGradient(0, H * 0.52, 0, H);
  bottomGrad.addColorStop(0, 'rgba(5, 13, 31, 0)');
  bottomGrad.addColorStop(0.3, 'rgba(5, 13, 31, 0.88)');
  bottomGrad.addColorStop(1, 'rgba(5, 13, 31, 0.99)');
  ctx.fillStyle = bottomGrad;
  ctx.fillRect(0, H * 0.52, W, H - H * 0.52);

  // Top ribbon
  drawRibbonPattern(ctx, 0, 0, W, 14, T);

  // Top branding
  ctx.fillStyle = gold;
  ctx.font = '900 52px "VT323", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('2:47PM STUDIO', 60, 90);

  ctx.fillStyle = gold;
  ctx.font = '900 72px "Bodoni Moda", serif';
  ctx.textAlign = 'center';
  ctx.fillText('HACKER HOUSE', W / 2, 200);
  ctx.fillText('GOA', W / 2, 280);

  // गोवा badge in header
  ctx.fillStyle = coral;
  ctx.strokeStyle = gold;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(W / 2 - 90, 296, 180, 60, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = gold;
  ctx.font = '900 38px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('गोवा', W / 2, 338);

  // Date pill
  ctx.fillStyle = 'rgba(5, 13, 31, 0.85)';
  ctx.strokeStyle = gold;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(W / 2 - 230, 368, 460, 52, 26);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = gold;
  ctx.font = 'bold 30px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('28 – 31 OCTOBER 2026 · GOA', W / 2, 402);

  // Bottom info section
  const bottomStart = H * 0.65;

  // Name
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 20;
  ctx.fillStyle = gold;
  ctx.font = '900 86px "Bodoni Moda", serif';
  ctx.textAlign = 'center';
  const nameY = bottomStart + 120;
  ctx.fillText(opts.cardData.fullName || 'YOUR NAME', W / 2, nameY);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px "JetBrains Mono", monospace';
  ctx.fillText(
    opts.cardData.handle ? (opts.cardData.handle.startsWith('@') ? opts.cardData.handle : `@${opts.cardData.handle}`) : '@your_handle',
    W / 2, nameY + 66
  );
  ctx.shadowBlur = 0;

  // Builder title bar
  const titleY = nameY + 120;
  ctx.fillStyle = coral;
  ctx.beginPath();
  ctx.roundRect(60, titleY, W - 120, 85, 8);
  ctx.fill();
  ctx.fillStyle = T.bg;
  ctx.font = '900 38px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`⚡ ${opts.cardData.builderTitle || 'SOLANA SHIFT DRIFTER'}`, W / 2, titleY + 57);

  // Role + Stack row
  const metaY = titleY + 115;
  ctx.fillStyle = 'rgba(3, 8, 20, 0.85)';
  ctx.strokeStyle = 'rgba(255, 77, 0, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(60, metaY, (W - 140) / 2, 90, 8);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(60 + (W - 140) / 2 + 20, metaY, (W - 140) / 2, 90, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = gold;
  ctx.font = 'bold 22px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('ROLE', 85, metaY + 30);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px "Outfit", sans-serif';
  ctx.fillText(opts.cardData.role || 'Full-Stack Hacker', 85, metaY + 67);

  const col2X = 60 + (W - 140) / 2 + 40;
  ctx.fillStyle = gold;
  ctx.font = 'bold 22px "JetBrains Mono", monospace';
  ctx.fillText('STACK', col2X, metaY + 30);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px "Outfit", sans-serif';
  ctx.fillText(opts.cardData.stack || 'Rust • TS • Solana', col2X, metaY + 67);

  // Hashtag
  ctx.fillStyle = teal;
  ctx.font = '900 54px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('#FrameInGoa', W / 2, H - 130);

  // Status badge strip
  ctx.fillStyle = 'rgba(5, 13, 31, 0.85)';
  ctx.strokeStyle = gold;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(W / 2 - 180, H - 220, 360, 54, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = gold;
  ctx.font = 'bold 26px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(opts.cardData.statusBadge || 'SHORTLISTED', W / 2, H - 185);

  // Bottom ribbon
  drawRibbonPattern(ctx, 0, H - 14, W, 14, T);

  drawSunburstRays(ctx, W / 2, H, 700, gold, 0.08);
}

function drawStickers(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  opts: RenderOptions
) {
  if (!opts.selectedStickers || opts.selectedStickers.length === 0) return;
  ctx.save();
  const W = canvas.width;

  opts.selectedStickers.forEach((stkId, index) => {
    const stkDef = STICKER_LIST.find((s) => s.id === stkId);
    if (!stkDef) return;
    const sx = W - 280;
    const sy = 220 + index * 90;
    const rot = index % 2 === 0 ? -0.1 : 0.1;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(rot);
    ctx.fillStyle = stkDef.bg;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    const padX = 24, padY = 16;
    ctx.font = '900 28px "Space Grotesk", sans-serif';
    const textW = ctx.measureText(stkDef.label).width;
    ctx.beginPath();
    ctx.roundRect(-textW / 2 - padX, -padY, textW + padX * 2, 55, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = stkDef.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(stkDef.label, 0, 14);
    ctx.restore();
  });
  ctx.restore();
}

function drawScanlinesOverlay(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
  const step = 8;
  for (let y = 0; y < canvas.height; y += step) {
    ctx.fillRect(0, y, canvas.width, 3);
  }
  ctx.restore();
}

function drawPlaceholderBackground(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  offsetX = 0, offsetY = 0,
  T?: ThemeColors
) {
  const theme = T ?? THEMES['neon-shore'];
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.fillStyle = theme.bgDeep;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 4;
  ctx.setLineDash([12, 12]);
  ctx.strokeRect(30, 30, w - 60, h - 60);
  ctx.setLineDash([]);
  ctx.fillStyle = theme.primary;
  ctx.font = '900 46px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('📸 UPLOAD YOUR PHOTO', w / 2, h / 2 - 20);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px "JetBrains Mono", monospace';
  ctx.fillText('Click "Step 1: Upload Photo" or pick a sample', w / 2, h / 2 + 35);
  ctx.restore();
}
