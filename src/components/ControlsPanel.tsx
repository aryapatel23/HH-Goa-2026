import React from 'react';
import type {
  Mode,
  FrameTemplateId,
  IDCardStyleId,
  PhotoAdjustments,
  IDCardData,
  CornerStyle,
  StickerId
} from '../types';
import { StickerSelector } from './StickerSelector';
import { playClickSound } from '../utils/audio';
import {
  Sliders,
  RotateCw,
  User,
  Wand2,
  RefreshCw,
  Layers,
  ZoomIn,
  Move,
  Sun,
  Palette,
  Tv
} from 'lucide-react';

interface ControlsPanelProps {
  mode: Mode;
  cornerStyle: CornerStyle;
  frameTemplate: FrameTemplateId;
  setFrameTemplate: (id: FrameTemplateId) => void;
  cardStyle: IDCardStyleId;
  setCardStyle: (id: IDCardStyleId) => void;
  adjustments: PhotoAdjustments;
  setAdjustments: React.Dispatch<React.SetStateAction<PhotoAdjustments>>;
  cardData: IDCardData;
  setCardData: React.Dispatch<React.SetStateAction<IDCardData>>;
  selectedStickers: StickerId[];
  onToggleSticker: (id: StickerId) => void;
}

const FRAME_TEMPLATES: { id: FrameTemplateId; label: string; color: string }[] = [
  { id: 'studio-emerald', label: '2:47 PM Emerald', color: '#ffe500' },
  { id: 'neon-sunset', label: 'Neon Sunset', color: '#ff007f' },
  { id: 'hacker-cyber', label: 'Hacker Cyber', color: '#00ff66' },
  { id: 'coastal-wave', label: 'Coastal Wave', color: '#38bdf8' },
  { id: 'retro-synth', label: 'Retro Synth', color: '#ff9100' },
  { id: 'gold-builder', label: 'Gold Builder', color: '#ffd700' },
];

const CARD_STYLES: { id: IDCardStyleId; label: string; color: string; desc: string }[] = [
  { id: 'goa-resort',      label: '🌴 Goa Passport',     color: '#ffe500', desc: 'Unique builder badge' },
  { id: 'sunset-beach',    label: '🌅 Sunset Beach',      color: '#ff6b1a', desc: 'Warm sunset gradient' },
  { id: 'classic-dark',    label: 'Classic Dark',         color: '#ffcc00', desc: 'Dark navy + gold' },
  { id: 'editorial-light', label: 'Editorial Light',      color: '#1a4a2e', desc: 'Cream + bold serif' },
  { id: 'terminal-hacker', label: 'Terminal Hacker',      color: '#00ff88', desc: 'Black + neon green' },
  { id: 'magazine-cover',  label: 'Magazine Cover',       color: '#ff4d00', desc: 'Full photo + overlay' },
];

const ACCENT_COLORS = [
  { name: 'Warm Gold', hex: '#ffcc00' },
  { name: 'Coral Sunset', hex: '#ff4d00' },
  { name: 'Ocean Teal', hex: '#00d4c8' },
  { name: 'Neon Green', hex: '#00ff66' },
  { name: 'Deep Gold', hex: '#ffd700' },
  { name: 'Cyber Purple', hex: '#7c3aed' },
];

const BUILDER_TITLES_BY_STACK: Record<string, string[]> = {
  rust: ['RUST BYTE CRAFTER 🦀', 'MEMORY-SAFE ARCHITECT 🦀', 'FERRIS THE SHIPPER 🦀'],
  solana: ['ON-CHAIN WIZARD ⚡', 'LAMPORT COLLECTOR 🌊', 'SOLANA SURFER 🏄'],
  ethereum: ['EVM WHISPERER 💎', 'GAS OPTIMIZER PRO ⚡', 'SOLIDITY SHORE HACKER 🔷'],
  typescript: ['TYPE-SAFE NOMAD 📦', 'TS WAVE RIDER 🌊', 'STRICT MODE BUILDER ⚡'],
  react: ['COMPONENT ARCHITECT ⚛️', 'UI SHORE BUILDER 🌊', 'HOOK WAVE RIDER ⚛️'],
  python: ['PYTHON BEACH BUM 🐍', 'DATA SURFER GOA 📊', 'SCRIPT NOMAD 🐍'],
  ai: ['NEURAL NOMAD 🧠', 'PROMPT ENGINEER GOA 🌴', 'AI WAVE RIDER 🤖'],
  web3: ['DEGEN ARCHITECT 🔗', 'PROTOCOL SURFER 🏄', 'WEB3 SHORE PIRATE ⛵'],
  mobile: ['APP SHORE ARCHITECT 📱', 'NATIVE WAVE BUILDER 🌊'],
  default: [
    '2:47 PM SHIPPER ⚡',
    'GOA WAVE ARCHITECT 🌊',
    'ZERO KNOWLEDGE HACKER 🔐',
    'BEACH CODE NOMAD 🌴',
    'PROTOCOL SURFER 🏄',
    'DAWN FREQUENCY DRIFTER ⚡',
    'EMERALD CODE HACKER 🔮',
    'GOA FULL STACK LEGEND 🔥',
  ],
};

function generateSmartTitle(stack: string): string {
  const lower = stack.toLowerCase();
  for (const [key, titles] of Object.entries(BUILDER_TITLES_BY_STACK)) {
    if (key !== 'default' && lower.includes(key)) {
      return titles[Math.floor(Math.random() * titles.length)];
    }
  }
  const defaults = BUILDER_TITLES_BY_STACK.default;
  return defaults[Math.floor(Math.random() * defaults.length)];
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  mode,
  cornerStyle,
  frameTemplate,
  setFrameTemplate,
  cardStyle,
  setCardStyle,
  adjustments,
  setAdjustments,
  cardData,
  setCardData,
  selectedStickers,
  onToggleSticker,
}) => {
  const isSquare = cornerStyle === 'square';

  const handleTitleGenerate = () => {
    playClickSound();
    const smartTitle = generateSmartTitle(cardData.stack || '');
    setCardData((prev) => ({ ...prev, builderTitle: smartTitle }));
  };

  const handleResetAdjustments = () => {
    playClickSound();
    setAdjustments({
      zoom: 1,
      panX: 0,
      panY: 0,
      rotation: 0,
      filter: 'none',
      brightness: 100,
      contrast: 100,
      saturation: 100,
      customColor: undefined,
      scanlinesEnabled: false,
    });
  };

  return (
    <div className={`glass-panel ${isSquare ? 'square-corners' : 'rounded-corners'}`} style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      
      {/* 1. TEMPLATE PRESET SELECTOR */}
      <div>
        <div className="input-label" style={{ marginBottom: '0.6rem' }}>
          <Layers size={16} /> STEP 2: SELECT {mode === 'pfp' ? 'FRAME OVERLAY' : mode === 'story' ? 'STORY STYLE' : 'CARD STYLE'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
          {mode !== 'pfp'
            ? CARD_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => { playClickSound(); setCardStyle(style.id); }}
                  className={`btn btn-secondary ${isSquare ? 'btn-square' : 'btn-rounded'}`}
                  style={{
                    padding: '0.5rem',
                    fontSize: '0.7rem',
                    borderColor: cardStyle === style.id ? style.color : 'rgba(255, 229, 0, 0.2)',
                    background: cardStyle === style.id
                      ? style.id === 'editorial-light' ? '#f0ebe0'
                        : style.id === 'terminal-hacker' ? '#001a00'
                        : style.id === 'magazine-cover' ? '#1a0a00'
                        : 'var(--accent-yellow)'
                      : 'transparent',
                    color: cardStyle === style.id
                      ? style.id === 'editorial-light' ? '#1a4a2e'
                        : style.id === 'terminal-hacker' ? '#00ff88'
                        : style.id === 'magazine-cover' ? '#ff4d00'
                        : '#043e24'
                      : 'var(--text-main)',
                    fontWeight: 800,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: style.color }} />
                  <span>{style.label}</span>
                  <span style={{ fontSize: '0.6rem', opacity: 0.7, fontWeight: 400 }}>{style.desc}</span>
                </button>
              ))
            : FRAME_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => { playClickSound(); setFrameTemplate(tmpl.id); }}
                  className={`btn btn-secondary ${isSquare ? 'btn-square' : 'btn-rounded'}`}
                  style={{
                    padding: '0.5rem',
                    fontSize: '0.75rem',
                    borderColor: frameTemplate === tmpl.id ? tmpl.color : 'rgba(255, 229, 0, 0.2)',
                    background: frameTemplate === tmpl.id ? 'var(--accent-yellow)' : 'transparent',
                    color: frameTemplate === tmpl.id ? '#043e24' : 'var(--text-main)',
                    fontWeight: frameTemplate === tmpl.id ? 900 : 700,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem'
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: tmpl.color }} />
                  {tmpl.label}
                </button>
              ))}
        </div>
      </div>

      {/* 2. CUSTOM ACCENT COLOR PALETTE */}
      <div style={{ borderTop: '1px solid rgba(255, 229, 0, 0.2)', paddingTop: '1rem' }}>
        <div className="input-label" style={{ marginBottom: '0.6rem' }}>
          <Palette size={16} /> CUSTOM ACCENT COLOR PALETTE
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {ACCENT_COLORS.map((clr) => {
            const isSelected = adjustments.customColor === clr.hex || (!adjustments.customColor && clr.hex === '#ffe500');
            return (
              <button
                key={clr.hex}
                onClick={() => { playClickSound(); setAdjustments({ ...adjustments, customColor: clr.hex }); }}
                title={clr.name}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: isSquare ? '0px' : '50%',
                  background: clr.hex,
                  border: isSelected ? '3px solid #ffffff' : '2px solid rgba(0,0,0,0.5)',
                  boxShadow: isSelected ? `0 0 14px ${clr.hex}` : 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease'
                }}
              />
            );
          })}

          <button
            onClick={() => { playClickSound(); setAdjustments({ ...adjustments, scanlinesEnabled: !adjustments.scanlinesEnabled }); }}
            className={`btn btn-secondary ${isSquare ? 'btn-square' : 'btn-rounded'}`}
            style={{
              padding: '0.4rem 0.8rem',
              fontSize: '0.75rem',
              borderColor: adjustments.scanlinesEnabled ? 'var(--accent-yellow)' : 'rgba(255, 229, 0, 0.2)',
              background: adjustments.scanlinesEnabled ? 'rgba(255, 229, 0, 0.15)' : 'transparent',
              color: adjustments.scanlinesEnabled ? 'var(--accent-yellow)' : 'var(--text-main)',
              marginLeft: 'auto'
            }}
          >
            <Tv size={14} /> CRT Scanlines: <strong>{adjustments.scanlinesEnabled ? 'ON' : 'OFF'}</strong>
          </button>
        </div>
      </div>

      {/* 3. FORMAT B (BUILDER ID CARD) FORM INPUTS */}
      {mode === 'idcard' && (
        <div style={{ borderTop: '1px solid rgba(255, 229, 0, 0.2)', paddingTop: '1rem' }}>
          <div className="input-label" style={{ marginBottom: '0.8rem' }}>
            <User size={16} /> BUILDER CARD DETAILS
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input
                type="text"
                className={`input-field ${isSquare ? 'square-corners' : 'rounded-corners'}`}
                placeholder="Satoshi Nakamoto"
                value={cardData.fullName}
                onChange={(e) => setCardData({ ...cardData, fullName: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label className="input-label">X / Twitter Handle</label>
              <input
                type="text"
                className={`input-field ${isSquare ? 'square-corners' : 'rounded-corners'}`}
                placeholder="@satoshi"
                value={cardData.handle}
                onChange={(e) => setCardData({ ...cardData, handle: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div className="input-group">
              <label className="input-label">Role / Specialty</label>
              <input
                type="text"
                className={`input-field ${isSquare ? 'square-corners' : 'rounded-corners'}`}
                placeholder="Smart Contract Hacker"
                value={cardData.role}
                onChange={(e) => setCardData({ ...cardData, role: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Tech Stack</label>
              <input
                type="text"
                className={`input-field ${isSquare ? 'square-corners' : 'rounded-corners'}`}
                placeholder="Rust • TS • Solana"
                value={cardData.stack}
                onChange={(e) => setCardData({ ...cardData, stack: e.target.value })}
              />
            </div>
          </div>

          {/* Title Generator Row */}
          <div className="input-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label className="input-label">Generated Builder Title</label>
              <button
                onClick={handleTitleGenerate}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-yellow)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                <Wand2 size={12} /> Auto-Generate
              </button>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className={`input-field ${isSquare ? 'square-corners' : 'rounded-corners'}`}
                value={cardData.builderTitle}
                onChange={(e) => setCardData({ ...cardData, builderTitle: e.target.value })}
              />
            </div>
          </div>

          {/* Status Badge Selection */}
          <div className="input-group">
            <label className="input-label">Status Badge</label>
            <select
              className={`input-field ${isSquare ? 'square-corners' : 'rounded-corners'}`}
              value={cardData.statusBadge}
              onChange={(e) => { playClickSound(); setCardData({ ...cardData, statusBadge: e.target.value as any }); }}
              style={{ cursor: 'pointer' }}
            >
              <option value="SHORTLISTED">SHORTLISTED ⚡</option>
              <option value="CONFIRMED BUILDER">CONFIRMED BUILDER 🌊</option>
              <option value="VIP HACKER">VIP HACKER 🔑</option>
              <option value="SPEAKER">SPEAKER 🎤</option>
              <option value="GOA NOMAD">GOA NOMAD 🌴</option>
            </select>
          </div>
        </div>
      )}

      {/* 4. INTERACTIVE STICKERS */}
      <StickerSelector
        selectedStickers={selectedStickers}
        onToggleSticker={(id) => { playClickSound(); onToggleSticker(id); }}
        cornerStyle={cornerStyle}
      />

      {/* 5. PHOTO ADJUSTMENT CONTROLS */}
      <div style={{ borderTop: '1px solid rgba(255, 229, 0, 0.2)', paddingTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
          <div className="input-label">
            <Sliders size={16} /> PHOTO POSITION, ZOOM & FINE-TUNING
          </div>
          <button
            onClick={handleResetAdjustments}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontFamily: 'var(--font-mono)'
            }}
          >
            <RefreshCw size={12} /> Reset Photo
          </button>
        </div>

        {/* Zoom Slider */}
        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ZoomIn size={14} /> Zoom Scale
            </span>
            <span className="slider-val">{adjustments.zoom.toFixed(2)}x</span>
          </div>
          <div className="slider-container">
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.05"
              className="range-input"
              value={adjustments.zoom}
              onChange={(e) => setAdjustments({ ...adjustments, zoom: parseFloat(e.target.value) })}
            />
          </div>
        </div>

        {/* Pan X / Pan Y Sliders */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Move size={14} /> Pan X
              </span>
              <span className="slider-val">{adjustments.panX}px</span>
            </div>
            <input
              type="range"
              min="-400"
              max="400"
              step="5"
              className="range-input"
              value={adjustments.panX}
              onChange={(e) => setAdjustments({ ...adjustments, panX: parseInt(e.target.value) })}
            />
          </div>

          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Move size={14} /> Pan Y
              </span>
              <span className="slider-val">{adjustments.panY}px</span>
            </div>
            <input
              type="range"
              min="-400"
              max="400"
              step="5"
              className="range-input"
              value={adjustments.panY}
              onChange={(e) => setAdjustments({ ...adjustments, panY: parseInt(e.target.value) })}
            />
          </div>
        </div>

        {/* Brightness Fine-tuning */}
        <div className="input-group" style={{ marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Sun size={14} /> Brightness
            </span>
            <span className="slider-val">{adjustments.brightness}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="150"
            step="2"
            className="range-input"
            value={adjustments.brightness}
            onChange={(e) => setAdjustments({ ...adjustments, brightness: parseInt(e.target.value) })}
          />
        </div>

        {/* Rotation & Filter Presets */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.8rem', marginTop: '0.4rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Rotate</span>
            <button
              onClick={() => { playClickSound(); setAdjustments((prev) => ({ ...prev, rotation: (prev.rotation + 90) % 360 })); }}
              className={`btn btn-secondary ${isSquare ? 'btn-square' : 'btn-rounded'}`}
              style={{ width: '100%', padding: '0.5rem', fontSize: '0.75rem' }}
            >
              <RotateCw size={14} /> {adjustments.rotation}°
            </button>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Color Filter Preset</span>
            <select
              className={`input-field ${isSquare ? 'square-corners' : 'rounded-corners'}`}
              value={adjustments.filter}
              onChange={(e) => { playClickSound(); setAdjustments({ ...adjustments, filter: e.target.value as any }); }}
              style={{ padding: '0.45rem', fontSize: '0.8rem' }}
            >
              <option value="none">Normal (No Filter)</option>
              <option value="cyber">Cyber Neon Glow</option>
              <option value="sunset">Warm Sunset</option>
              <option value="crisp">Crisp High Contrast</option>
              <option value="vintage">Retro Film</option>
              <option value="mono">Hacker Monochrome</option>
              <option value="dramatic">Dramatic Beach</option>
            </select>
          </div>
        </div>
      </div>

    </div>
  );
};
