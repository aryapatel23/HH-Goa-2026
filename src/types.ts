export type Mode = 'pfp' | 'idcard' | 'story';

export type Theme = 'hhgoa' | 'neon-shore' | 'emerald' | 'sunset' | 'cyber';

export interface ThemeColors {
  bg: string;
  bgDeep: string;
  bgCard: string;
  primary: string;
  coral: string;
  teal: string;
  label: string;
  emoji: string;
}

export const THEMES: Record<Theme, ThemeColors> = {
  'hhgoa': {
    bg: '#0B3D2A', bgDeep: '#06231A', bgCard: 'rgba(16,73,47,0.92)',
    primary: '#F5D505', coral: '#F0127A', teal: '#FBF7E9',
    label: 'HH GOA', emoji: '🌴',
  },
  'neon-shore': {
    bg: '#050d1f', bgDeep: '#030810', bgCard: 'rgba(8,18,40,0.92)',
    primary: '#ffcc00', coral: '#ff4d00', teal: '#00d4c8',
    label: 'Neon Shore', emoji: '🌊',
  },
  'emerald': {
    bg: '#043e24', bgDeep: '#022917', bgCard: 'rgba(3,52,30,0.85)',
    primary: '#ffe500', coral: '#ff007f', teal: '#00f0ff',
    label: 'Emerald Studio', emoji: '🌿',
  },
  'sunset': {
    bg: '#150800', bgDeep: '#0d0400', bgCard: 'rgba(28,10,0,0.90)',
    primary: '#ff8c00', coral: '#ff3d00', teal: '#ffcc00',
    label: 'Sunset Goa', emoji: '🌅',
  },
  'cyber': {
    bg: '#000000', bgDeep: '#000000', bgCard: 'rgba(3,3,18,0.92)',
    primary: '#00ffcc', coral: '#ff00ff', teal: '#00ccff',
    label: 'Cyber Night', emoji: '💜',
  },
};

export type CornerStyle = 'square' | 'rounded' | 'bevel';

export interface PhotoAdjustments {
  zoom: number; // 0.5 to 3.0
  panX: number; // offset in px
  panY: number; // offset in px
  rotation: number; // 0, 90, 180, 270
  filter: 'none' | 'cyber' | 'sunset' | 'crisp' | 'vintage' | 'mono' | 'dramatic';
  brightness: number; // 50 to 150
  contrast: number; // 50 to 150
  saturation: number; // 0 to 200
  customColor?: string;
  scanlinesEnabled?: boolean;
}

export type FrameTemplateId = 'studio-emerald' | 'neon-sunset' | 'hacker-cyber' | 'coastal-wave' | 'retro-synth' | 'gold-builder' | 'minimal-tech';

export interface FrameTemplate {
  id: FrameTemplateId;
  name: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  badgeLabel: string;
}

export type IDCardStyleId = 'classic-dark' | 'editorial-light' | 'terminal-hacker' | 'magazine-cover' | 'goa-resort' | 'sunset-beach';

export interface IDCardStyle {
  id: IDCardStyleId;
  name: string;
  bgGradient: string[];
  textColor: string;
  accentColor: string;
  cardBorder: string;
  headerTitle: string;
}

export interface IDCardData {
  fullName: string;
  handle: string;
  role: string;
  stack: string;
  builderTitle: string;
  statusBadge: 'SHORTLISTED' | 'CONFIRMED BUILDER' | 'VIP HACKER' | 'SPEAKER' | 'ORGANIZER' | 'GOA NOMAD';
  location: string;
  edition: string;
  hackerId: string;
}

export type StickerId = 'goa-hacker' | '0xbuilder' | 'solana-heart' | 'beach-mode' | 'ship-it' | 'vip-pass';

export interface StickerBadge {
  id: StickerId;
  label: string;
  bg: string;
  textColor: string;
  borderColor: string;
}
