import React from 'react';
import type { Mode, IDCardStyleId, CornerStyle } from '../types';
import { Clock, X, Download } from 'lucide-react';

export interface RecentCard {
  id: number;
  thumbnail: string;
  name: string;
  mode: Mode;
  cardStyle: IDCardStyleId;
}

interface RecentCardsProps {
  cards: RecentCard[];
  onRemove: (id: number) => void;
  cornerStyle: CornerStyle;
}

const MODE_LABEL: Record<Mode, string> = {
  pfp: 'PFP',
  idcard: 'ID Card',
  story: 'Story',
};

const STYLE_LABEL: Partial<Record<IDCardStyleId, string>> = {
  'classic-dark': 'Classic',
  'editorial-light': 'Editorial',
  'terminal-hacker': 'Terminal',
  'magazine-cover': 'Magazine',
};

export const RecentCards: React.FC<RecentCardsProps> = ({ cards, onRemove, cornerStyle }) => {
  if (cards.length === 0) return null;

  const isSquare = cornerStyle === 'square';

  const handleRedownload = (thumbnail: string, name: string) => {
    const a = document.createElement('a');
    a.download = `hhgoa2026-${name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.jpg`;
    a.href = thumbnail;
    a.click();
  };

  return (
    <section style={{ padding: '0 1.5rem 2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Section header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        marginBottom: '0.8rem',
        borderTop: '1px solid rgba(255,204,0,0.15)',
        paddingTop: '1.2rem',
      }}>
        <Clock size={15} color="var(--accent-yellow)" />
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
          color: 'var(--accent-yellow)', fontWeight: 700, letterSpacing: '0.06em',
        }}>
          RECENTLY GENERATED ({cards.length})
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', marginLeft: '0.3rem' }}>
          · this session only
        </span>
      </div>

      {/* Horizontal scroll row */}
      <div style={{
        display: 'flex',
        gap: '0.9rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,204,0,0.3) transparent',
      }}>
        {cards.map(card => (
          <div
            key={card.id}
            style={{
              flexShrink: 0,
              position: 'relative',
              background: 'rgba(0,0,0,0.45)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: isSquare ? '0' : '10px',
              overflow: 'hidden',
              width: '130px',
              transition: 'border-color 0.2s',
              cursor: 'default',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,204,0,0.5)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
          >
            {/* Thumbnail */}
            <div style={{ width: '100%', aspectRatio: card.mode === 'pfp' ? '1/1' : card.mode === 'story' ? '9/16' : '2/3', overflow: 'hidden', background: '#020810' }}>
              <img
                src={card.thumbnail}
                alt={card.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>

            {/* Card info */}
            <div style={{ padding: '0.45rem 0.55rem' }}>
              <div style={{
                fontFamily: 'var(--font-heading)', fontSize: '0.72rem', fontWeight: 900,
                color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {card.name || 'Unnamed'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.58rem', fontWeight: 700,
                  background: 'rgba(255,204,0,0.15)', color: 'var(--accent-yellow)',
                  padding: '0.1rem 0.3rem', borderRadius: '3px',
                }}>
                  {MODE_LABEL[card.mode]}
                </span>
                {card.mode !== 'pfp' && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'rgba(255,255,255,0.35)' }}>
                    {STYLE_LABEL[card.cardStyle] || card.cardStyle}
                  </span>
                )}
              </div>
            </div>

            {/* Re-download button */}
            <button
              onClick={() => handleRedownload(card.thumbnail, card.name)}
              title="Re-download"
              style={{
                position: 'absolute', bottom: 36, right: 4,
                background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
                padding: '0.2rem', borderRadius: '4px', display: 'flex',
              }}
            >
              <Download size={11} />
            </button>

            {/* Remove button */}
            <button
              onClick={() => onRemove(card.id)}
              title="Remove"
              style={{
                position: 'absolute', top: 4, right: 4,
                background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
                padding: '0.2rem', borderRadius: '4px', display: 'flex',
              }}
            >
              <X size={11} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
