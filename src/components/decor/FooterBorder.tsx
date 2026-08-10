import React from 'react';

/** Palm / monstera / hibiscus strip for footer — matches brand kit */
export const FooterBorder: React.FC = () => (
  <div className="footer-leaf-border" aria-hidden>
    <svg viewBox="0 0 800 48" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      {/* Monstera leaves */}
      <ellipse cx="40" cy="28" rx="28" ry="16" fill="var(--hh-green-700)" stroke="var(--hh-ink)" strokeWidth="1.5" />
      <ellipse cx="100" cy="22" rx="22" ry="14" fill="var(--hh-green-800)" stroke="var(--hh-ink)" strokeWidth="1.5" />
      {/* Hibiscus */}
      <circle cx="160" cy="24" r="10" fill="var(--hh-pink)" stroke="var(--hh-yellow)" strokeWidth="1.5" />
      <circle cx="160" cy="24" r="3" fill="var(--hh-yellow)" />
      <ellipse cx="220" cy="30" rx="26" ry="14" fill="var(--hh-green-700)" stroke="var(--hh-ink)" strokeWidth="1.5" />
      <circle cx="280" cy="20" r="9" fill="var(--hh-pink)" stroke="var(--hh-yellow)" strokeWidth="1.5" />
      <ellipse cx="340" cy="28" rx="30" ry="15" fill="var(--hh-green-800)" stroke="var(--hh-ink)" strokeWidth="1.5" />
      <ellipse cx="420" cy="24" rx="24" ry="13" fill="var(--hh-green-700)" stroke="var(--hh-ink)" strokeWidth="1.5" />
      <circle cx="480" cy="26" r="10" fill="var(--hh-pink)" stroke="var(--hh-yellow)" strokeWidth="1.5" />
      <circle cx="480" cy="26" r="3" fill="var(--hh-yellow)" />
      <ellipse cx="540" cy="30" rx="28" ry="14" fill="var(--hh-green-800)" stroke="var(--hh-ink)" strokeWidth="1.5" />
      <ellipse cx="620" cy="22" rx="22" ry="13" fill="var(--hh-green-700)" stroke="var(--hh-ink)" strokeWidth="1.5" />
      <circle cx="680" cy="24" r="9" fill="var(--hh-pink)" stroke="var(--hh-yellow)" strokeWidth="1.5" />
      <ellipse cx="740" cy="28" rx="30" ry="15" fill="var(--hh-green-800)" stroke="var(--hh-ink)" strokeWidth="1.5" />
      <ellipse cx="790" cy="24" rx="18" ry="12" fill="var(--hh-green-700)" stroke="var(--hh-ink)" strokeWidth="1.5" />
    </svg>
  </div>
);
