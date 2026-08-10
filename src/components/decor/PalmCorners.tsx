import React from 'react';

/** Decorative palm silhouettes for header corners — aria-hidden */
export const PalmCorners: React.FC = () => (
  <>
    <svg
      aria-hidden
      className="palm-corner palm-corner-left"
      viewBox="0 0 120 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M58 160 C54 110 50 70 48 40" stroke="var(--hh-cream)" strokeWidth="5" strokeLinecap="round" opacity="0.35" />
      <path d="M48 40 C30 28 12 22 2 18" stroke="var(--hh-cream)" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
      <path d="M48 40 C36 22 28 10 22 2" stroke="var(--hh-cream)" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
      <path d="M48 40 C58 18 62 8 64 0" stroke="var(--hh-cream)" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
      <path d="M48 40 C72 28 92 24 110 22" stroke="var(--hh-cream)" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
      <path d="M48 40 C70 38 95 42 118 48" stroke="var(--hh-cream)" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />
    </svg>
    <svg
      aria-hidden
      className="palm-corner palm-corner-right"
      viewBox="0 0 120 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M62 160 C66 110 70 70 72 40" stroke="var(--hh-cream)" strokeWidth="5" strokeLinecap="round" opacity="0.35" />
      <path d="M72 40 C90 28 108 22 118 18" stroke="var(--hh-cream)" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
      <path d="M72 40 C84 22 92 10 98 2" stroke="var(--hh-cream)" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
      <path d="M72 40 C62 18 58 8 56 0" stroke="var(--hh-cream)" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
      <path d="M72 40 C48 28 28 24 10 22" stroke="var(--hh-cream)" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
      <path d="M72 40 C50 38 25 42 2 48" stroke="var(--hh-cream)" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  </>
);
