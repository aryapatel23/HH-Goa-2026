import React from 'react';
import type { StickerId, CornerStyle } from '../types';
import { Tag } from 'lucide-react';

interface StickerSelectorProps {
  selectedStickers: StickerId[];
  onToggleSticker: (id: StickerId) => void;
  cornerStyle: CornerStyle;
}

export const STICKER_LIST: { id: StickerId; label: string; bg: string; color: string }[] = [
  { id: 'goa-hacker', label: 'HACKING IN GOA 🌴', bg: '#ff007f', color: '#ffe500' },
  { id: '0xbuilder', label: '0xBUILDER ⚡', bg: '#ffe500', color: '#043e24' },
  { id: 'solana-heart', label: 'SOLANA 💜', bg: '#9d4edd', color: '#ffffff' },
  { id: 'beach-mode', label: 'BEACH MODE ON 🌊', bg: '#38bdf8', color: '#043e24' },
  { id: 'ship-it', label: 'SHIP IT 🚀', bg: '#10b981', color: '#ffffff' },
  { id: 'vip-pass', label: 'VIP HACKER 🔑', bg: '#ffd700', color: '#000000' },
];

export const StickerSelector: React.FC<StickerSelectorProps> = ({
  selectedStickers,
  onToggleSticker,
  cornerStyle,
}) => {
  const isSquare = cornerStyle === 'square';

  return (
    <div style={{ borderTop: '1px solid rgba(255, 229, 0, 0.2)', paddingTop: '1rem' }}>
      <div className="input-label" style={{ marginBottom: '0.6rem' }}>
        <Tag size={16} /> INTERACTIVE STICKERS & BADGES
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
        {STICKER_LIST.map((stk) => {
          const isSelected = selectedStickers.includes(stk.id);
          return (
            <button
              key={stk.id}
              onClick={() => onToggleSticker(stk.id)}
              className={`btn btn-secondary ${isSquare ? 'btn-square' : 'btn-rounded'}`}
              style={{
                padding: '0.45rem',
                fontSize: '0.72rem',
                border: isSelected ? `2px solid ${stk.bg}` : '1px solid rgba(255, 229, 0, 0.2)',
                background: isSelected ? stk.bg : 'transparent',
                color: isSelected ? stk.color : 'var(--text-main)',
                fontWeight: isSelected ? 900 : 600,
                boxShadow: isSelected ? `0 0 12px ${stk.bg}` : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {stk.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
