import React, { useState } from 'react';
import type { Mode, CornerStyle, Theme } from '../types';
import { THEMES } from '../types';
import { playHypeSound, playClickSound, toggleAudioMute } from '../utils/audio';
import { Image, CreditCard, Sparkles, Flame, ShieldCheck, Volume2, VolumeX, Zap, BookImage } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PalmCorners } from './decor/PalmCorners';

interface HeaderProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
  cornerStyle: CornerStyle;
  setCornerStyle: (style: CornerStyle) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  onOpenVerify: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  setMode,
  cornerStyle,
  theme,
  setTheme,
  onOpenVerify,
}) => {
  const [muted, setMuted] = useState(false);
  const isSquare = cornerStyle === 'square';

  const handleModeChange = (newMode: Mode) => {
    playClickSound();
    setMode(newMode);
  };

  const handleCheckHype = () => {
    playHypeSound();
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.35 },
      colors: ['#F5D505', '#F0127A', '#FBF7E9', '#0B3D2A'],
    });
  };

  return (
    <header
      className={`glass-panel ${isSquare ? 'square-corners' : 'rounded-corners'} header-brand-wrap`}
      style={{ padding: '1.1rem 1.25rem' }}
    >
      <PalmCorners />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {/* Brand lockup */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <a href="https://hhgoa.com" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--hh-yellow)',
                border: '2px solid var(--hh-ink)',
                padding: '0.35rem 0.6rem',
                color: 'var(--hh-ink)',
                fontWeight: 900,
                fontSize: '0.9rem',
                fontFamily: 'var(--font-pixel)',
                textAlign: 'center',
                lineHeight: 1.1,
                boxShadow: '3px 3px 0 var(--hh-ink)',
              }}>
                2:47PM<br />STUDIO
              </div>
            </a>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                <h1 className="hh-lockup-title" style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)' }}>
                  HACKER HOUSE
                </h1>
                <span className="hindi-badge" style={{ fontSize: '0.9rem' }}>गोवा</span>
              </div>
              <p style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                marginTop: '0.2rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                GOA, INDIA · 28–31 OCT 2026 · FRAME &amp; ID GENERATOR
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleCheckHype}
              className="btn btn-ticket"
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.72rem', gap: '0.3rem', display: 'inline-flex', alignItems: 'center' }}
            >
              <Zap size={14} /> CHECK HYPE
            </button>
            <button
              type="button"
              onClick={() => { playClickSound(); onOpenVerify(); }}
              className={`btn btn-secondary ${isSquare ? 'btn-square' : 'btn-rounded'}`}
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.72rem' }}
            >
              <ShieldCheck size={14} /> VERIFY
            </button>
            <button
              type="button"
              title={muted ? 'Unmute' : 'Mute'}
              onClick={() => { setMuted(toggleAudioMute()); }}
              className={`btn btn-secondary ${isSquare ? 'btn-square' : 'btn-rounded'}`}
              style={{ padding: '0.45rem' }}
            >
              {muted ? <VolumeX size={15} color="#ff4d4d" /> : <Volume2 size={15} color="var(--hh-yellow)" />}
            </button>
            <a
              href="https://x.com/search?q=%23FrameInGoa"
              target="_blank"
              rel="noreferrer"
              className={`btn btn-secondary ${isSquare ? 'btn-square' : 'btn-rounded'}`}
              style={{ padding: '0.45rem 0.7rem', fontSize: '0.72rem', gap: '0.25rem' }}
            >
              <Sparkles size={14} color="var(--hh-pink)" /> #FrameInGoa
            </a>
          </div>
        </div>

        {/* Format switcher */}
        <div className={`tab-switcher ${isSquare ? 'square' : 'rounded'}`} style={{ width: '100%', maxWidth: '520px' }}>
          <button type="button" className={`tab-btn ${mode === 'pfp' ? 'active' : ''}`} onClick={() => handleModeChange('pfp')}>
            <Image size={15} /> PFP Frame
          </button>
          <button type="button" className={`tab-btn ${mode === 'idcard' ? 'active' : ''}`} onClick={() => handleModeChange('idcard')}>
            <CreditCard size={15} /> Builder ID
          </button>
          <button type="button" className={`tab-btn ${mode === 'story' ? 'active' : ''}`} onClick={() => handleModeChange('story')}>
            <BookImage size={15} /> Story
          </button>
        </div>

        {/* Theme row — compact */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
            fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            Theme
          </span>
          {(Object.entries(THEMES) as [Theme, (typeof THEMES)[Theme]][]).map(([key, t]) => {
            const active = theme === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => { playClickSound(); setTheme(key); }}
                title={t.label}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  padding: '0.25rem 0.55rem',
                  background: active ? t.primary : 'rgba(0,0,0,0.2)',
                  color: active ? 'var(--hh-ink)' : 'var(--hh-cream)',
                  border: `1.5px solid ${active ? t.primary : 'rgba(251,247,233,0.15)'}`,
                  borderRadius: isSquare ? 0 : 4,
                  fontSize: '0.65rem', fontFamily: 'var(--font-mono)', fontWeight: 800,
                  cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.04em',
                }}
              >
                {t.emoji} {t.label}
              </button>
            );
          })}
          <span style={{
            marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
            fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--hh-pink)', letterSpacing: '0.06em',
          }}>
            <Flame size={11} /> 28–31 OCT 2026
          </span>
        </div>
      </div>
    </header>
  );
};
