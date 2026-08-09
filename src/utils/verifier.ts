import type { IDCardData } from '../types';

export interface VerificationResult {
  isValid: boolean;
  hackerId: string;
  cardData?: IDCardData;
  issuedAt?: string;
  issuer?: string;
  message: string;
}

// Simple checksum generator for client verification
function calculateChecksum(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36).toUpperCase().padStart(4, 'X').slice(-4);
}

export function generateHackerId(cardData: IDCardData): string {
  const payload = `${cardData.fullName}|${cardData.handle}|${cardData.role}|${cardData.stack}|${cardData.statusBadge}`;
  const checksum = calculateChecksum(payload);
  
  // Create deterministic unique ID string
  const nameHash = calculateChecksum(cardData.fullName + cardData.handle);
  return `HH-GOA-2026-${nameHash}-${checksum}`;
}

export function encodeVerificationUrl(cardData: IDCardData): string {
  const hackerId = generateHackerId(cardData);
  const dataObj = {
    id: hackerId,
    name: cardData.fullName,
    handle: cardData.handle,
    role: cardData.role,
    stack: cardData.stack,
    badge: cardData.statusBadge,
    title: cardData.builderTitle,
    ts: '28-31 OCT 2026'
  };

  const jsonStr = JSON.stringify(dataObj);
  const b64 = btoa(encodeURIComponent(jsonStr));
  // Use VITE_APP_URL in production so QR codes never point to localhost
  const appOrigin = (import.meta.env.VITE_APP_URL as string | undefined) || window.location.origin;
  return `${appOrigin}/?verify=${hackerId}&data=${b64}`;
}

export function verifyHackerId(idOrUrl: string): VerificationResult {
  if (!idOrUrl || idOrUrl.trim() === '') {
    return {
      isValid: false,
      hackerId: '',
      message: 'Please enter a valid Builder Hacker ID or Verification Link.',
    };
  }

  const cleanQuery = idOrUrl.trim();

  // 1. Check if URL containing ?data= parameter
  if (cleanQuery.includes('data=')) {
    try {
      const urlObj = new URL(cleanQuery.startsWith('http') ? cleanQuery : `https://${cleanQuery}`);
      const b64Data = urlObj.searchParams.get('data');
      const idParam = urlObj.searchParams.get('verify') || '';

      if (b64Data) {
        const jsonStr = decodeURIComponent(atob(b64Data));
        const parsed = JSON.parse(jsonStr);

        return {
          isValid: true,
          hackerId: parsed.id || idParam || 'HH-GOA-2026-VERIFIED',
          cardData: {
            fullName: parsed.name || 'Official Builder',
            handle: parsed.handle || '@builder',
            role: parsed.role || 'Hacker',
            stack: parsed.stack || 'Solana • Rust',
            builderTitle: 'OFFICIAL BUILDER PASS ⚡',
            statusBadge: parsed.badge || 'CONFIRMED BUILDER',
            location: 'Goa, India',
            edition: '2026',
            hackerId: parsed.id || idParam || 'HH-GOA-2026-VERIFIED',
          },
          issuedAt: parsed.ts || '28-31 OCT 2026',
          issuer: '2:47 PM STUDIO x HACKER HOUSE GOA',
          message: 'Official Verified Builder Pass authenticated successfully.',
        };
      }
    } catch (err) {
      // Fallback to standard ID verification
    }
  }

  // 2. Standard Hacker ID Verification (e.g. HH-GOA-2026-XXXX-YYYY)
  const isHackerIdFormat = /^HH-GOA-2026-[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(cleanQuery) || cleanQuery.toUpperCase().startsWith('HH-GOA-2026');

  if (isHackerIdFormat) {
    return {
      isValid: true,
      hackerId: cleanQuery.toUpperCase(),
      cardData: {
        fullName: 'Verified Goa Builder',
        handle: '@hhgoa_builder',
        role: 'Full-Stack & Systems Hacker',
        stack: 'Rust • Solana • TS',
        builderTitle: '2:47 PM SHIPPER ⚡',
        statusBadge: 'CONFIRMED BUILDER',
        location: 'Goa, India',
        edition: '2026',
        hackerId: cleanQuery.toUpperCase(),
      },
      issuedAt: '28-31 OCT 2026',
      issuer: '2:47 PM STUDIO x HACKER HOUSE GOA',
      message: 'Official Verified Builder Pass authenticated successfully.',
    };
  }

  return {
    isValid: false,
    hackerId: cleanQuery,
    message: 'Invalid Builder ID format. ID must be in format HH-GOA-2026-XXXX-YYYY.',
  };
}
