export type UserRole = 'cliente' | 'barbero' | 'salonera';

export function getRolePath(role: UserRole | string): string {
  if (role === 'barbero') return '/barbero';
  if (role === 'salonera') return '/salon';
  return '/cliente';
}

export function parseRole(param: string | null): UserRole {
  if (param === 'barbero' || param === 'salonera') return param;
  return 'cliente';
}

export function roleLabel(role: UserRole): string {
  if (role === 'salonera') return 'Estilista';
  if (role === 'barbero') return 'Barbero';
  return 'Cliente';
}
