import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { OwnerRole } from '../components/owner/ownerTheme';
import {
  addDays,
  dateStr,
  getOwnerSeed,
  initials,
  normalizeEmployee,
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
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc, collection, query, where, onSnapshot, updateDoc, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface OwnerDataContextValue extends OwnerState {
  role: OwnerRole;
  today: string;
  pendingCount: number;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  addAppointment: (appt: Omit<OwnerAppointment, 'id'>) => void;
  addService: (service: Omit<OwnerService, 'id' | 'active'>) => void;
  updateService: (id: string, patch: Partial<OwnerService>) => void;
  toggleServiceActive: (id: string) => void;
  addEmployee: (employee: Omit<OwnerEmployee, 'id' | 'avatar' | 'todayCitas' | 'rating' | 'since' | 'active'> & { name: string }) => void;
  updateEmployee: (id: string, patch: Partial<OwnerEmployee>) => void;
  toggleEmployeeActive: (id: string) => void;
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
    if (raw) {
      const parsed = JSON.parse(raw) as OwnerState;
      return {
        ...parsed,
        employees: (parsed.employees ?? []).map((e) => normalizeEmployee(e)),
      };
    }
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

function sanitizeFirestoreData(obj: any): any {
  if (obj === undefined) return null;
  if (obj === null) return null;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeFirestoreData);
  }
  if (typeof obj === 'object') {
    const clean: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        if (value !== undefined) {
          clean[key] = sanitizeFirestoreData(value);
        }
      }
    }
    return clean;
  }
  return obj;
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

  // Auxiliar para sincronizar datos del negocio en Firestore
  const syncShopToFirestore = useCallback(async (
    newSettings: OwnerSettings,
    newServices: OwnerService[],
    newPromos: OwnerPromo[]
  ) => {
    if (!auth.currentUser) return;
    try {
      const shopRef = doc(db, 'shops', auth.currentUser.uid);
      const rawData = {
        name: newSettings.shopName,
        address: newSettings.address,
        description: newSettings.bio || '',
        bio: newSettings.bio || '',
        phone: newSettings.telefono || '',
        photo: newSettings.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(newSettings.shopName)}&background=random`,
        coverImage: newSettings.coverImage || '',
        type: role === 'barbero' ? 'barberia' : 'salon',
        priceRange: 2,
        categories: Array.from(new Set(newServices.filter(s => s.active).map(s => s.category))),
        isPublic: newSettings.isPublic ?? false,
        settings: newSettings,
        services: newServices,
        promos: newPromos,
      };
      const cleanData = sanitizeFirestoreData(rawData);
      await setDoc(shopRef, cleanData, { merge: true });
    } catch (err) {
      console.error("Error syncing shop to Firestore:", err);
    }
  }, [role]);

  // Cargar datos reales desde Firestore al iniciar sesión
  useEffect(() => {
    const fetchFirestoreShop = async () => {
      if (!auth.currentUser) return;
      try {
        const docRef = doc(db, 'shops', auth.currentUser.uid);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setState((prev) => ({
            ...prev,
            services: data.services || prev.services,
            promos: data.promos || prev.promos,
            settings: {
              ...prev.settings,
              ...(data.settings || {}),
              shopName: data.name || prev.settings.shopName,
              address: data.address || prev.settings.address,
              bio: data.bio || prev.settings.bio,
              profileImage: data.photo || prev.settings.profileImage,
              coverImage: data.coverImage || prev.settings.coverImage,
              telefono: data.phone || prev.settings.telefono,
              isPublic: data.isPublic ?? data.settings?.isPublic ?? false,
            }
          }));
        }
      } catch (err) {
        console.error("Error loading shop from Firestore:", err);
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchFirestoreShop();
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Real-time Firestore listener for incoming client appointments
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // Clean up previous listener if user changes
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }
      if (!user) return;

      const shopId = user.uid;
      const q = query(
        collection(db, 'appointments'),
        where('shopId', '==', shopId),
        orderBy('createdAt', 'desc'),
      );

      // Track ids we already know about to detect NEW ones
      let knownIds: Set<string> | null = null;

      unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        const firestoreAppts = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            clientName: data.clientName || 'Cliente',
            clientAvatar: (data.clientName || 'C').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
            service: data.serviceName || '',
            serviceId: data.serviceId || '',
            date: data.date ? new Date(data.date).toISOString().slice(0, 10) : '',
            time: data.time || '10:00',
            status: data.status || 'pending',
            price: data.price || 0,
            firestoreId: d.id,
            clientId: data.clientId || '',
          } as OwnerAppointment & { firestoreId: string; clientId: string };
        });

        // Notify about newly arrived bookings
        if (knownIds !== null) {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const data = change.doc.data();
              if (!knownIds!.has(change.doc.id)) {
                toast(`📅 Nueva cita de ${data.clientName || 'cliente'} — ${data.serviceName || ''}`, 'success');
              }
            }
          });
        }

        knownIds = new Set(snapshot.docs.map((d) => d.id));

        if (firestoreAppts.length > 0) {
          setState((prev) => {
            const firestoreIds = new Set(firestoreAppts.map((a) => a.id));
            const localOnly = prev.appointments.filter((a) => !firestoreIds.has(a.id) && !a.id.startsWith('ap-'));
            return { ...prev, appointments: [...firestoreAppts, ...localOnly] };
          });
        }
      }, (err) => {
        console.error('Error listening to Firestore appointments:', err);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [toast]); // eslint-disable-line react-hooks/exhaustive-deps

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

      // Sync to Firestore so the client gets notified in real-time
      (async () => {
        try {
          const apptRef = doc(db, 'appointments', id);
          await updateDoc(apptRef, { status });
        } catch (err) {
          console.warn('Could not update appointment status in Firestore:', err);
        }
      })();

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
    setState((prev) => {
      const nextServices = [...prev.services, { ...service, id: `sv-${Date.now()}`, active: true }];
      const next = { ...prev, services: nextServices };
      syncShopToFirestore(next.settings, next.services, next.promos);
      return next;
    });
    toast('Servicio añadido al catálogo');
  }, [toast, syncShopToFirestore]);

  const updateService = useCallback((id: string, patch: Partial<OwnerService>) => {
    setState((prev) => {
      const nextServices = prev.services.map((s) => (s.id === id ? { ...s, ...patch } : s));
      const next = { ...prev, services: nextServices };
      syncShopToFirestore(next.settings, next.services, next.promos);
      return next;
    });
    toast('Servicio actualizado');
  }, [toast, syncShopToFirestore]);

  const toggleServiceActive = useCallback((id: string) => {
    setState((prev) => {
      const nextServices = prev.services.map((s) =>
        s.id === id ? { ...s, active: !s.active } : s,
      );
      const next = { ...prev, services: nextServices };
      syncShopToFirestore(next.settings, next.services, next.promos);
      return next;
    });
  }, [syncShopToFirestore]);

  const addEmployee = useCallback(
    (employee: Omit<OwnerEmployee, 'id' | 'avatar' | 'todayCitas' | 'rating' | 'since' | 'active'> & { name: string }) => {
      setState((prev) => ({
        ...prev,
        employees: [
          ...prev.employees,
          normalizeEmployee({
            ...employee,
            id: `emp-${Date.now()}`,
            since: new Date().toISOString().slice(0, 7),
          }),
        ],
      }));
      toast('Empleado añadido al equipo');
    },
    [toast],
  );

  const updateEmployee = useCallback((id: string, patch: Partial<OwnerEmployee>) => {
    setState((prev) => ({
      ...prev,
      employees: prev.employees.map((e) => {
        if (e.id !== id) return e;
        const next = { ...e, ...patch };
        if (patch.name) next.avatar = initials(patch.name);
        return next;
      }),
    }));
    toast('Empleado actualizado');
  }, [toast]);

  const toggleEmployeeActive = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      employees: prev.employees.map((e) =>
        e.id === id ? { ...e, active: !e.active } : e,
      ),
    }));
  }, []);

  const addPromo = useCallback((promo: Omit<OwnerPromo, 'id' | 'uses' | 'status'>) => {
    const status = promoStatus(promo.expires);
    setState((prev) => {
      const nextPromos = [
        { ...promo, id: `pr-${Date.now()}`, uses: 0, status },
        ...prev.promos,
      ];
      const next = { ...prev, promos: nextPromos };
      syncShopToFirestore(next.settings, next.services, next.promos);
      return next;
    });
    toast('Promoción creada');
  }, [toast, syncShopToFirestore]);

  const deletePromo = useCallback((id: string) => {
    setState((prev) => {
      const nextPromos = prev.promos.filter((p) => p.id !== id);
      const next = { ...prev, promos: nextPromos };
      syncShopToFirestore(next.settings, next.services, next.promos);
      return next;
    });
    toast('Promoción eliminada', 'info');
  }, [toast, syncShopToFirestore]);

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
    setState((prev) => {
      const next = { ...prev, settings };
      syncShopToFirestore(next.settings, next.services, next.promos);
      return next;
    });
    toast('Configuración guardada');
  }, [toast, syncShopToFirestore]);

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
      addEmployee,
      updateEmployee,
      toggleEmployeeActive,
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
      addEmployee,
      updateEmployee,
      toggleEmployeeActive,
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
