import React, { useEffect, useRef, useState } from 'react';
import type {
  Mode,
  FrameTemplateId,
  IDCardStyleId,
  PhotoAdjustments,
  IDCardData,
  CornerStyle,
  StickerId,
  Theme
} from '../types';
import { drawCanvas } from '../utils/canvasRenderer';
import { encodeVerificationUrl } from '../utils/verifier';
import { playSuccessSound } from '../utils/audio';
import { Download, Share2, Sparkles, Move, Maximize2, ChevronRight, Copy, Check, ExternalLink } from 'lucide-react';
import { THEMES } from '../types';
import confetti from 'canvas-confetti';

const CARD_STYLE_OPTIONS: { id: IDCardStyleId; label: string; color: string }[] = [
  { id: 'classic-dark',    label: 'Classic',   color: '#ffcc00' },
  { id: 'editorial-light', label: 'Editorial', color: '#1a4a2e' },
  { id: 'terminal-hacker', label: 'Terminal',  color: '#00ff88' },
  { id: 'magazine-cover',  label: 'Magazine',  color: '#ff4d00' },
];

interface PreviewCanvasProps {
  mode: Mode;
  cornerStyle: CornerStyle;
  image: HTMLImageElement | null;
  adjustments: PhotoAdjustments;
  setAdjustments: React.Dispatch<React.SetStateAction<PhotoAdjustments>>;
  frameTemplate: FrameTemplateId;
  cardStyle: IDCardStyleId;
  setCardStyle: (id: IDCardStyleId) => void;
  cardData: IDCardData;
  selectedStickers: StickerId[];
  onShareRequested: (imageDataUrl: string) => void;
  onMobileAdvance?: () => void;
  onDownloaded?: (thumbnail: string, meta: { name: string; mode: Mode; cardStyle: IDCardStyleId }) => void;
  theme?: Theme;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  mode,
  cornerStyle,
  image,
  adjustments,
  setAdjustments,
  frameTemplate,
  cardStyle,
  setCardStyle,
  cardData,
  selectedStickers,
  onShareRequested,
  onMobileAdvance,
  onDownloaded,
  theme,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      drawCanvas(canvasRef.current, {
        mode, image, adjustments, frameTemplate,
        cardStyle, cardData, cornerStyle, selectedStickers, theme,
      });
    }
  }, [mode, cornerStyle, image, adjustments, frameTemplate, cardStyle, cardData, selectedStickers, theme]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!image) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - adjustments.panX, y: e.clientY - adjustments.panY });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !image) return;
    setAdjustments(prev => ({ ...prev, panX: Math.round(e.clientX - dragStart.x), panY: Math.round(e.clientY - dragStart.y) }));
  };
  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!image) return;
    const t = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: t.clientX - adjustments.panX, y: t.clientY - adjustments.panY });
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !image) return;
    e.preventDefault();
    const t = e.touches[0];
    setAdjustments(prev => ({ ...prev, panX: Math.round(t.clientX - dragStart.x), panY: Math.round(t.clientY - dragStart.y) }));
  };
  const handleTouchEnd = () => setIsDragging(false);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    playSuccessSound();
    const T = THEMES[theme ?? 'neon-shore'];
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: [T.primary, T.coral, T.teal] });
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = `hhgoa2026-${mode === 'pfp' ? 'pfp' : mode === 'story' ? 'story' : 'card'}-${Date.now()}.png`;
    a.href = dataUrl;
    a.click();

    // Create thumbnail for the gallery (max 220px, JPEG compressed)
    if (onDownloaded) {
      try {
        const src = canvasRef.current;
        const thumb = document.createElement('canvas');
        const maxDim = 220;
        const scale = Math.min(maxDim / src.width, maxDim / src.height);
        thumb.width = Math.round(src.width * scale);
        thumb.height = Math.round(src.height * scale);
        const tc = thumb.getContext('2d');
        if (tc) {
          tc.drawImage(src, 0, 0, thumb.width, thumb.height);
          onDownloaded(thumb.toDataURL('image/jpeg', 0.75), { name: cardData.fullName, mode, cardStyle });
        }
      } catch { /* ignore quota errors */ }
    }
  };

  const handleShareClick = async () => {
    if (!canvasRef.current) return;
    playSuccessSound();
    const dataUrl = canvasRef.current.toDataURL('image/png');
    if (navigator.canShare) {
      try {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'hhgoa2026.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ title: 'HH Goa 2026', text: '#FrameInGoa 🌴⚡', files: [file] });
          confetti({ particleCount: 80, spread: 60, colors: ['#ffcc00', '#ff4d00', '#00d4c8'] });
          return;
        }
      } catch { /* fall through */ }
    }
    onShareRequested(dataUrl);
  };

  const handleCopyLink = async () => {
    const url = encodeVerificationUrl(cardData);
    try { await navigator.clipboard.writeText(url); }
    catch {
      const t = document.createElement('textarea');
      t.value = url; document.body.appendChild(t); t.select();
      document.execCommand('copy'); document.body.removeChild(t);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Short human-readable display URL — just the verify ID, not the giant base64 blob
  const shortDisplayUrl = `${window.location.origin}/?verify=${cardData.hackerId || 'HH-GOA-2026-XXXX'}`;

  const isSquare = cornerStyle === 'square';
  const resolutionText = mode === 'pfp' ? '2000×2000' : mode === 'story' ? '1080×1920' : '1200×1800';
  const canvasMaxH = mode === 'pfp' ? '480px' : mode === 'story' ? '540px' : '580px';
  const isCard = mode === 'idcard' || mode === 'story';

  return (
    <div
      className={`glass-panel ${isSquare ? 'square-corners' : 'rounded-corners'} tech-corners preview-canvas-wrapper`}
      style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sparkles size={15} color="var(--accent-yellow)" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-yellow)', fontWeight: 700 }}>
            LIVE PREVIEW
          </span>
        </div>
        <span className={`pill-tag ${isSquare ? 'square' : 'rounded'}`} style={{ fontSize: '0.65rem' }}>
          <Maximize2 size={11} /> {resolutionText} px HD
        </span>
      </div>

      {/* Card Style Switcher — only in ID card / Story mode */}
      {isCard && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
          {CARD_STYLE_OPTIONS.map(s => {
            const on = cardStyle === s.id;
            return (
              <button key={s.id} onClick={() => setCardStyle(s.id)} style={{
                padding: '0.4rem 0.25rem',
                border: `2px solid ${on ? s.color : 'rgba(255,255,255,0.1)'}`,
                borderRadius: isSquare ? '0' : '7px',
                background: on ? `${s.color}22` : 'transparent',
                color: on ? s.color : 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: '0.65rem',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
                transition: 'all 0.15s',
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, boxShadow: on ? `0 0 6px ${s.color}` : 'none' }} />
                {s.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Canvas */}
      <div
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
        style={{
          position: 'relative',
          width: '100%',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          background: '#020810',
          border: '1px solid rgba(255,77,0,0.3)',
          borderRadius: isSquare ? '0' : '10px',
          padding: '0.8rem',
          cursor: image ? (isDragging ? 'grabbing' : 'grab') : 'default',
          overflow: 'hidden',
          minHeight: '180px',
        }}
      >
        {image && (
          <div style={{
            position: 'absolute', top: 8, left: 8, zIndex: 10, pointerEvents: 'none',
            background: 'rgba(5,13,31,0.88)', border: '1px solid var(--accent-yellow)',
            padding: '0.25rem 0.5rem', borderRadius: '4px',
            fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-yellow)',
            display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700,
          }}>
            <Move size={11} /> Drag to reposition
          </div>
        )}
        <canvas ref={canvasRef} style={{
          maxWidth: '100%', maxHeight: canvasMaxH,
          objectFit: 'contain', display: 'block',
          boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
          borderRadius: isSquare ? '0' : (mode === 'pfp' ? '10px' : '14px'),
        }} />
      </div>

      {/* Download + Share — side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
        <button onClick={handleDownload} className={`btn btn-primary ${isSquare ? 'btn-square' : 'btn-rounded'}`}>
          <Download size={16} /> Download
        </button>
        <button onClick={handleShareClick} className={`btn btn-sunset ${isSquare ? 'btn-square' : 'btn-rounded'}`}>
          <Share2 size={16} /> Share to X
        </button>
      </div>

      {/* Unique Card Link */}
      <div style={{
        border: '1px solid rgba(255,204,0,0.2)',
        borderRadius: isSquare ? '0' : '8px',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '0.4rem 0.75rem',
          background: 'rgba(255,204,0,0.07)',
          borderBottom: '1px solid rgba(255,204,0,0.12)',
          display: 'flex', alignItems: 'center', gap: '0.35rem',
        }}>
          <ExternalLink size={12} color="var(--accent-yellow)" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--accent-yellow)', fontWeight: 700, letterSpacing: '0.04em' }}>
            YOUR UNIQUE CARD LINK
          </span>
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'rgba(255,255,255,0.25)' }}>
            QR code scans here too
          </span>
        </div>
        <div style={{ padding: '0.5rem 0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(0,0,0,0.3)' }}>
          <span style={{
            flex: 1, fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
            color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {shortDisplayUrl}
          </span>
          <button
            onClick={handleCopyLink}
            className={`btn ${copied ? 'btn-primary' : 'btn-secondary'} ${isSquare ? 'btn-square' : 'btn-rounded'}`}
            style={{ padding: '0.3rem 0.65rem', fontSize: '0.7rem', flexShrink: 0, minWidth: '72px', fontWeight: 700 }}
          >
            {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
          </button>
        </div>
        <div style={{ padding: '0.25rem 0.75rem 0.4rem', fontSize: '0.58rem', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-mono)' }}>
          Paste anywhere — opens directly to your verified builder card
        </div>
      </div>

      {/* Mobile back */}
      {onMobileAdvance && (
        <button onClick={onMobileAdvance} className={`btn btn-secondary ${isSquare ? 'btn-square' : 'btn-rounded'}`}
          style={{ fontSize: '0.8rem', display: 'none' }} id="mobile-back-to-customize">
          <ChevronRight size={16} /> Customize More
        </button>
      )}
    </div>
  );
};
