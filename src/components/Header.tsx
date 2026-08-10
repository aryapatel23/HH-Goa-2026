import React, { useState } from 'react';
import type { Mode, CornerStyle, Theme } from '../types';
import { THEMES } from '../types';
import { playHypeSound, playClickSound, toggleAudioMute } from '../utils/audio';
import { Image, CreditCard, Square, Circle, Sparkles, Flame, ShieldCheck, Volume2, VolumeX, Zap, BookImage } from 'lucide-react';
import confetti from 'canvas-confetti';

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
  setCornerStyle,
  theme,
  setTheme,
  onOpenVerify,
}) => {
  const [muted, setMuted] = useState(false);

  const handleModeChange = (newMode: Mode) => {
    playClickSound();
    setMode(newMode);
  };

  const handleCornerChange = () => {
    playClickSound();
    setCornerStyle(cornerStyle === 'square' ? 'rounded' : 'square');
  };

  const handleSoundToggle = () => {
    const isNowMuted = toggleAudioMute();
    setMuted(isNowMuted);
    if (!isNowMuted) {
      playClickSound();
    }
  };

  const handleCheckHype = () => {
    playHypeSound();
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.4 },
      colors: ['#ffe500', '#ff007f', '#00f0ff', '#10b981']
    });
  };

  return (
    <header className={`glass-panel ${cornerStyle === 'square' ? 'square-corners' : 'rounded-corners'} tech-corners`} style={{ padding: '1rem 1.5rem' }}>

      {/* ── Row 1: Branding + Mode Tabs + Actions ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem' }}>

        {/* Logo & Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', flexShrink: 0 }}>
          <a
            href="https://hhgoa.com"
            target="_blank"
            rel="noreferrer"
            title="Visit hhgoa.com"
            style={{ textDecoration: 'none' }}
          >
            <div style={{
              background: 'var(--accent-yellow)',
              border: '2px solid #fff',
              padding: '0.4rem 0.65rem',
              borderRadius: cornerStyle === 'square' ? '0px' : '6px',
              boxShadow: '0 0 18px rgba(255, 229, 0, 0.45)',
              color: '#020c05',
              fontWeight: 900,
              fontSize: '0.95rem',
              fontFamily: 'var(--font-pixel)',
              textAlign: 'center',
              lineHeight: 1.1,
              cursor: 'pointer',
            }}>
              2:47PM<br />STUDIO
            </div>
          </a>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--font-serif)', color: 'var(--accent-yellow)', letterSpacing: '0.02em', lineHeight: 1 }}>
                HACKER HOUSE
              </h1>
              <span className="hindi-badge" style={{ fontSize: '0.85rem' }}>गोवा</span>
              <span className={`pill-tag ${cornerStyle === 'square' ? 'square' : 'rounded'}`} style={{ fontSize: '0.62rem' }}>
                <Flame size={11} color="var(--accent-pink)" /> 28–31 OCT 2026
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.15rem', letterSpacing: '0.05em' }}>
              GOA, INDIA &nbsp;·&nbsp; OFFICIAL BUILDER GRAPHIC GENERATOR
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className={`tab-switcher ${cornerStyle === 'square' ? 'square' : 'rounded'} header-tabs`}>
          <button className={`tab-btn ${mode === 'pfp' ? 'active' : ''}`} onClick={() => handleModeChange('pfp')}>
            <Image size={15} /> PFP Frame
          </button>
          <button className={`tab-btn ${mode === 'idcard' ? 'active' : ''}`} onClick={() => handleModeChange('idcard')}>
            <CreditCard size={15} /> Builder ID
          </button>
          <button className={`tab-btn ${mode === 'story' ? 'active' : ''}`} onClick={() => handleModeChange('story')}>
            <BookImage size={15} /> Story
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleCheckHype}
            className={`btn btn-sunset ${cornerStyle === 'square' ? 'btn-square' : 'btn-rounded'}`}
            style={{ padding: '0.45rem 0.8rem', fontSize: '0.75rem', gap: '0.3rem' }}
          >
            <Zap size={15} color="var(--accent-yellow)" /> CHECK HYPE
          </button>

          <button
            onClick={() => { playClickSound(); onOpenVerify(); }}
            className={`btn btn-primary ${cornerStyle === 'square' ? 'btn-square' : 'btn-rounded'}`}
            style={{ padding: '0.45rem 0.8rem', fontSize: '0.75rem' }}
          >
            <ShieldCheck size={15} /> VERIFY PASS
          </button>

          <button
            title={muted ? 'Unmute Synth Audio' : 'Mute Synth Audio'}
            onClick={handleSoundToggle}
            className={`btn btn-secondary ${cornerStyle === 'square' ? 'btn-square' : 'btn-rounded'}`}
            style={{ padding: '0.5rem', fontSize: '0.75rem' }}
          >
            {muted ? <VolumeX size={15} color="#ff4d4d" /> : <Volume2 size={15} color="var(--accent-yellow)" />}
          </button>

          <button
            title="Toggle Square / Rounded Corners"
            onClick={handleCornerChange}
            className={`btn btn-secondary ${cornerStyle === 'square' ? 'btn-square' : 'btn-rounded'}`}
            style={{ padding: '0.45rem 0.7rem', fontSize: '0.75rem' }}
          >
            {cornerStyle === 'square' ? <Square size={15} color="var(--accent-yellow)" /> : <Circle size={15} />}
            <span style={{ display: 'none' }} className="corner-label">Corners: <strong>{cornerStyle.toUpperCase()}</strong></span>
          </button>

          <a
            href="https://x.com/search?q=%23FrameInGoa"
            target="_blank"
            rel="noreferrer"
            className={`btn btn-secondary ${cornerStyle === 'square' ? 'btn-square' : 'btn-rounded'}`}
            style={{ padding: '0.45rem 0.8rem', fontSize: '0.75rem', gap: '0.3rem' }}
          >
            <Sparkles size={15} color="var(--accent-pink)" /> #FrameInGoa
          </a>
        </div>

      </div>

      {/* ── Row 2: Theme Switcher ── */}
      <div style={{
        marginTop: '0.75rem',
        paddingTop: '0.65rem',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0 }}>
          Theme:
        </span>
        {(Object.entries(THEMES) as [Theme, (typeof THEMES)[Theme]][]).map(([key, t]) => {
          const isActive = theme === key;
          return (
            <button
              key={key}
              onClick={() => { playClickSound(); setTheme(key); }}
              title={t.label}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.28rem 0.65rem',
                background: isActive ? t.primary : 'rgba(255,255,255,0.04)',
                color: isActive ? '#020c05' : 'var(--text-main)',
                border: `1.5px solid ${isActive ? t.primary : 'rgba(255,255,255,0.10)'}`,
                borderRadius: cornerStyle === 'square' ? '0px' : '5px',
                fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 800,
                cursor: 'pointer', transition: 'all 0.15s ease',
                textTransform: 'uppercase', letterSpacing: '0.04em',
                boxShadow: isActive ? `0 0 12px ${t.primary}44` : 'none',
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isActive ? '#020c05' : t.coral, flexShrink: 0 }} />
              {t.emoji} {t.label}
              {key === 'hhgoa' && <span style={{ fontSize: '0.58rem', opacity: 0.75 }}>(official)</span>}
            </button>
          );
        })}

        {/* hhgoa.com link */}
        <a
          href="https://hhgoa.com"
          target="_blank"
          rel="noreferrer"
          style={{
            marginLeft: 'auto',
            fontSize: '0.68rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            textDecoration: 'none',
            opacity: 0.7,
            letterSpacing: '0.04em',
            flexShrink: 0,
          }}
        >
          hhgoa.com ↗
        </a>
      </div>

    </header>
  );
};
