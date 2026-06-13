import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export type UserRole = 'cliente' | 'barbero' | 'salonera';

export async function fetchUserRole(uid: string): Promise<UserRole | null> {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) return null;
  const tipo = userDoc.data().tipo;
  if (tipo === 'barbero' || tipo === 'salonera' || tipo === 'cliente') return tipo;
  return null;
}

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
