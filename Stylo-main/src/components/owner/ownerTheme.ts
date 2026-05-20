export type OwnerRole = 'barbero' | 'salonera';

export interface OwnerTheme {
  role: OwnerRole;
  accent: string;
  accentLight: string;
  accentMid: string;
  bg: string;
  cardBg: string;
  sidebar: string;
  sidebarBorder: string;
  border: string;
  text: string;
  textMuted: string;
  textSecondary: string;
  isDark: boolean;
  headerBg: string;
  badge: string;
  badgeText: string;
  inputBg: string;
}

export interface PaletteDef {
  id: string;
  name: string;
  accent: string;
  accentLight: string;
  accentMid: string;
  badge: string;
}

export const BARBER_PALETTES: PaletteDef[] = [
  { id: 'gold', name: 'Dorado Clásico', accent: '#D4AF37', accentLight: 'rgba(212,175,55,0.12)', accentMid: 'rgba(212,175,55,0.25)', badge: 'rgba(212,175,55,0.18)' },
  { id: 'steel', name: 'Azul Acero', accent: '#60A5FA', accentLight: 'rgba(96,165,250,0.12)', accentMid: 'rgba(96,165,250,0.25)', badge: 'rgba(96,165,250,0.18)' },
  { id: 'emerald', name: 'Esmeralda', accent: '#34D399', accentLight: 'rgba(52,211,153,0.12)', accentMid: 'rgba(52,211,153,0.25)', badge: 'rgba(52,211,153,0.18)' },
];

export const SALON_PALETTES: PaletteDef[] = [
  { id: 'rose', name: 'Rosa Pastel', accent: '#EC4899', accentLight: 'rgba(236,72,153,0.08)', accentMid: 'rgba(236,72,153,0.18)', badge: '#FCE7F3' },
  { id: 'lavender', name: 'Lavanda', accent: '#8B5CF6', accentLight: 'rgba(139,92,246,0.08)', accentMid: 'rgba(139,92,246,0.18)', badge: '#EDE9FE' },
  { id: 'mint', name: 'Menta', accent: '#14B8A6', accentLight: 'rgba(20,184,166,0.08)', accentMid: 'rgba(20,184,166,0.18)', badge: '#CCFBF1' },
];

export function getTheme(role: OwnerRole, paletteId?: string): OwnerTheme {
  if (role === 'barbero') {
    const pal = BARBER_PALETTES.find(p => p.id === paletteId) || BARBER_PALETTES[0];
    return {
      role,
      accent: pal.accent,
      accentLight: pal.accentLight,
      accentMid: pal.accentMid,
      bg: '#0A0A0A',
      cardBg: 'rgba(255,255,255,0.04)',
      sidebar: '#0F0F0F',
      sidebarBorder: 'rgba(255,255,255,0.06)',
      border: 'rgba(255,255,255,0.08)',
      text: '#FFFFFF',
      textMuted: '#52525b',
      textSecondary: '#a1a1aa',
      isDark: true,
      headerBg: 'rgba(10,10,10,0.92)',
      badge: pal.badge,
      badgeText: pal.accent,
      inputBg: 'rgba(255,255,255,0.06)',
    };
  } else {
    const pal = SALON_PALETTES.find(p => p.id === paletteId) || SALON_PALETTES[0];
    // Ajustar el fondo del sidebar dinámicamente basándose en el acento
    const isRose = pal.id === 'rose';
    const isLav = pal.id === 'lavender';
    
    return {
      role,
      accent: pal.accent,
      accentLight: pal.accentLight,
      accentMid: pal.accentMid,
      bg: '#FAFAFA',
      cardBg: '#FFFFFF',
      sidebar: isRose ? '#FFF0F5' : isLav ? '#F5F3FF' : '#F0FDFA',
      sidebarBorder: isRose ? '#FCE7F3' : isLav ? '#EDE9FE' : '#CCFBF1',
      border: isRose ? '#F0D6E4' : isLav ? '#DDD6FE' : '#99F6E4',
      text: '#111827',
      textMuted: '#9CA3AF',
      textSecondary: '#6B7280',
      isDark: false,
      headerBg: 'rgba(250,250,250,0.92)',
      badge: pal.badge,
      badgeText: pal.accent,
      inputBg: isRose ? '#FFF5F8' : isLav ? '#FAF5FF' : '#F0FDFA',
    };
  }
}

// Mock shared data
export const mockAppointments = [
  { id: '1', clientName: 'Carlos Méndez',    clientAvatar: 'CM', service: 'Fade & Barba',          date: '2026-05-14', time: '09:00', status: 'confirmed' as const, price: 35 },
  { id: '2', clientName: 'Alejandro Ruiz',   clientAvatar: 'AR', service: 'Corte Clásico',          date: '2026-05-14', time: '10:30', status: 'pending'   as const, price: 25 },
  { id: '3', clientName: 'Miguel Torres',    clientAvatar: 'MT', service: 'Tratamiento Capilar',    date: '2026-05-14', time: '12:00', status: 'confirmed' as const, price: 45 },
  { id: '4', clientName: 'Sebastián Mora',   clientAvatar: 'SM', service: 'Barba Royale',           date: '2026-05-14', time: '14:00', status: 'pending'   as const, price: 18 },
  { id: '5', clientName: 'Andrés Castillo',  clientAvatar: 'AC', service: 'Fade & Barba',          date: '2026-05-15', time: '09:30', status: 'pending'   as const, price: 35 },
  { id: '6', clientName: 'Luis Herrera',     clientAvatar: 'LH', service: 'Corte Clásico',          date: '2026-05-15', time: '11:00', status: 'confirmed' as const, price: 25 },
  { id: '7', clientName: 'Ricardo Vega',     clientAvatar: 'RV', service: 'Tratamiento Capilar',    date: '2026-05-13', time: '10:00', status: 'completed' as const, price: 45 },
  { id: '8', clientName: 'Fernando López',   clientAvatar: 'FL', service: 'Corte Clásico',          date: '2026-05-12', time: '15:00', status: 'cancelled' as const, price: 25 },
];

export const mockSalonAppointments = [
  { id: '1', clientName: 'Elena García',    clientAvatar: 'EG', service: 'Color & Hidratación',  date: '2026-05-14', time: '09:00', status: 'confirmed' as const, price: 85 },
  { id: '2', clientName: 'Sofía Martínez',  clientAvatar: 'SM', service: 'Manicura Spa',          date: '2026-05-14', time: '11:00', status: 'pending'   as const, price: 45 },
  { id: '3', clientName: 'Lorena Ruiz',     clientAvatar: 'LR', service: 'Corte Mariposa',        date: '2026-05-14', time: '13:30', status: 'confirmed' as const, price: 60 },
  { id: '4', clientName: 'Valentina Cruz',  clientAvatar: 'VC', service: 'Keratina Express',      date: '2026-05-14', time: '15:00', status: 'pending'   as const, price: 95 },
  { id: '5', clientName: 'Gabriela Pérez',  clientAvatar: 'GP', service: 'Color & Hidratación',  date: '2026-05-15', time: '10:00', status: 'pending'   as const, price: 85 },
  { id: '6', clientName: 'Isabella Mora',   clientAvatar: 'IM', service: 'Manicura Spa',          date: '2026-05-15', time: '12:00', status: 'confirmed' as const, price: 45 },
  { id: '7', clientName: 'Daniela Ríos',    clientAvatar: 'DR', service: 'Keratina Express',      date: '2026-05-13', time: '14:00', status: 'completed' as const, price: 95 },
  { id: '8', clientName: 'Camila Vargas',   clientAvatar: 'CV', service: 'Corte Mariposa',        date: '2026-05-12', time: '09:00', status: 'cancelled' as const, price: 60 },
];
