import React, { useState, useEffect } from 'react';
import type { CornerStyle } from '../types';
import { verifyHackerId } from '../utils/verifier';
import type { VerificationResult } from '../utils/verifier';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  X,
  Copy,
  Check,
  Award,
  Calendar,
  MapPin,
  UserCheck,
  Layers,
  Hash,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface VerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  cornerStyle: CornerStyle;
}

// Extract just the ID part from a full URL for display
function extractDisplayId(q: string): string {
  try {
    if (q.includes('?')) {
      const params = new URLSearchParams(q.split('?')[1] ?? q);
      return params.get('verify') || q;
    }
  } catch { /* noop */ }
  return q;
}

export const VerifyModal: React.FC<VerifyModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
  cornerStyle,
}) => {
  const isDirectLink = initialQuery.includes('?verify=') || initialQuery.includes('data=');
  const displayId = extractDisplayId(initialQuery);

  const [searchQuery, setSearchQuery] = useState(displayId || 'HH-GOA-2026-XXXX-YYYY');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const queryToVerify = initialQuery || displayId;
      setSearchQuery(displayId || queryToVerify);
      const res = verifyHackerId(queryToVerify);
      setResult(res);
      if (res.isValid) {
        setTimeout(() => {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.4 }, colors: ['#ffe500', '#ff007f', '#055a36', '#00d4c8'] });
        }, 300);
      }
    }
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  const isSquare = cornerStyle === 'square';

  const handleSearch = () => {
    const res = verifyHackerId(searchQuery);
    setResult(res);
    if (res.isValid) confetti({ particleCount: 70, spread: 60, colors: ['#ffe500', '#ff007f', '#055a36'] });
  };

  const handleCopyLink = () => {
    const verifyUrl = `${window.location.origin}${window.location.pathname}?verify=${encodeURIComponent(searchQuery)}`;
    navigator.clipboard.writeText(verifyUrl).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // ── FULL-PAGE CERTIFICATE VIEW (when opened from a direct link) ──────────
  if (isDirectLink && result) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: result.isValid ? 'linear-gradient(135deg, #011a0d 0%, #021c10 50%, #010e08 100%)' : '#1a0507',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem', overflowY: 'auto',
      }}>
        <button onClick={onClose} style={{
          position: 'fixed', top: 16, right: 16, zIndex: 10,
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff', cursor: 'pointer', padding: '0.5rem 1rem',
          borderRadius: isSquare ? '0' : '8px',
          fontFamily: 'var(--font-mono)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem',
        }}>
          <X size={14} /> Back to App
        </button>

        {result.isValid ? (
          <div style={{ width: '100%', maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

            {/* ── Top badge ── */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(255,229,0,0.12)', border: '1px solid rgba(255,229,0,0.4)',
                padding: '0.4rem 1rem', borderRadius: isSquare ? '0' : '999px',
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--accent-yellow)', fontWeight: 700,
              }}>
                <ShieldCheck size={14} /> OFFICIAL VERIFIED BUILDER PASS
              </div>
            </div>

            {/* ── Main certificate card ── */}
            <div style={{
              background: 'rgba(2, 30, 18, 0.98)',
              border: '2px solid var(--accent-yellow)',
              borderRadius: isSquare ? '0' : '16px',
              overflow: 'hidden',
              boxShadow: '0 24px 80px rgba(0,0,0,0.8), 0 0 60px rgba(255,229,0,0.08)',
            }}>
              {/* Header stripe */}
              <div style={{
                background: 'linear-gradient(135deg, #1a3a00, #042e16)',
                borderBottom: '1px solid rgba(255,229,0,0.25)',
                padding: '1.2rem 1.5rem',
                display: 'flex', alignItems: 'center', gap: '1rem',
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: isSquare ? '0' : '50%',
                  background: 'var(--accent-yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <ShieldCheck size={28} color="#022c10" />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,229,0,0.6)', letterSpacing: '0.08em' }}>
                    HACKER HOUSE GOA 2026
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 900, color: 'var(--accent-yellow)' }}>
                    BUILDER CREDENTIAL
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.1rem' }}>
                    {result.hackerId}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{
                    background: 'var(--accent-pink)', color: 'var(--accent-yellow)',
                    padding: '0.25rem 0.7rem', fontWeight: 900, fontSize: '0.75rem',
                    border: '1px solid var(--accent-yellow)', borderRadius: isSquare ? '0' : '4px',
                  }}>
                    {result.cardData?.statusBadge || 'VERIFIED'}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '1.5rem' }}>

                {/* Name + Handle */}
                <div style={{ marginBottom: '1.2rem' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,229,0,0.55)', letterSpacing: '0.07em', marginBottom: '0.25rem' }}>
                    BUILDER NAME
                  </div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>
                    {result.cardData?.fullName}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--accent-yellow)', marginTop: '0.2rem' }}>
                    {result.cardData?.handle}
                  </div>
                </div>

                {/* Data grid */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem',
                  background: 'rgba(0,0,0,0.35)', padding: '1rem',
                  border: '1px solid rgba(255,229,0,0.15)',
                  borderRadius: isSquare ? '0' : '8px',
                  marginBottom: '1.2rem',
                }}>
                  {[
                    { icon: <UserCheck size={12} />, label: 'ROLE', value: result.cardData?.role },
                    { icon: <Layers size={12} />, label: 'TECH STACK', value: result.cardData?.stack },
                    { icon: <MapPin size={12} />, label: 'ISSUER', value: result.issuer || '2:47 PM Studio × HH Goa' },
                    { icon: <Calendar size={12} />, label: 'EVENT DATE', value: result.issuedAt || '28–31 OCT 2026' },
                  ].map(({ icon, label, value }) => (
                    <div key={label}>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '0.2rem', marginBottom: '0.2rem' }}>
                        {icon} {label}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: label === 'TECH STACK' ? 'var(--accent-yellow)' : '#fff', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        {value || '—'}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Builder title */}
                {result.cardData?.builderTitle && (
                  <div style={{
                    background: 'rgba(255,229,0,0.08)', border: '1px solid rgba(255,229,0,0.2)',
                    padding: '0.6rem 1rem', borderRadius: isSquare ? '0' : '6px',
                    fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '0.85rem',
                    color: 'var(--accent-yellow)', marginBottom: '1.2rem',
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                  }}>
                    <Hash size={14} /> {result.cardData.builderTitle}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button onClick={handleCopyLink}
                    className={`btn btn-secondary ${isSquare ? 'btn-square' : 'btn-rounded'}`}
                    style={{ flex: 1, fontSize: '0.8rem' }}>
                    {copiedLink ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Verification Link</>}
                  </button>
                  <button onClick={onClose}
                    className={`btn btn-primary ${isSquare ? 'btn-square' : 'btn-rounded'}`}
                    style={{ flex: 1, fontSize: '0.8rem' }}>
                    <Award size={14} /> Create My Card
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)' }}>
              Powered by 2:47 PM Studio × Hacker House Goa 2026 · #FrameInGoa
            </div>
          </div>
        ) : (
          /* Invalid credential full page */
          <div style={{ width: '100%', maxWidth: '480px', textAlign: 'center' }}>
            <ShieldAlert size={56} color="#ff4d4d" style={{ marginBottom: '1rem' }} />
            <h2 style={{ color: '#ff4d4d', fontWeight: 900, fontSize: '1.4rem', marginBottom: '0.5rem' }}>
              INVALID CREDENTIAL
            </h2>
            <p style={{ color: '#ffaaaa', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              {result.message}
            </p>
            <button onClick={onClose} className={`btn btn-primary ${isSquare ? 'btn-square' : 'btn-rounded'}`}>
              <Award size={16} /> Go Generate Your Card
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── MANUAL SEARCH MODAL (opened from the app UI) ──────────────────────────
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(4, 30, 18, 0.92)', backdropFilter: 'blur(14px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div className={`glass-panel ${isSquare ? 'square-corners' : 'rounded-corners'}`} style={{
        maxWidth: '580px', width: '100%', padding: '1.5rem',
        maxHeight: '90vh', overflowY: 'auto',
        border: '2px solid var(--accent-yellow)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Award size={22} color="var(--accent-yellow)" />
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--accent-yellow)' }}>
                VERIFY BUILDER PASS
              </h2>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Enter a Hacker ID or paste a verification link
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.1)', border: 'none',
            color: 'var(--text-main)', cursor: 'pointer', padding: '0.4rem',
            borderRadius: isSquare ? '0' : '50%', display: 'flex',
          }}>
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="input-group" style={{ marginBottom: '1rem' }}>
          <label className="input-label">Hacker ID or Verification Link</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className={`input-field ${isSquare ? 'square-corners' : 'rounded-corners'}`}
              placeholder="HH-GOA-2026-XXXX-YYYY"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              style={{ fontSize: '0.88rem', fontFamily: 'var(--font-mono)' }}
            />
            <button onClick={handleSearch} className={`btn btn-primary ${isSquare ? 'btn-square' : 'btn-rounded'}`}
              style={{ padding: '0.75rem 1.1rem' }}>
              <Search size={16} /> Verify
            </button>
          </div>
        </div>

        {/* Result */}
        {result && (
          result.isValid ? (
            <div style={{
              background: 'rgba(2,38,22,0.95)', border: '2px solid var(--accent-yellow)',
              padding: '1.25rem', borderRadius: isSquare ? '0' : '10px',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(255,229,0,0.1)', padding: '0.5rem 0.8rem',
                borderLeft: '4px solid var(--accent-yellow)', marginBottom: '1rem',
              }}>
                <ShieldCheck size={20} color="var(--accent-yellow)" />
                <span style={{ fontWeight: 900, fontSize: '0.9rem', fontFamily: 'var(--font-heading)', color: 'var(--accent-yellow)' }}>
                  OFFICIAL VERIFIED BUILDER PASS
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.8rem', marginBottom: '0.8rem' }}>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-yellow)', fontFamily: 'var(--font-mono)' }}>BUILDER NAME</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, fontFamily: 'var(--font-serif)', color: '#fff' }}>{result.cardData?.fullName}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-yellow)', fontFamily: 'var(--font-mono)' }}>{result.cardData?.handle}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-yellow)', fontFamily: 'var(--font-mono)' }}>STATUS</div>
                  <div style={{ background: 'var(--accent-pink)', color: 'var(--accent-yellow)', padding: '0.25rem 0.6rem', fontWeight: 900, fontSize: '0.78rem', display: 'inline-block', marginTop: '0.2rem', border: '1px solid var(--accent-yellow)' }}>
                    {result.cardData?.statusBadge}
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', background: '#021e11', padding: '0.75rem', border: '1px solid rgba(255,229,0,0.15)', marginBottom: '0.8rem' }}>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ROLE</div>
                  <strong style={{ fontSize: '0.82rem', color: '#fff' }}>{result.cardData?.role}</strong>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>TECH STACK</div>
                  <strong style={{ fontSize: '0.82rem', color: 'var(--accent-yellow)' }}>{result.cardData?.stack}</strong>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,229,0,0.15)', paddingTop: '0.75rem', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={12} color="var(--accent-yellow)" />{result.issuer}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={12} color="var(--accent-pink)" />{result.issuedAt}</span>
              </div>
              <button onClick={handleCopyLink} className={`btn btn-secondary ${isSquare ? 'btn-square' : 'btn-rounded'}`} style={{ width: '100%', fontSize: '0.8rem' }}>
                {copiedLink ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Verification URL</>}
              </button>
            </div>
          ) : (
            <div style={{ background: 'rgba(50,10,20,0.9)', border: '2px solid #ff4d4d', padding: '1.2rem', borderRadius: isSquare ? '0' : '10px', textAlign: 'center' }}>
              <ShieldAlert size={32} color="#ff4d4d" style={{ marginBottom: '0.5rem' }} />
              <h3 style={{ color: '#ff4d4d', fontWeight: 900 }}>INVALID HACKER ID</h3>
              <p style={{ fontSize: '0.8rem', color: '#ffaaaa', marginTop: '0.3rem' }}>{result.message}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};
