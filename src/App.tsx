import React, { useState, useEffect } from 'react';
import type {
  Mode,
  CornerStyle,
  FrameTemplateId,
  IDCardStyleId,
  PhotoAdjustments,
  IDCardData,
  StickerId,
  Theme
} from './types';
import { Header } from './components/Header';
import { PhotoUploader } from './components/PhotoUploader';
import { DEMO_AVATARS } from './constants/avatars';
import { ControlsPanel } from './components/ControlsPanel';
import { PreviewCanvas } from './components/PreviewCanvas';
import { ShareModal } from './components/ShareModal';
import { VerifyModal } from './components/VerifyModal';
import { RecentCards } from './components/RecentCards';
import type { RecentCard } from './components/RecentCards';
import { generateHackerId } from './utils/verifier';
import { Flame, ShieldCheck, Zap } from 'lucide-react';
import { FooterBorder } from './components/decor/FooterBorder';
import { LivingGoaBg } from './components/LivingGoaBg';

type MobilePanel = 'upload' | 'customize' | 'preview';

export const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('pfp');
  const [cornerStyle, setCornerStyle] = useState<CornerStyle>('square');
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('upload');
  const [theme, setTheme] = useState<Theme>('hhgoa');

  // Apply theme class to body so CSS variable overrides work
  useEffect(() => {
    document.body.className = `theme-${theme}`;
    return () => { document.body.className = ''; };
  }, [theme]);

  const [image, setImage] = useState<HTMLImageElement | null>(null);

  // Preload default sample photo on initial mount
  useEffect(() => {
    const defaultUrl = DEMO_AVATARS[0].url;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setImage(img);
    img.src = defaultUrl;
  }, []);

  const [adjustments, setAdjustments] = useState<PhotoAdjustments>({
    zoom: 1,
    panX: 0,
    panY: 0,
    rotation: 0,
    filter: 'none',
    brightness: 100,
    contrast: 100,
    saturation: 100,
  });

  const [frameTemplate, setFrameTemplate] = useState<FrameTemplateId>('studio-emerald');
  const [cardStyle, setCardStyle] = useState<IDCardStyleId>('goa-resort');

  const [cardData, setCardData] = useState<IDCardData>({
    fullName: 'Alex Rivera',
    handle: '@alex_goa',
    role: 'Full-Stack & Systems Eng',
    stack: 'Rust • TS • Solana',
    builderTitle: '2:47 PM SHIPPER ⚡',
    statusBadge: 'SHORTLISTED',
    location: 'Goa, India',
    edition: '2026',
    hackerId: generateHackerId({ fullName: 'Alex Rivera', handle: '@alex_goa', role: 'Full-Stack & Systems Eng', stack: 'Rust • TS • Solana', statusBadge: 'SHORTLISTED' } as IDCardData),
  });

  // Auto-regenerate unique hacker ID whenever key card fields change
  useEffect(() => {
    const newId = generateHackerId(cardData);
    setCardData(prev => (prev.hackerId === newId ? prev : { ...prev, hackerId: newId }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardData.fullName, cardData.handle, cardData.role, cardData.stack, cardData.statusBadge]);

  const [selectedStickers, setSelectedStickers] = useState<StickerId[]>(['goa-hacker']);

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareImageDataUrl, setShareImageDataUrl] = useState('');

  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyQuery, setVerifyQuery] = useState('');
  const [isSharedView, setIsSharedView] = useState(false);
  const [recentCards, setRecentCards] = useState<RecentCard[]>([]);

  // Advance to preview on mobile when photo is uploaded
  const handleImageSelected = (img: HTMLImageElement) => {
    setImage(img);
    setMobilePanel('customize');
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyParam = params.get('verify');
    const dataParam = params.get('data');

    if (verifyParam && dataParam) {
      // Full data URL — decode it, pre-fill card, show ID card directly (no modal)
      try {
        const jsonStr = decodeURIComponent(atob(dataParam));
        const parsed = JSON.parse(jsonStr);
        setCardData(prev => ({
          ...prev,
          fullName:     parsed.name  || prev.fullName,
          handle:       parsed.handle || prev.handle,
          role:         parsed.role  || prev.role,
          stack:        parsed.stack || prev.stack,
          builderTitle: parsed.title || prev.builderTitle,
          statusBadge:  parsed.badge || prev.statusBadge,
          hackerId:     parsed.id   || verifyParam,
        }));
        setMode('idcard');
        setMobilePanel('preview');
        setIsSharedView(true);
        // Clear the URL params so it looks clean
        window.history.replaceState({}, '', window.location.pathname);
      } catch {
        // Fallback: open verify modal
        setVerifyQuery(window.location.href);
        setVerifyModalOpen(true);
      }
    } else if (verifyParam) {
      // Bare ID only — open verify modal
      setVerifyQuery(verifyParam);
      setVerifyModalOpen(true);
    }
  }, []);

  const handleToggleSticker = (id: StickerId) => {
    setSelectedStickers((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleShareRequested = (dataUrl: string) => {
    setShareImageDataUrl(dataUrl);
    setShareModalOpen(true);
  };

  const handleCardDownloaded = (thumbnail: string, meta: { name: string; mode: Mode; cardStyle: IDCardStyleId }) => {
    setRecentCards(prev => [
      { id: Date.now(), thumbnail, name: meta.name, mode: meta.mode, cardStyle: meta.cardStyle },
      ...prev,
    ].slice(0, 6));
  };

  const isSquare = cornerStyle === 'square';

  const MOBILE_STEPS: { key: MobilePanel; label: string; num: string }[] = [
    { key: 'upload', label: 'Upload', num: '1' },
    { key: 'customize', label: 'Customize', num: '2' },
    { key: 'preview', label: 'Export', num: '3' },
  ];

  return (
    <div className="app-container">
      <LivingGoaBg />
      <Header
        mode={mode}
        setMode={setMode}
        cornerStyle={cornerStyle}
        setCornerStyle={setCornerStyle}
        theme={theme}
        setTheme={setTheme}
        onOpenVerify={() => {
          setVerifyQuery('HH-GOA-2026-A89F-8842');
          setVerifyModalOpen(true);
        }}
      />

      {/* Shared-card banner — shown when arriving via a copied link */}
      {isSharedView && (
        <div style={{
          background: 'rgba(255,204,0,0.12)',
          borderBottom: '1px solid rgba(255,204,0,0.3)',
          padding: '0.5rem 1.5rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-yellow)',
        }}>
          <ShieldCheck size={14} />
          <span>Viewing shared card from <strong>{cardData.handle || cardData.fullName}</strong> — card data loaded automatically</span>
          <button
            onClick={() => setIsSharedView(false)}
            style={{
              marginLeft: 'auto', background: 'transparent',
              border: '1px solid rgba(255,204,0,0.4)', color: 'var(--accent-yellow)',
              padding: '0.2rem 0.6rem', cursor: 'pointer',
              borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
            }}
          >
            ✕ Dismiss
          </button>
        </div>
      )}

      {/* Mobile Step Navigator */}
      <nav className="mobile-steps">
        {MOBILE_STEPS.map((step, i) => {
          const isDone = MOBILE_STEPS.findIndex(s => s.key === mobilePanel) > i;
          return (
            <button
              key={step.key}
              className={`mobile-step-btn ${mobilePanel === step.key ? 'active' : ''} ${isDone ? 'done' : ''}`}
              onClick={() => setMobilePanel(step.key)}
            >
              <span className="step-num">{isDone ? '✓' : step.num}</span>
              {step.label}
            </button>
          );
        })}
      </nav>

      {/* Main App Grid — LEFT: Steps 1+2 | RIGHT: Preview */}
      <main className="main-grid">

        {/* ── LEFT COLUMN: Step 1 (Upload) + Step 2 (Customize) stacked ── */}
        <div className={`left-column${mobilePanel === 'preview' ? ' mobile-step-hidden' : ''}`}>

          {/* Step 1: Upload Photo */}
          <div className={mobilePanel === 'customize' ? 'mobile-step-hidden' : ''}>
            <PhotoUploader
              onImageSelected={handleImageSelected}
              cornerStyle={cornerStyle}
              hasPhoto={!!image}
            />
          </div>

          {/* Step 2: Customize */}
          <div className={mobilePanel === 'upload' ? 'mobile-step-hidden' : ''}>
            <ControlsPanel
              mode={mode}
              cornerStyle={cornerStyle}
              frameTemplate={frameTemplate}
              setFrameTemplate={setFrameTemplate}
              cardStyle={cardStyle}
              setCardStyle={setCardStyle}
              adjustments={adjustments}
              setAdjustments={setAdjustments}
              cardData={cardData}
              setCardData={setCardData}
              selectedStickers={selectedStickers}
              onToggleSticker={handleToggleSticker}
            />
          </div>
        </div>

        {/* ── RIGHT COLUMN: Live Preview + Export ── */}
        <div className={`right-column${mobilePanel !== 'preview' ? ' mobile-step-hidden' : ''}`}>
          <PreviewCanvas
            mode={mode}
            cornerStyle={cornerStyle}
            image={image}
            adjustments={adjustments}
            setAdjustments={setAdjustments}
            frameTemplate={frameTemplate}
            cardStyle={cardStyle}
            setCardStyle={setCardStyle}
            cardData={cardData}
            selectedStickers={selectedStickers}
            onShareRequested={handleShareRequested}
            onMobileAdvance={() => setMobilePanel('preview')}
            onDownloaded={handleCardDownloaded}
            theme={theme}
          />
        </div>

      </main>

      {/* Recently Generated Cards Gallery */}
      <RecentCards
        cards={recentCards}
        onRemove={(id) => setRecentCards(prev => prev.filter(c => c.id !== id))}
        cornerStyle={cornerStyle}
      />

      {/* Footer */}
      <footer
        className={`glass-panel ${isSquare ? 'square-corners' : 'rounded-corners'} site-footer-panel`}
        style={{
          padding: '1.1rem 1.25rem 0.5rem',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          marginTop: '0.5rem',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={14} color="var(--hh-yellow)" />
              <span style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', color: 'var(--hh-cream)' }}>
                2:47 PM STUDIO × HACKER HOUSE GOA 2026
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
              <a href="https://x.com/247pmstudio" target="_blank" rel="noreferrer" style={{ color: 'var(--hh-yellow)', textDecoration: 'none' }}>X · @247PMSTUDIO</a>
              <a href="https://t.me" target="_blank" rel="noreferrer" style={{ color: 'var(--hh-yellow)', textDecoration: 'none' }}>Telegram</a>
              <a href="mailto:hello@247pm.studio" style={{ color: 'var(--hh-yellow)', textDecoration: 'none' }}>Email</a>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <a href="https://hhgoa.com" target="_blank" rel="noreferrer" style={{ color: 'var(--hh-cream)', textDecoration: 'none' }}>BRAND KIT</a>
              <a href="https://hhgoa.com" target="_blank" rel="noreferrer" style={{ color: 'var(--hh-cream)', textDecoration: 'none' }}>TERMS &amp; CONDITIONS</a>
            </div>
            <button
              type="button"
              onClick={() => { setVerifyQuery(''); setVerifyModalOpen(true); }}
              style={{
                background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <ShieldCheck size={13} /> Verify Pass
            </button>
            <span style={{ opacity: 0.65 }}>© 2026 HH-GOA. ALL RIGHTS RESERVED.</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Flame size={12} color="var(--hh-pink)" />
              <a href="https://x.com/search?q=%23FrameInGoa" target="_blank" rel="noreferrer" style={{ color: 'var(--hh-pink)', textDecoration: 'none' }}>#FrameInGoa</a>
            </span>
          </div>
        </div>
        <FooterBorder />
      </footer>

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        imageDataUrl={shareImageDataUrl}
        mode={mode}
        cornerStyle={cornerStyle}
      />

      <VerifyModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        initialQuery={verifyQuery}
        cornerStyle={cornerStyle}
      />
    </div>
  );
};

export default App;
