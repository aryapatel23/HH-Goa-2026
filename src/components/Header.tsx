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
    <header className={`glass-panel ${cornerStyle === 'square' ? 'square-corners' : 'rounded-corners'} tech-corners`} style={{ padding: '1.2rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Logo & 2:47 PM STUDIO Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
          <div style={{
            background: 'var(--accent-yellow)',
            border: '2px solid #fff',
            padding: '0.4rem 0.7rem',
            borderRadius: cornerStyle === 'square' ? '0px' : '6px',
            boxShadow: '0 0 15px rgba(255, 229, 0, 0.4)',
            color: '#043e24',
            fontWeight: 900,
            fontSize: '1rem',
            fontFamily: 'var(--font-pixel)',
            textAlign: 'center',
            lineHeight: 1.1
          }}>
            2:47PM<br />STUDIO
          </div>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-serif)', color: 'var(--accent-yellow)', letterSpacing: '0.02em' }}>
                HACKER HOUSE
              </h1>
              <span className="hindi-badge" style={{ fontSize: '0.9rem' }}>
                गोवा
              </span>
              <span className={`pill-tag ${cornerStyle === 'square' ? 'square' : 'rounded'}`} style={{ fontSize: '0.65rem' }}>
                <Flame size={12} color="var(--accent-pink)" /> 28-31 OCT 2026
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              GOA, INDIA  •  OFFICIAL BUILDER GRAPHIC GENERATOR
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className={`tab-switcher ${cornerStyle === 'square' ? 'square' : 'rounded'}`} style={{ minWidth: '400px' }}>
          <button
            className={`tab-btn ${mode === 'pfp' ? 'active' : ''}`}
            onClick={() => handleModeChange('pfp')}
          >
            <Image size={16} /> PFP Frame
          </button>
          <button
            className={`tab-btn ${mode === 'idcard' ? 'active' : ''}`}
            onClick={() => handleModeChange('idcard')}
          >
            <CreditCard size={16} /> Builder ID Card
          </button>
          <button
            className={`tab-btn ${mode === 'story' ? 'active' : ''}`}
            onClick={() => handleModeChange('story')}
          >
            <BookImage size={16} /> Story
          </button>
        </div>

        {/* Action Buttons: CHECK HYPE, VERIFY PASS, SOUND FX & HASHTAG */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleCheckHype}
            className={`btn btn-sunset ${cornerStyle === 'square' ? 'btn-square' : 'btn-rounded'}`}
            style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem', gap: '0.35rem' }}
          >
            <Zap size={16} color="var(--accent-yellow)" /> CHECK HYPE
          </button>

          <button
            onClick={() => { playClickSound(); onOpenVerify(); }}
            className={`btn btn-primary ${cornerStyle === 'square' ? 'btn-square' : 'btn-rounded'}`}
            style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem' }}
          >
            <ShieldCheck size={16} /> VERIFY PASS
          </button>

          <button
            title={muted ? 'Unmute Synth Audio' : 'Mute Synth Audio'}
            onClick={handleSoundToggle}
            className={`btn btn-secondary ${cornerStyle === 'square' ? 'btn-square' : 'btn-rounded'}`}
            style={{ padding: '0.55rem', fontSize: '0.8rem' }}
          >
            {muted ? <VolumeX size={16} color="#ff4d4d" /> : <Volume2 size={16} color="var(--accent-yellow)" />}
          </button>

          <button
            title="Toggle Square / Sharp Corners"
            onClick={handleCornerChange}
            className={`btn btn-secondary ${cornerStyle === 'square' ? 'btn-square' : 'btn-rounded'}`}
            style={{ padding: '0.5rem 0.8rem', fontSize: '0.8rem' }}
          >
            {cornerStyle === 'square' ? <Square size={16} color="var(--accent-yellow)" /> : <Circle size={16} />}
            <span>Corners: <strong>{cornerStyle.toUpperCase()}</strong></span>
          </button>

          <a
            href="https://x.com/search?q=%23FrameInGoa"
            target="_blank"
            rel="noreferrer"
            className={`btn btn-secondary ${cornerStyle === 'square' ? 'btn-square' : 'btn-rounded'}`}
            style={{ padding: '0.5rem 0.8rem', fontSize: '0.8rem', gap: '0.35rem' }}
          >
            <Sparkles size={16} color="var(--accent-pink)" /> #FrameInGoa
          </a>
        </div>

      </div>

      {/* Theme Switcher Row */}
      <div style={{
        marginTop: '0.9rem',
        paddingTop: '0.8rem',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0 }}>
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
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.35rem 0.75rem',
                background: isActive ? t.primary : 'rgba(255,255,255,0.05)',
                color: isActive ? '#050d1f' : 'var(--text-main)',
                border: `2px solid ${isActive ? t.primary : 'rgba(255,255,255,0.12)'}`,
                borderRadius: cornerStyle === 'square' ? '0px' : '6px',
                fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 800,
                cursor: 'pointer', transition: 'all 0.15s ease',
                textTransform: 'uppercase', letterSpacing: '0.04em',
                boxShadow: isActive ? `0 0 14px ${t.primary}55` : 'none',
              }}
            >
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: t.coral, border: `2px solid ${t.primary}`, flexShrink: 0 }} />
              {t.emoji} {t.label}
              {key === 'neon-shore' && <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>(dark)</span>}
              {key === 'emerald' && <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>(classic)</span>}
            </button>
          );
        })}
      </div>

    </header>
  );
};
