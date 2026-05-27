import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { OwnerRole } from '../components/owner/ownerTheme';
import {
  addDays,
  dateStr,
  getOwnerSeed,
  initials,
  type AppointmentStatus,
  type BlockedSlot,
  type OwnerAppointment,
  type OwnerClient,
  type OwnerEmployee,
  type OwnerPromo,
  type OwnerReview,
  type OwnerService,
  type OwnerSettings,
  type OwnerState,
  type OwnerTransaction,
  type SlotMap,
} from '../data/ownerSeed';
import { useToast } from '../components/owner/ui/Toast';

interface OwnerDataContextValue extends OwnerState {
  role: OwnerRole;
  today: string;
  pendingCount: number;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  addAppointment: (appt: Omit<OwnerAppointment, 'id'>) => void;
  addService: (service: Omit<OwnerService, 'id' | 'active'>) => void;
  updateService: (id: string, patch: Partial<OwnerService>) => void;
  toggleServiceActive: (id: string) => void;
  addPromo: (promo: Omit<OwnerPromo, 'id' | 'uses' | 'status'>) => void;
  deletePromo: (id: string) => void;
  replyReview: (id: string, reply: string) => void;
  addTransaction: (tx: Omit<OwnerTransaction, 'id'>) => void;
  saveSettings: (settings: OwnerSettings) => void;
  setBlockedSlots: (slots: SlotMap) => void;
  blockSlot: (day: string, hour: string, slot: BlockedSlot, blockOnwards?: boolean, hours?: string[]) => void;
  unblockSlot: (day: string, hour: string) => void;
  getAppointmentsForDate: (date: string) => OwnerAppointment[];
  getServiceRequests: (serviceId: string) => OwnerAppointment[];
  resetData: () => void;
}

const OwnerDataContext = createContext<OwnerDataContextValue | null>(null);

function loadState(key: string, role: OwnerRole): OwnerState {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as OwnerState;
  } catch {
    /* use seed */
  }
  return getOwnerSeed(role);
}

function promoStatus(expires: string): OwnerPromo['status'] {
  const exp = new Date(expires);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (exp < now) return 'expired';
  if (exp.getTime() - now.getTime() > 7 * 86400000) return 'scheduled';
  return 'active';
}

export function OwnerDataProvider({
  role,
  children,
}: {
  role: OwnerRole;
  children: React.ReactNode;
}) {
  const storageKey = `steylook_owner_${role}`;
  const { toast } = useToast();
  const [state, setState] = useState<OwnerState>(() => loadState(storageKey, role));
  const today = dateStr(new Date());

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  const pendingCount = useMemo(
    () => state.appointments.filter((a) => a.status === 'pending').length,
    [state.appointments],
  );

  const updateAppointmentStatus = useCallback(
    (id: string, status: AppointmentStatus) => {
      setState((prev) => {
        const appt = prev.appointments.find((a) => a.id === id);
        if (!appt) return prev;

        let transactions = prev.transactions;
        if (status === 'completed' && appt.status !== 'completed') {
          transactions = [
            {
              id: `tx-${Date.now()}`,
              client: appt.clientName,
              service: appt.service,
              amount: appt.price,
              date: 'Hoy',
              method: 'Efectivo',
              type: 'in',
            },
            ...transactions,
          ];
        }

        const appointments = prev.appointments.map((a) =>
          a.id === id ? { ...a, status } : a,
        );

        return { ...prev, appointments, transactions };
      });

      const labels: Record<AppointmentStatus, string> = {
        pending: 'marcada como pendiente',
        confirmed: 'confirmada',
        completed: 'completada',
        cancelled: 'cancelada',
      };
      toast(`Cita ${labels[status]}`, status === 'cancelled' ? 'info' : 'success');
    },
    [toast],
  );

  const addAppointment = useCallback((appt: Omit<OwnerAppointment, 'id'>) => {
    setState((prev) => ({
      ...prev,
      appointments: [
        ...prev.appointments,
        { ...appt, id: `ap-${Date.now()}`, clientAvatar: appt.clientAvatar || initials(appt.clientName) },
      ],
    }));
    toast('Cita creada correctamente');
  }, [toast]);

  const addService = useCallback((service: Omit<OwnerService, 'id' | 'active'>) => {
    setState((prev) => ({
      ...prev,
      services: [...prev.services, { ...service, id: `sv-${Date.now()}`, active: true }],
    }));
    toast('Servicio añadido al catálogo');
  }, [toast]);

  const updateService = useCallback((id: string, patch: Partial<OwnerService>) => {
    setState((prev) => ({
      ...prev,
      services: prev.services.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
    toast('Servicio actualizado');
  }, [toast]);

  const toggleServiceActive = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      services: prev.services.map((s) =>
        s.id === id ? { ...s, active: !s.active } : s,
      ),
    }));
  }, []);

  const addPromo = useCallback((promo: Omit<OwnerPromo, 'id' | 'uses' | 'status'>) => {
    const status = promoStatus(promo.expires);
    setState((prev) => ({
      ...prev,
      promos: [
        { ...promo, id: `pr-${Date.now()}`, uses: 0, status },
        ...prev.promos,
      ],
    }));
    toast('Promoción creada');
  }, [toast]);

  const deletePromo = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      promos: prev.promos.filter((p) => p.id !== id),
    }));
    toast('Promoción eliminada', 'info');
  }, [toast]);

  const replyReview = useCallback((id: string, reply: string) => {
    setState((prev) => ({
      ...prev,
      reviews: prev.reviews.map((r) => (r.id === id ? { ...r, reply } : r)),
    }));
    toast('Respuesta publicada');
  }, [toast]);

  const addTransaction = useCallback((tx: Omit<OwnerTransaction, 'id'>) => {
    setState((prev) => ({
      ...prev,
      transactions: [{ ...tx, id: `tx-${Date.now()}` }, ...prev.transactions],
    }));
    toast(tx.type === 'in' ? 'Ingreso registrado' : 'Gasto registrado');
  }, [toast]);

  const saveSettings = useCallback((settings: OwnerSettings) => {
    setState((prev) => ({ ...prev, settings }));
    toast('Configuración guardada');
  }, [toast]);

  const setBlockedSlots = useCallback((blockedSlots: SlotMap) => {
    setState((prev) => ({ ...prev, blockedSlots }));
  }, []);

  const blockSlot = useCallback(
    (day: string, hour: string, slot: BlockedSlot, blockOnwards?: boolean, hours?: string[]) => {
      setState((prev) => {
        const next: SlotMap = { ...prev.blockedSlots, [day]: { ...prev.blockedSlots[day] } };
        if (blockOnwards && hours) {
          const idx = hours.indexOf(hour);
          hours.slice(idx).forEach((h) => {
            next[day][h] = { reason: slot.reason, fromOnwards: h === hour };
          });
        } else {
          next[day][hour] = slot;
        }
        return { ...prev, blockedSlots: next };
      });
      toast('Horario bloqueado');
    },
    [toast],
  );

  const unblockSlot = useCallback((day: string, hour: string) => {
    setState((prev) => {
      const next: SlotMap = { ...prev.blockedSlots, [day]: { ...prev.blockedSlots[day] } };
      delete next[day][hour];
      return { ...prev, blockedSlots: next };
    });
    toast('Horario liberado', 'info');
  }, [toast]);

  const getAppointmentsForDate = useCallback(
    (date: string) => state.appointments.filter((a) => a.date === date),
    [state.appointments],
  );

  const getServiceRequests = useCallback(
    (serviceId: string) =>
      state.appointments.filter(
        (a) => a.serviceId === serviceId && a.status === 'pending',
      ),
    [state.appointments],
  );

  const resetData = useCallback(() => {
    const seed = getOwnerSeed(role);
    setState(seed);
    localStorage.removeItem(storageKey);
    toast('Datos restaurados', 'info');
  }, [role, storageKey, toast]);

  const value = useMemo<OwnerDataContextValue>(
    () => ({
      ...state,
      role,
      today,
      pendingCount,
      updateAppointmentStatus,
      addAppointment,
      addService,
      updateService,
      toggleServiceActive,
      addPromo,
      deletePromo,
      replyReview,
      addTransaction,
      saveSettings,
      setBlockedSlots,
      blockSlot,
      unblockSlot,
      getAppointmentsForDate,
      getServiceRequests,
      resetData,
    }),
    [
      state,
      role,
      today,
      pendingCount,
      updateAppointmentStatus,
      addAppointment,
      addService,
      updateService,
      toggleServiceActive,
      addPromo,
      deletePromo,
      replyReview,
      addTransaction,
      saveSettings,
      setBlockedSlots,
      blockSlot,
      unblockSlot,
      getAppointmentsForDate,
      getServiceRequests,
      resetData,
    ],
  );

  return (
    <OwnerDataContext.Provider value={value}>{children}</OwnerDataContext.Provider>
  );
}

export function useOwnerData() {
  const ctx = useContext(OwnerDataContext);
  if (!ctx) throw new Error('useOwnerData must be used within OwnerDataProvider');
  return ctx;
}

export { addDays };
