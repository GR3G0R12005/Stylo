import type { OwnerRole } from '../components/owner/ownerTheme';

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface OwnerAppointment {
  id: string;
  clientName: string;
  clientAvatar: string;
  service: string;
  serviceId: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  price: number;
}

export interface OwnerService {
  id: string;
  name: string;
  price: number;
  duration: number;
  category: string;
  active: boolean;
}

export interface OwnerClient {
  id: string;
  name: string;
  avatar: string;
  visits: number;
  lastVisit: string;
  spent: number;
  rating: number;
  phone?: string;
}

export interface OwnerEmployee {
  id: string;
  name: string;
  role: string;
  avatar: string;
  todayCitas: number;
  rating: number;
  specialty: string;
  since: string;
  active: boolean;
}

export interface OwnerPromo {
  id: string;
  title: string;
  discount: string;
  code: string;
  expires: string;
  status: 'active' | 'scheduled' | 'expired';
  uses: number;
}

export interface OwnerReview {
  id: string;
  client: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  reply?: string;
}

export interface OwnerTransaction {
  id: string;
  client: string;
  service: string;
  amount: number;
  date: string;
  method: 'Efectivo' | 'Tarjeta' | 'Transferencia';
  type: 'in' | 'out';
}

export interface OwnerSettings {
  nombre?: string;
  telefono?: string;
  shopName: string;
  address: string;
  bio: string;
  openTime: string;
  closeTime: string;
  notifEmail: boolean;
  notifWhatsapp: boolean;
  notifSMS: boolean;
  profileImage?: string;  // Firebase Storage download URL
  coverImage?: string;    // Firebase Storage download URL
}

export interface BlockedSlot {
  reason: string;
  fromOnwards: boolean;
}

export type SlotMap = Record<string, Record<string, BlockedSlot | null>>;

export interface OwnerState {
  appointments: OwnerAppointment[];
  services: OwnerService[];
  clients: OwnerClient[];
  employees: OwnerEmployee[];
  promos: OwnerPromo[];
  reviews: OwnerReview[];
  transactions: OwnerTransaction[];
  settings: OwnerSettings;
  blockedSlots: SlotMap;
}

export function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return dateStr(d);
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function barberSeed(): OwnerState {
  const today = addDays(0);
  const tomorrow = addDays(1);
  const yesterday = addDays(-1);
  const twoDaysAgo = addDays(-2);

  return {
    appointments: [
      { id: '1', clientName: 'Carlos Méndez', clientAvatar: 'CM', service: 'Fade & Barba', serviceId: '1', date: today, time: '09:00', status: 'confirmed', price: 35 },
      { id: '2', clientName: 'Alejandro Ruiz', clientAvatar: 'AR', service: 'Corte Clásico', serviceId: '2', date: today, time: '10:30', status: 'pending', price: 25 },
      { id: '3', clientName: 'Miguel Torres', clientAvatar: 'MT', service: 'Tratamiento Capilar', serviceId: '3', date: today, time: '12:00', status: 'confirmed', price: 45 },
      { id: '4', clientName: 'Sebastián Mora', clientAvatar: 'SM', service: 'Barba Royale', serviceId: '4', date: today, time: '14:00', status: 'pending', price: 18 },
      { id: '5', clientName: 'Andrés Castillo', clientAvatar: 'AC', service: 'Fade & Barba', serviceId: '1', date: tomorrow, time: '09:30', status: 'pending', price: 35 },
      { id: '6', clientName: 'Luis Herrera', clientAvatar: 'LH', service: 'Corte Clásico', serviceId: '2', date: tomorrow, time: '11:00', status: 'confirmed', price: 25 },
      { id: '7', clientName: 'Ricardo Vega', clientAvatar: 'RV', service: 'Tratamiento Capilar', serviceId: '3', date: yesterday, time: '10:00', status: 'completed', price: 45 },
      { id: '8', clientName: 'Fernando López', clientAvatar: 'FL', service: 'Corte Clásico', serviceId: '2', date: twoDaysAgo, time: '15:00', status: 'cancelled', price: 25 },
    ],
    services: [
      { id: '1', name: 'Fade & Barba', price: 35, duration: 45, category: 'Premium', active: true },
      { id: '2', name: 'Corte Clásico', price: 25, duration: 30, category: 'Básico', active: true },
      { id: '3', name: 'Tratamiento Capilar', price: 45, duration: 60, category: 'Tratamiento', active: true },
      { id: '4', name: 'Barba Royale', price: 18, duration: 20, category: 'Básico', active: true },
    ],
    clients: [
      { id: '1', name: 'Carlos Méndez', avatar: 'CM', visits: 12, lastVisit: today, spent: 420, rating: 5, phone: '+1 809-555-0101' },
      { id: '2', name: 'Alejandro Ruiz', avatar: 'AR', visits: 8, lastVisit: today, spent: 280, rating: 4 },
      { id: '3', name: 'Miguel Torres', avatar: 'MT', visits: 5, lastVisit: yesterday, spent: 175, rating: 5 },
      { id: '4', name: 'Sebastián Mora', avatar: 'SM', visits: 3, lastVisit: addDays(-3), spent: 105, rating: 4 },
      { id: '5', name: 'Andrés Castillo', avatar: 'AC', visits: 15, lastVisit: addDays(-10), spent: 525, rating: 5 },
      { id: '6', name: 'Luis Herrera', avatar: 'LH', visits: 7, lastVisit: addDays(-15), spent: 245, rating: 4 },
    ],
    employees: [
      { id: '1', name: 'Ramón Díaz', role: 'Master Barber', avatar: 'RD', todayCitas: 5, rating: 4.9, specialty: 'Fades & Diseños', since: '2024-01', active: true },
      { id: '2', name: 'Jorge Silva', role: 'Barber Senior', avatar: 'JS', todayCitas: 4, rating: 4.7, specialty: 'Cortes Clásicos', since: '2024-06', active: true },
      { id: '3', name: 'David Rojas', role: 'Barber Jr.', avatar: 'DR', todayCitas: 3, rating: 4.5, specialty: 'Barba & Afeitado', since: '2025-02', active: true },
    ],
    promos: [
      { id: '1', title: 'Promo Fin de Semana', discount: '20% OFF', code: 'FIN20', expires: addDays(5), status: 'active', uses: 14 },
      { id: '2', title: 'Combo Corte + Barba', discount: '$10 OFF', code: 'COMBO10', expires: addDays(20), status: 'active', uses: 8 },
      { id: '3', title: 'Día del Padre', discount: '15% OFF', code: 'PADRE15', expires: addDays(45), status: 'scheduled', uses: 0 },
    ],
    reviews: [
      { id: '1', client: 'Carlos Méndez', avatar: 'CM', rating: 5, comment: 'Increíble trabajo, el mejor fade que me han hecho. Volveré sin duda.', date: 'Hace 2 días' },
      { id: '2', client: 'Alejandro Ruiz', avatar: 'AR', rating: 5, comment: 'Muy buen servicio, puntual y profesional.', date: 'Hace 4 días', reply: '¡Gracias Alejandro! Nos alegra que hayas quedado satisfecho.' },
      { id: '3', client: 'Miguel Torres', avatar: 'MT', rating: 4, comment: 'Buen corte, aunque esperé un poco. En general muy satisfecho.', date: 'Hace 1 semana' },
      { id: '4', client: 'Luis Herrera', avatar: 'LH', rating: 5, comment: 'El mejor barbero de la zona, sin comparación.', date: 'Hace 2 semanas', reply: '¡Muchas gracias Luis!' },
      { id: '5', client: 'Sebastián Mora', avatar: 'SM', rating: 3, comment: 'El corte estuvo bien pero el tiempo de espera fue largo.', date: 'Hace 3 semanas' },
    ],
    transactions: [
      { id: 't1', client: 'Carlos Méndez', service: 'Fade & Barba', amount: 35, date: `Hoy ${today}`, method: 'Efectivo', type: 'in' },
      { id: 't2', client: 'Alejandro Ruiz', service: 'Corte Clásico', amount: 25, date: 'Hoy', method: 'Transferencia', type: 'in' },
      { id: 't3', client: 'Proveedor', service: 'Suministros', amount: 80, date: 'Ayer', method: 'Transferencia', type: 'out' },
      { id: 't4', client: 'Ricardo Vega', service: 'Tratamiento Capilar', amount: 45, date: 'Ayer', method: 'Tarjeta', type: 'in' },
    ],
    settings: {
      shopName: 'The Royal Barber',
      address: 'Calle Mayor 12, Centro',
      bio: 'Estilo clásico y moderno para el caballero exigente.',
      openTime: '09:00',
      closeTime: '20:00',
      notifEmail: true,
      notifWhatsapp: true,
      notifSMS: false,
    },
    blockedSlots: {},
  };
}

function salonSeed(): OwnerState {
  const today = addDays(0);
  const tomorrow = addDays(1);
  const yesterday = addDays(-1);
  const twoDaysAgo = addDays(-2);

  return {
    appointments: [
      { id: '1', clientName: 'Elena García', clientAvatar: 'EG', service: 'Color & Hidratación', serviceId: '1', date: today, time: '09:00', status: 'confirmed', price: 85 },
      { id: '2', clientName: 'Sofía Martínez', clientAvatar: 'SM', service: 'Manicura Spa', serviceId: '2', date: today, time: '11:00', status: 'pending', price: 45 },
      { id: '3', clientName: 'Lorena Ruiz', clientAvatar: 'LR', service: 'Corte Mariposa', serviceId: '3', date: today, time: '13:30', status: 'confirmed', price: 60 },
      { id: '4', clientName: 'Valentina Cruz', clientAvatar: 'VC', service: 'Keratina Express', serviceId: '4', date: today, time: '15:00', status: 'pending', price: 95 },
      { id: '5', clientName: 'Gabriela Pérez', clientAvatar: 'GP', service: 'Color & Hidratación', serviceId: '1', date: tomorrow, time: '10:00', status: 'pending', price: 85 },
      { id: '6', clientName: 'Isabella Mora', clientAvatar: 'IM', service: 'Manicura Spa', serviceId: '2', date: tomorrow, time: '12:00', status: 'confirmed', price: 45 },
      { id: '7', clientName: 'Daniela Ríos', clientAvatar: 'DR', service: 'Keratina Express', serviceId: '4', date: yesterday, time: '14:00', status: 'completed', price: 95 },
      { id: '8', clientName: 'Camila Vargas', clientAvatar: 'CV', service: 'Corte Mariposa', serviceId: '3', date: twoDaysAgo, time: '09:00', status: 'cancelled', price: 60 },
    ],
    services: [
      { id: '1', name: 'Color & Hidratación', price: 85, duration: 120, category: 'Color', active: true },
      { id: '2', name: 'Manicura Spa', price: 45, duration: 60, category: 'Uñas', active: true },
      { id: '3', name: 'Corte Mariposa', price: 60, duration: 45, category: 'Corte', active: true },
      { id: '4', name: 'Keratina Express', price: 95, duration: 90, category: 'Tratamiento', active: true },
    ],
    clients: [
      { id: '1', name: 'Elena García', avatar: 'EG', visits: 14, lastVisit: today, spent: 1190, rating: 5 },
      { id: '2', name: 'Sofía Martínez', avatar: 'SM', visits: 9, lastVisit: today, spent: 630, rating: 5 },
      { id: '3', name: 'Lorena Ruiz', avatar: 'LR', visits: 6, lastVisit: addDays(-3), spent: 420, rating: 4 },
      { id: '4', name: 'Valentina Cruz', avatar: 'VC', visits: 4, lastVisit: addDays(-5), spent: 380, rating: 5 },
      { id: '5', name: 'Gabriela Pérez', avatar: 'GP', visits: 11, lastVisit: addDays(-12), spent: 935, rating: 4 },
      { id: '6', name: 'Isabella Mora', avatar: 'IM', visits: 8, lastVisit: addDays(-18), spent: 680, rating: 5 },
    ],
    employees: [
      { id: '1', name: 'María Fernández', role: 'Estilista Senior', avatar: 'MF', todayCitas: 4, rating: 5.0, specialty: 'Color & Mechas', since: '2023-11', active: true },
      { id: '2', name: 'Paola Gómez', role: 'Colorista', avatar: 'PG', todayCitas: 3, rating: 4.8, specialty: 'Colorimetría', since: '2024-03', active: true },
      { id: '3', name: 'Diana Torres', role: 'Manicurista', avatar: 'DT', todayCitas: 5, rating: 4.6, specialty: 'Nail Art & Spa', since: '2025-01', active: true },
    ],
    promos: [
      { id: '1', title: 'Semana de la Belleza', discount: '25% OFF', code: 'BELLEZA25', expires: addDays(7), status: 'active', uses: 22 },
      { id: '2', title: 'Combo Mani + Pedi', discount: '$15 OFF', code: 'MANIPEDI', expires: addDays(30), status: 'active', uses: 11 },
    ],
    reviews: [
      { id: '1', client: 'Elena García', avatar: 'EG', rating: 5, comment: 'El mejor salón de la ciudad. El color quedó exactamente como quería.', date: 'Hace 1 día' },
      { id: '2', client: 'Sofía Martínez', avatar: 'SM', rating: 5, comment: 'Manicura perfecta, un servicio de lujo a buen precio.', date: 'Hace 3 días', reply: '¡Gracias Sofía! Te esperamos pronto.' },
      { id: '3', client: 'Lorena Ruiz', avatar: 'LR', rating: 4, comment: 'Muy buen servicio, el corte quedó hermoso.', date: 'Hace 5 días' },
    ],
    transactions: [
      { id: 't1', client: 'Elena García', service: 'Color & Hidratación', amount: 85, date: 'Hoy', method: 'Tarjeta', type: 'in' },
      { id: 't2', client: 'Sofía Martínez', service: 'Manicura Spa', amount: 45, date: 'Hoy', method: 'Transferencia', type: 'in' },
      { id: 't3', client: 'Proveedor', service: 'Productos capilares', amount: 120, date: 'Ayer', method: 'Transferencia', type: 'out' },
    ],
    settings: {
      shopName: 'Aura Beauty Studio',
      address: 'Av. Libertad 45',
      bio: 'Especialistas en color, estilismo y cuidado capilar avanzado.',
      openTime: '09:00',
      closeTime: '20:00',
      notifEmail: true,
      notifWhatsapp: true,
      notifSMS: false,
    },
    blockedSlots: {},
  };
}

export function getOwnerSeed(role: OwnerRole): OwnerState {
  return role === 'barbero' ? barberSeed() : salonSeed();
}

export const STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

export const STATUS_COLORS: Record<AppointmentStatus, { bg: string; text: string }> = {
  pending: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
  confirmed: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e' },
  completed: { bg: 'rgba(99,102,241,0.15)', text: '#6366f1' },
  cancelled: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' },
};
