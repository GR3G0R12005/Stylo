import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { db, handleFirestoreError, OperationType, auth } from '../../lib/firebase';
import { collection, query, addDoc, serverTimestamp, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Search, Calendar, Clock, MapPin, Star, User, LogOut, CheckCircle2, ChevronRight, X, ArrowLeft, MessageSquare, Bell, SlidersHorizontal, DollarSign, Moon, Sun, Phone, AlertCircle } from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import GoogleCalendar from '../../components/cliente/GoogleCalendar';
import WorkCarousel from '../../components/cliente/WorkCarousel';
import ReviewList from '../../components/cliente/ReviewList';
import ReviewForm from '../../components/cliente/ReviewForm';
import ChatWindow from '../../components/cliente/ChatWindow';
import FilterPanel, { FilterState } from '../../components/cliente/FilterPanel';
import { Shop, Service, Appointment } from '../../types';
import { generateReminderMessage, generateWelcomeMessage } from '../../services/aiService';
import ClienteLayout from '../../components/cliente/ClienteLayout';

const APPT_STORAGE_KEY = 'steylook_client_appointments';

export default function ClienteHome() {
  const { profile, signOut, theme, setTheme } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [isSelectingTime, setIsSelectingTime] = useState(false);
  const [bookingDate, setBookingDate] = useState<Date | null>(null);
  const [bookingTime, setBookingTime] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'success'>('idle');
  const [showReviewForm, setShowReviewForm] = useState<string | null>(null); // appointmentId
  const [selectedApptDetails, setSelectedApptDetails] = useState<Appointment | null>(null);
  const [activeChat, setActiveChat] = useState<{ id: string, name: string } | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: 'Todos',
    minRating: 0,
    maxPrice: 3,
    onlyAvailable: false
  });
  const [shopsError, setShopsError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('steylook_dark') === 'true';
    } catch {
      return false;
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'home' | 'appointments'>('home');
  const [apptFilter, setApptFilter] = useState<'todas' | 'completadas'>('todas');
  const [timeTab, setTimeTab] = useState<'mañana' | 'tarde' | 'noche'>('mañana');
  const [activeInterface, setActiveInterface] = useState<'barberia' | 'salon'>(() => {
    return theme === 'feminine' ? 'salon' : 'barberia';
  });

  useEffect(() => {
    setTheme(activeInterface === 'salon' ? 'feminine' : 'masculine');
  }, [activeInterface, setTheme]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('steylook_dark', String(isDarkMode));
    } catch {
      // ignore
    }
  }, [isDarkMode]);

  useEffect(() => {
    const q = query(collection(db, 'shops'), where('isPublic', '==', true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shop));
      console.log("Home: Loaded shops:", data);
      setShops(data);
      setShopsError(null);
      setLoading(false);
    }, (err) => {
      console.error("Home: Error al escuchar tiendas en tiempo real", err);
      setShopsError(err.message || String(err));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time appointments listener
  useEffect(() => {
    const local = loadLocalAppointments();
    setAppointments(local);

    if (!auth.currentUser) return;

    // Track previous statuses to detect changes
    const prevStatuses = new Map<string, string>();

    const q = query(
      collection(db, 'appointments'),
      where('clientId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc'),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Appointment));
      if (data.length > 0) {
        setAppointments(data);
        saveLocalAppointments(data);

        // Detect status changes made by the business
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'modified') {
            const appt = { id: change.doc.id, ...change.doc.data() } as Appointment;
            const prev = prevStatuses.get(appt.id);
            if (prev && prev !== appt.status) {
              let msg = '';
              if (appt.status === 'confirmed') msg = `✅ ¡Tu cita en ${appt.shopName} fue confirmada!`;
              else if (appt.status === 'cancelled') msg = `❌ Tu cita en ${appt.shopName} fue cancelada.`;
              else if (appt.status === 'completed') msg = `⭐ Tu cita en ${appt.shopName} fue completada. ¡Déjanos una valoración!`;
              if (msg) {
                setNotification(msg);
                setTimeout(() => setNotification(null), 10000);
              }
            }
          }
          // Always update tracked statuses
          const appt = { id: change.doc.id, ...change.doc.data() } as Appointment;
          prevStatuses.set(appt.id, appt.status);
        });

        // Init tracker on first load
        if (prevStatuses.size === 0) {
          data.forEach((a) => prevStatuses.set(a.id, a.status));
        }
      }
    }, (err) => {
      console.error('Error listening appointments:', err);
    });

    return () => unsubscribe();
  }, [auth.currentUser?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  // Welcome message on mount
  useEffect(() => {
    if (profile?.nombre) {
      generateWelcomeMessage(profile.nombre).then(msg => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 8000);
      });
    }
  }, [profile?.nombre]);

  const filteredShops = (() => {
    const q = searchQuery.toLowerCase().trim();

    return shops.filter((shop) => {
      const cats = shop.categories ?? [];
      const matchSearch =
        !q ||
        shop.name.toLowerCase().includes(q) ||
        (shop.address && shop.address.toLowerCase().includes(q)) ||
        cats.some((c) => c.toLowerCase().includes(q));
      const matchCategory = filters.category === 'Todos' || cats.includes(filters.category);
      const matchRating = (shop.rating ?? 0) >= filters.minRating;
      const matchPrice = (shop.priceRange ?? 2) <= filters.maxPrice;
      const matchType = shop.type === activeInterface;
      return matchSearch && matchCategory && matchRating && matchPrice && matchType;
    });
  })();

  const loadLocalAppointments = (): Appointment[] => {
    try {
      const raw = localStorage.getItem(APPT_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Appointment[]) : [];
    } catch {
      return [];
    }
  };

  const saveLocalAppointments = (list: Appointment[]) => {
    localStorage.setItem(APPT_STORAGE_KEY, JSON.stringify(list));
  };


  const handleSelectShop = async (shop: any) => {
    setSelectedShop(shop);
    setSelectedServices([]);
    setIsSelectingTime(false);
    setBookingDate(null);
    setBookingTime('');
    if (shop.services && shop.services.length > 0) {
      setServices(shop.services.filter((s: any) => s.active !== false));
    } else {
      // Fallback a los servicios por defecto
      if (shop.type === 'barberia') {
        setServices([
          { id: '1', name: 'Fade & Barba', price: 35, duration: 45, category: 'Premium' },
          { id: '2', name: 'Corte Clásico', price: 25, duration: 30, category: 'Básico' },
          { id: '3', name: 'Tratamiento Capilar', price: 45, duration: 60, category: 'Tratamiento' },
          { id: '4', name: 'Barba Royale', price: 18, duration: 20, category: 'Básico' },
        ]);
      } else {
        setServices([
          { id: '1', name: 'Color & Hidratación', price: 85, duration: 120, category: 'Color' },
          { id: '2', name: 'Manicura Spa', price: 45, duration: 60, category: 'Uñas' },
          { id: '3', name: 'Corte Mariposa', price: 60, duration: 45, category: 'Corte' },
          { id: '4', name: 'Tratamiento de Keratina', price: 65, duration: 120, category: 'Tratamiento' },
        ]);
      }
    }
  };

  const startChat = async (shop: Shop) => {
    if (!auth.currentUser || !profile) return;
    const chatId = `${auth.currentUser.uid}_${shop.id}`;
    setActiveChat({ id: chatId, name: shop.name });
  };

  const handleBooking = async () => {
    if (!selectedShop || selectedServices.length === 0 || !bookingDate || !bookingTime || !profile) return;
    
    const serviceIds = selectedServices.map(s => s.id).join(',');
    const serviceNames = selectedServices.map(s => s.name).join(', ');
    const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

    const appointmentsPath = 'appointments';
    const newAppt: Appointment = {
      id: `local-${Date.now()}`,
      clientId: auth.currentUser?.uid || 'guest',
      clientName: profile.nombre,
      providerId: selectedShop.id,
      shopId: selectedShop.id,
      shopName: selectedShop.name,
      serviceId: serviceIds,
      serviceName: serviceNames,
      date: bookingDate.toISOString(),
      status: 'pending',
      price: totalPrice,
      createdAt: new Date().toISOString(),
    };

    try {
      if (auth.currentUser) {
        await addDoc(collection(db, appointmentsPath), {
          clientId: auth.currentUser.uid,
          clientName: profile.nombre,
          shopId: selectedShop.id,
          shopName: selectedShop.name,
          serviceId: serviceIds,
          serviceName: serviceNames,
          date: bookingDate.toISOString(),
          time: bookingTime,
          status: 'pending',
          price: totalPrice,
          createdAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.warn('Firestore booking fallback to local:', err);
    }

    const updated = [{ ...newAppt, time: bookingTime }, ...appointments];
    saveLocalAppointments(updated);
    setAppointments(updated);
    setBookingStatus('success');
    setTimeout(() => {
      setBookingStatus('idle');
      setSelectedShop(null);
      setSelectedServices([]);
      setIsSelectingTime(false);
      setBookingDate(null);
      setBookingTime('');
    }, 3000);
  };

  const handleCancelAppointment = async (apptId: string) => {
    // 1. Update local state & local storage for instant feedback
    const updated = appointments.map((appt) => {
      if (appt.id === apptId) {
        return { ...appt, status: 'cancelled' as const };
      }
      return appt;
    });
    setAppointments(updated);
    saveLocalAppointments(updated);

    // 2. Update Firestore if not a local mock ID
    if (!apptId.startsWith('local-')) {
      try {
        const apptRef = doc(db, 'appointments', apptId);
        await updateDoc(apptRef, { status: 'cancelled' });
        setNotification("❌ Tu cita fue cancelada.");
        setTimeout(() => setNotification(null), 5000);
      } catch (err) {
        console.error("Error al cancelar la cita en Firestore:", err);
        setNotification("⚠️ Error al cancelar la cita en el servidor.");
        setTimeout(() => setNotification(null), 5000);
      }
    } else {
      setNotification("❌ Tu cita fue cancelada.");
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const resetHome = () => {
    setActiveTab('home');
    setSelectedShop(null);
    setSelectedServices([]);
    setIsSelectingTime(false);
    setBookingDate(null);
    setBookingTime('');
    setFilters({
      category: 'Todos',
      minRating: 0,
      maxPrice: 3,
      onlyAvailable: false
    });
    setActiveInterface(theme === 'feminine' ? 'salon' : 'barberia');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentThemeClasses = "text-theme-primary bg-theme-secondary/20 border border-theme-secondary/30";

  return (
    <ClienteLayout
      isDarkMode={isDarkMode}
      onToggleDark={() => setIsDarkMode(!isDarkMode)}
      onResetHome={resetHome}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      activeInterface={activeInterface}
      onChangeInterface={setActiveInterface}
    >
      {/* AI Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-20 left-4 right-4 sm:left-auto sm:right-6 z-50 sm:max-w-sm"
          >
            <div className="bg-zinc-900 border border-zinc-800 text-white p-6 rounded-[2rem] shadow-2xl flex gap-4">
              <div className="bg-theme-primary rounded-full p-3 h-fit">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-secondary mb-1">Staylook AI Assistant</p>
                <p className="text-sm font-medium leading-relaxed">{notification}</p>
              </div>
              <button onClick={() => setNotification(null)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeTab === 'appointments' ? (
        <section className="space-y-6">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-theme-text">Mis citas</h2>
            <p className="text-zinc-500 font-medium mt-1">Gestiona tus reservas</p>
          </motion.div>

          {/* Sub-tabs */}
          <div className="flex gap-2 p-1.5 bg-theme-bg rounded-2xl border border-theme-secondary/10 w-fit">
            {(['todas', 'completadas'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setApptFilter(tab)}
                className={cn(
                  'px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all',
                  apptFilter === tab
                    ? 'bg-theme-primary text-white shadow-md'
                    : 'text-theme-text/50 hover:text-theme-text'
                )}
              >
                {tab === 'todas' ? 'Todas' : 'Completadas'}
              </button>
            ))}
          </div>

          {/* List */}
          {(() => {
            const filteredAppts = apptFilter === 'completadas'
              ? appointments.filter(a => a.status === 'completed')
              : appointments
                  .filter(a => a.status !== 'completed')
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            if (appointments.length === 0) {
              return (
                <div className="text-center py-16 sm:py-24 bg-theme-bg rounded-[2rem] sm:rounded-[3rem] border border-theme-secondary/10">
                  <Calendar className="w-12 h-12 text-theme-text/40 mx-auto mb-4" />
                  <p className="font-bold text-theme-text/70">Aún no tienes citas</p>
                  <p className="text-sm text-theme-text/50 mt-2 mb-6">Explora locales y reserva tu primera cita</p>
                  <button type="button" onClick={() => setActiveTab('home')} className="px-6 py-3 rounded-2xl bg-theme-primary text-white text-xs font-black uppercase tracking-widest">Explorar locales</button>
                </div>
              );
            }

            if (filteredAppts.length === 0) {
              return (
                <div className="text-center py-14 bg-theme-bg rounded-[2rem] border border-theme-secondary/10">
                  <Calendar className="w-10 h-10 text-theme-text/30 mx-auto mb-3" />
                  <p className="font-bold text-theme-text/60 text-sm">
                    {apptFilter === 'completadas' ? 'No tienes citas completadas aún' : 'No hay citas activas'}
                  </p>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {filteredAppts.map((app) => (
                  <motion.div
                    key={app.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedApptDetails(app)}
                    className="p-5 sm:p-8 rounded-[1.75rem] sm:rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-theme-secondary/10 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-pointer hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-2xl sm:text-3xl shrink-0 group-hover:scale-105 transition-transform">{app.shopName.toLowerCase().includes('barber') ? '💈' : '✂️'}</div>
                      <div className="min-w-0">
                        <h4 className="font-black text-lg sm:text-xl text-zinc-900 dark:text-white truncate group-hover:text-theme-primary transition-colors">{app.shopName}</h4>
                        <p className="text-sm text-theme-secondary font-bold flex items-center gap-2 mt-1"><Calendar className="w-4 h-4 shrink-0" />{format(new Date(app.date), 'EEEE d MMMM', { locale: es })}</p>
                        {app.serviceName && <p className="text-xs text-zinc-400 mt-1 truncate">{app.serviceName}</p>}
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-theme-secondary/10">
                      <div className="text-xl sm:text-2xl font-black text-theme-primary">{app.time || '10:00'}</div>
                      <div className={cn('px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest',
                        app.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                        app.status === 'completed' ? 'bg-green-100 text-green-700' :
                        'bg-theme-secondary/10 text-theme-secondary'
                      )}>
                        {app.status === 'pending' ? 'Pendiente' : app.status === 'completed' ? 'Completada' : app.status === 'cancelled' ? 'Cancelada' : 'Confirmada'}
                      </div>
                      {app.status === 'completed' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowReviewForm(app.id);
                          }}
                          className="text-[10px] font-black uppercase tracking-widest text-theme-primary cursor-pointer hover:underline"
                        >
                          Valorar
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            );
          })()}
        </section>
      ) : (
        <>

        {shopsError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-black">Error al cargar negocios</p>
              <p className="text-xs opacity-80">{shopsError}</p>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 font-poppins"
        >
          <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 ${currentThemeClasses}`}>
            Bienvenido de nuevo
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 text-theme-text">Hola, {profile?.nombre?.split(' ')[0]} 👋</h2>
          <p className="text-zinc-500 font-medium italic">Encuentra tu próximo cambio de look.</p>
        </motion.div>

        {/* Search Bar & Filter Toggle */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-theme-secondary" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar barbería, salón o tratamiento..."
              className="w-full bg-theme-bg text-theme-text border border-theme-secondary/20 rounded-2xl sm:rounded-[1.8rem] py-3.5 sm:py-4 md:py-5 pl-10 sm:pl-12 md:pl-14 pr-4 text-sm sm:text-base focus:outline-none focus:ring-4 focus:ring-theme-primary/10 font-medium shadow-sm placeholder:text-theme-text/50"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "p-3.5 sm:p-4 md:p-5 rounded-[1.5rem] sm:rounded-[1.8rem] border flex items-center justify-center gap-2 sm:gap-3 font-bold transition-all",
              showFilters
                ? "bg-theme-primary text-white border-theme-primary shadow-xl shadow-theme-primary/20"
                : "bg-theme-bg text-theme-text border-theme-secondary/10 hover:border-theme-primary"
            )}
          >
            <SlidersHorizontal className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-xs sm:text-sm hidden sm:block lg:block">Filtros</span>
          </button>
        </div>

        {/* Upcoming Appointments */}
        {appointments.length > 0 && appointments.some(a => a.status !== 'completed') && (
          <section className="mb-8 sm:mb-12">
            <h3 className="text-xs font-black uppercase text-theme-secondary tracking-[0.3em] mb-4 sm:mb-6">Mis Próximas Citas</h3>
            <div className="space-y-3 sm:space-y-4">
              {appointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled').map(app => (
                <div
                  key={app.id}
                  onClick={() => setSelectedApptDetails(app)}
                  className="p-4 sm:p-5 md:p-8 rounded-[1.5rem] sm:rounded-[1.75rem] md:rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-theme-secondary/10 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 group hover:shadow-xl transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-[1rem] sm:rounded-[1.25rem] md:rounded-[1.5rem] bg-zinc-50 flex items-center justify-center text-2xl sm:text-3xl shadow-inner group-hover:scale-110 transition-transform shrink-0">
                      {app.shopName.includes('Barber') ? '💈' : '✂️'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-base sm:text-lg md:text-xl text-zinc-900 dark:text-white mb-1 truncate group-hover:text-theme-primary transition-colors">{app.shopName}</h4>
                      <p className="text-xs sm:text-sm text-theme-secondary font-bold flex items-center gap-1.5 sm:gap-2">
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> {format(new Date(app.date), 'EEEE d MMMM', { locale: es })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end justify-center">
                    <div className="text-xl sm:text-2xl font-black text-theme-primary mb-1">{app.time || '10:00'}</div>
                    <div className="px-2.5 sm:px-3 py-1 rounded-full bg-theme-secondary/10 text-theme-secondary text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                      {app.status === 'pending' ? 'Pendiente' : 'Confirmada'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Past Appointments to Review */}
        {appointments.length > 0 && appointments.some(a => a.status === 'completed') && (
          <section className="mb-8 sm:mb-12">
            <h3 className="text-xs font-black uppercase text-theme-secondary tracking-[0.3em] mb-4 sm:mb-6">Califica tu experiencia</h3>
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {appointments.filter(a => a.status === 'completed').map(app => (
                <div key={app.id} className="min-w-[280px] sm:min-w-[300px] p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] bg-zinc-900 shadow-xl text-white">
                  <h4 className="font-bold mb-1 text-sm sm:text-base truncate">{app.shopName}</h4>
                  <p className="text-zinc-400 text-xs mb-3 sm:mb-4 truncate">{app.serviceName}</p>
                  <button
                    onClick={() => setShowReviewForm(app.id)}
                    className="w-full py-2.5 sm:py-3 bg-theme-primary rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform"
                  >
                    Deja una valoración
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-10">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden w-full overflow-hidden mb-6 sm:mb-8"
              >
                <FilterPanel
                  filters={filters}
                  onFilterChange={setFilters}
                  onClose={() => setShowFilters(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="hidden lg:block w-72 xl:w-80 flex-shrink-0">
            <FilterPanel
              filters={filters}
              onFilterChange={setFilters}
              onClose={() => {}}
            />
          </div>

          {/* Shop Grid */}
          <div className="flex-1">
            {/* ── Shimmer skeleton while Firestore loads (Fase 5) ──────── */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="rounded-[2.5rem] overflow-hidden border border-theme-secondary/10 shadow-sm">
                    <div className="shimmer-loader h-64 rounded-none" style={{ animationDelay: `${i * 0.12}s` }} />
                    <div className="p-8 space-y-3">
                      <div className="shimmer-loader h-4 w-24 rounded-full" style={{ animationDelay: `${i * 0.12 + 0.1}s` }} />
                      <div className="shimmer-loader h-7 w-3/4 rounded-xl" style={{ animationDelay: `${i * 0.12 + 0.2}s` }} />
                      <div className="shimmer-loader h-4 w-1/2 rounded-full" style={{ animationDelay: `${i * 0.12 + 0.3}s` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : shops.length === 0 ? (
              <div className="text-center py-16 sm:py-20 bg-theme-bg rounded-[2rem] sm:rounded-[3rem] border border-theme-secondary/10 px-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-theme-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Search className="w-8 h-8 sm:w-10 sm:h-10 text-theme-text/40" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-theme-text mb-2">No hay negocios registrados todavía</h3>
                <p className="text-sm sm:text-base text-theme-text/60">Vuelve más tarde para ver nuevos establecimientos.</p>
              </div>
            ) : filteredShops.length === 0 ? (
              <div className="text-center py-16 sm:py-20 bg-theme-bg rounded-[2rem] sm:rounded-[3rem] border border-theme-secondary/10 px-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-theme-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Search className="w-8 h-8 sm:w-10 sm:h-10 text-theme-text/40" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-theme-text mb-2">No encontramos resultados</h3>
                <p className="text-sm sm:text-base text-theme-text/60">Prueba ajustando tus filtros de búsqueda.</p>
                <button
                  onClick={() => setFilters({ category: 'Todos', minRating: 0, maxPrice: 3, onlyAvailable: false })}
                  className="mt-6 sm:mt-8 text-theme-primary font-black uppercase tracking-widest text-xs sm:text-sm"
                >
                  Limpiar todos los filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
                {filteredShops.map((shop, i) => (
                  <motion.div
                    key={shop.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => handleSelectShop(shop)}
                    className="group bg-theme-bg rounded-[2.5rem] overflow-hidden border border-theme-secondary/10 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer"
                  >
                    <div className="h-64 overflow-hidden relative">
                      <img 
                        src={shop.photo} 
                        alt={shop.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                        <p className="text-white text-sm font-medium leading-relaxed italic line-clamp-2">{shop.description}</p>
                      </div>
                      <div className="absolute top-6 right-6 flex flex-col gap-2">
                        <div className="bg-theme-bg/95 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-black shadow-lg text-theme-text border border-theme-secondary/20">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {shop.rating}
                        </div>
                        <div className="bg-theme-text/90 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-0.5 text-xs font-black text-theme-bg shadow-lg self-end">
                          {[...Array(shop.priceRange)].map((_, i) => <DollarSign key={i} className="w-3 h-3" />)}
                        </div>
                      </div>
                    </div>
                    <div className="p-8">
                      <div className="flex flex-wrap gap-2 mb-4">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-zinc-100 rounded-full text-zinc-500">
                          {shop.type === 'barberia' ? 'Barberería' : 'Salón'}
                        </div>
                        {(shop.categories ?? []).slice(0, 2).map(cat => (
                          <div key={cat} className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-theme-primary/10 rounded-full text-theme-primary">
                            {cat}
                          </div>
                        ))}
                      </div>
                      <h3 className={cn(
                        "text-2xl font-black mb-2 tracking-tight text-theme-text",
                        shop.type === 'salon' && "font-serif italic"
                      )}>{shop.name}</h3>
                      <div className="flex items-center gap-2 text-theme-secondary text-sm mb-6 font-medium font-poppins">
                        <MapPin className="w-4 h-4 text-theme-primary" />
                        <span className="truncate">{shop.address}</span>
                      </div>
                      <div className="flex items-center justify-between font-black text-xs uppercase tracking-widest pt-6 border-t border-theme-secondary/5 group-hover:text-theme-primary transition-colors">
                        <span>Ver disponibilidad</span>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
        </>
      )}

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedShop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4 md:p-6"
            onClick={(e) => { if (e.target === e.currentTarget) { setSelectedShop(null); setSelectedServices([]); setIsSelectingTime(false); setBookingDate(null); setBookingTime(''); }}}
          >
            <motion.div
              initial={{ y: '100%', scale: 1 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: '100%', scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className="bg-theme-bg w-full max-w-2xl rounded-t-[2rem] sm:rounded-[2.5rem] max-h-[85vh] shadow-2xl relative text-theme-text flex flex-col"
            >
              {/* Fixed Header */}
              <div className="p-4 sm:p-5 md:p-6 pb-3 sm:pb-4 shrink-0 border-b border-theme-secondary/10">
                <button
                  onClick={() => {
                    setSelectedShop(null);
                    setSelectedServices([]);
                    setIsSelectingTime(false);
                    setBookingDate(null);
                    setBookingTime('');
                  }}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 sm:p-2.5 bg-theme-secondary/10 rounded-full hover:bg-theme-secondary/20 transition-colors z-10"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <div className="flex items-center gap-3 mb-2 pr-10">
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight truncate">{selectedShop.name}</h3>
                  <button
                    onClick={(e) => { e.stopPropagation(); startChat(selectedShop); }}
                    className="p-1.5 sm:p-2 bg-theme-primary/10 text-theme-primary rounded-lg hover:bg-theme-primary hover:text-white transition-all shrink-0"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-theme-text/50 text-xs font-medium">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {selectedShop.address}</span>
                  {selectedShop.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {selectedShop.phone}</span>}
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto flex-1 p-4 sm:p-5 md:p-6 pt-3 sm:pt-4">
                {/* Promociones */}
                {(selectedShop as any).promos && (selectedShop as any).promos.filter((p: any) => p.status === 'active').length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-theme-text/50 mb-2">Ofertas</h4>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                      {(selectedShop as any).promos.filter((p: any) => p.status === 'active').map((promo: any) => (
                        <div key={promo.id} className="min-w-[200px] p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-theme-text shrink-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-amber-500 text-black text-[8px] px-1.5 py-0.5 rounded font-black uppercase">OFERTA</span>
                            <span className="text-sm font-black text-amber-500">{promo.discount}</span>
                          </div>
                          <p className="font-bold text-xs leading-tight text-zinc-900 dark:text-white">{promo.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Works Carousel */}
                <div className="mb-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-theme-text/50 mb-2">Nuestros Trabajos</h4>
                  <WorkCarousel type={selectedShop.type} />
                </div>

                {!isSelectingTime ? (
                  <>
                    {/* Services Selection */}
                    <div className="mb-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-theme-text/50 mb-2">Selecciona Servicios</h4>
                      <div className="space-y-2">
                        {services.map(service => {
                          const isSelected = selectedServices.some(s => s.id === service.id);
                          return (
                            <button
                              key={service.id}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedServices(prev => prev.filter(s => s.id !== service.id));
                                } else {
                                  setSelectedServices(prev => [...prev, service]);
                                }
                              }}
                              className={cn(
                                "w-full flex items-center gap-3 p-3 rounded-xl transition-all border-2 text-left",
                                isSelected
                                  ? "border-green-500 bg-green-500/10"
                                  : "border-transparent bg-theme-secondary/5 hover:bg-theme-secondary/10"
                              )}
                            >
                              {/* Checkbox circle */}
                              <div className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                                isSelected ? "border-green-500 bg-green-500" : "border-theme-secondary/30"
                              )}>
                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                              </div>
                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className={cn("font-bold text-sm truncate transition-colors", isSelected ? "text-green-500" : "text-theme-text")}>{service.name}</div>
                                <div className="text-theme-text/50 text-[10px] font-medium flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5" /> {service.duration} min
                                </div>
                              </div>
                              {/* Price */}
                              <div className={cn("text-base font-black shrink-0 transition-colors", isSelected ? "text-green-500" : "text-theme-text")}>{formatCurrency(service.price)}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Reviews */}
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-theme-text/50 mb-2">Reseñas</h4>
                      <ReviewList shopId={selectedShop.id} />
                    </div>

                    {/* Spacer for the green bubble */}
                    {selectedServices.length > 0 && <div className="h-20" />}
                  </>
                ) : !bookingDate ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <button onClick={() => setIsSelectingTime(false)} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-theme-secondary/10 text-theme-text/70 text-[10px] font-black uppercase tracking-widest hover:bg-theme-secondary/20 transition-colors">
                      <ArrowLeft className="w-3.5 h-3.5" /> Atrás
                    </button>
                    <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                      <p className="text-[10px] font-black uppercase tracking-widest text-green-600 dark:text-green-400 mb-1">{selectedServices.length} {selectedServices.length === 1 ? 'Servicio seleccionado' : 'Servicios seleccionados'}</p>
                      <p className="text-xs text-theme-text/70">{selectedServices.map(s => s.name).join(' • ')}</p>
                      <p className="text-lg font-black text-green-500 mt-1">{formatCurrency(selectedServices.reduce((sum, s) => sum + s.price, 0))}</p>
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-theme-text/50">Selecciona fecha</h4>
                    <GoogleCalendar
                      selectedDate={bookingDate}
                      onDateSelect={(date) => setBookingDate(date)}
                    />
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between">
                      <button onClick={() => setBookingDate(null)} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-theme-secondary/10 text-theme-text/70 text-[10px] font-black uppercase tracking-widest hover:bg-theme-secondary/20 transition-colors">
                        <Calendar className="w-3.5 h-3.5" /> {format(bookingDate, 'd MMM', { locale: es })}
                      </button>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-theme-text/50 uppercase tracking-widest">Total</p>
                        <p className="font-black text-base text-green-500">{formatCurrency(selectedServices.reduce((sum, s) => sum + s.price, 0))}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-theme-text/50">Horarios Disponibles</h4>

                      {(() => {
                        const allSlots: Record<'mañana' | 'tarde' | 'noche', { time: string; taken?: boolean }[]> = {
                          mañana: [
                            { time: '09:00' },
                            { time: '10:00' },
                            { time: '11:00' },
                            { time: '12:00', taken: true },
                          ],
                          tarde: [
                            { time: '13:00' },
                            { time: '14:00', taken: true },
                            { time: '15:00' },
                            { time: '16:00' },
                          ],
                          noche: [
                            { time: '17:00' },
                            { time: '18:00', taken: true },
                            { time: '19:00' },
                            { time: '20:00' },
                          ],
                        };
                        const tabLabels: ('mañana' | 'tarde' | 'noche')[] = ['mañana', 'tarde', 'noche'];
                        const tabIcons: Record<string, string> = { mañana: '🌤', tarde: '🌇', noche: '🌙' };
                        return (
                          <>
                            <div className="flex gap-1.5 p-1 bg-theme-secondary/10 rounded-xl">
                              {tabLabels.map(tab => (
                                <button
                                  key={tab}
                                  onClick={() => setTimeTab(tab)}
                                  className={cn(
                                    'flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all capitalize flex items-center justify-center gap-1',
                                    timeTab === tab
                                      ? 'bg-white dark:bg-zinc-800 shadow-sm text-theme-primary'
                                      : 'text-theme-text/50 hover:text-theme-text',
                                  )}
                                >
                                  <span>{tabIcons[tab]}</span>
                                  <span className="hidden sm:inline">{tab}</span>
                                </button>
                              ))}
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                              {allSlots[timeTab].map(({ time, taken }) => (
                                <button
                                  key={time}
                                  onClick={() => !taken && setBookingTime(time)}
                                  disabled={taken}
                                  className={cn(
                                    'py-3 rounded-xl font-black text-sm transition-all border-2',
                                    taken
                                      ? 'opacity-30 cursor-not-allowed border-transparent bg-theme-secondary/10 text-theme-text line-through decoration-2'
                                      : bookingTime === time
                                      ? 'bg-theme-primary text-white border-theme-primary shadow-lg shadow-theme-primary/20 scale-105'
                                      : 'bg-theme-secondary/10 border-transparent hover:border-theme-secondary/30 text-theme-text hover:bg-theme-secondary/20',
                                  )}
                                >
                                  {time}
                                </button>
                              ))}
                            </div>
                          </>
                        );
                      })()}

                      <button
                        disabled={!bookingTime}
                        onClick={handleBooking}
                        className={cn(
                          "w-full text-white py-4 rounded-2xl font-black text-lg shadow-2xl transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 mt-4",
                          theme === 'feminine' ? 'bg-pink-500 shadow-pink-200' : theme === 'masculine' ? 'bg-zinc-900 shadow-zinc-200' : 'bg-theme-primary shadow-blue-200'
                        )}
                      >
                        Confirmar Cita • {formatCurrency(selectedServices.reduce((sum, s) => sum + s.price, 0))}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Green Bubble — sticky at bottom of modal */}
              <AnimatePresence>
                {selectedServices.length > 0 && !isSelectingTime && (
                  <motion.div
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 80, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-20"
                  >
                    <button
                      onClick={() => setIsSelectingTime(true)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white p-4 rounded-2xl shadow-[0_-4px_30px_rgba(34,197,94,0.3)] flex items-center justify-between gap-3 border border-green-400 transition-colors active:scale-[0.98]"
                    >
                      <div className="text-left">
                        <div className="text-[10px] font-black uppercase tracking-wider text-green-100">{selectedServices.length} {selectedServices.length === 1 ? 'Servicio' : 'Servicios'}</div>
                        <div className="text-xl font-black">{formatCurrency(selectedServices.reduce((acc, s) => acc + s.price, 0))}</div>
                      </div>
                      <div className="flex items-center gap-1.5 font-black bg-white text-green-600 px-4 py-2.5 rounded-xl text-xs uppercase tracking-widest">
                        Continuar <ChevronRight className="w-4 h-4" />
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewForm && (
          <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg relative"
            >
              <button 
                onClick={() => setShowReviewForm(null)}
                className="absolute -top-4 -right-4 p-3 bg-white rounded-full shadow-lg hover:scale-110 transition-transform z-10"
              >
                <X className="w-5 h-5 text-zinc-900" />
              </button>
              <ReviewForm 
                shopId={appointments.find(a => a.id === showReviewForm)?.shopId || ''}
                clientId={auth.currentUser?.uid || ''}
                clientName={profile?.nombre || 'Cliente'}
                onSuccess={() => {
                  setShowReviewForm(null);
                  setNotification("¡Gracias por tu reseña! Ayudará a otros clientes.");
                  setTimeout(() => setNotification(null), 5000);
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Appointment Details Modal */}
      <AnimatePresence>
        {selectedApptDetails && (
          <div
            className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedApptDetails(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white dark:bg-zinc-900 border border-theme-secondary/10 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative text-theme-text flex flex-col p-6 sm:p-8"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedApptDetails(null)}
                className="absolute top-4 right-4 p-2 bg-theme-secondary/10 rounded-full hover:bg-theme-secondary/20 transition-colors z-10 cursor-pointer"
              >
                <X className="w-5 h-5 text-zinc-900 dark:text-white" />
              </button>

              {/* Icon / Avatar */}
              <div className="flex flex-col items-center text-center mt-4 mb-6">
                <div className="w-20 h-20 rounded-3xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-4xl shadow-inner mb-4">
                  {selectedApptDetails.shopName.toLowerCase().includes('barber') ? '💈' : '✂️'}
                </div>
                <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white leading-tight">
                  {selectedApptDetails.shopName}
                </h3>
                <div className="mt-2">
                  <span className={cn('px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest',
                    selectedApptDetails.status === 'cancelled' ? 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400' :
                    selectedApptDetails.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' :
                    'bg-theme-secondary/10 text-theme-secondary'
                  )}>
                    {selectedApptDetails.status === 'pending' ? 'Pendiente' : selectedApptDetails.status === 'completed' ? 'Completada' : selectedApptDetails.status === 'cancelled' ? 'Cancelada' : 'Confirmada'}
                  </span>
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-5 flex-1 py-2 border-t border-b border-theme-secondary/10 my-2">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-secondary mb-2">Servicios Reservados</h4>
                  <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl p-4 border border-theme-secondary/5">
                    <p className="font-bold text-sm text-zinc-900 dark:text-white leading-relaxed">
                      {selectedApptDetails.serviceName || 'Servicio General'}
                    </p>
                    <div className="mt-3 pt-3 border-t border-theme-secondary/5 flex justify-between items-center">
                      <span className="text-xs text-zinc-400 font-medium">Total</span>
                      <span className="text-lg font-black text-green-500">{formatCurrency(selectedApptDetails.price)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl p-4 border border-theme-secondary/5 flex flex-col items-center text-center">
                    <Calendar className="w-5 h-5 text-theme-primary mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Fecha</span>
                    <span className="text-xs font-bold text-zinc-800 dark:text-white mt-1 capitalize leading-tight">
                      {format(new Date(selectedApptDetails.date), 'eee d MMM', { locale: es })}
                    </span>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl p-4 border border-theme-secondary/5 flex flex-col items-center text-center">
                    <Clock className="w-5 h-5 text-theme-primary mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Hora</span>
                    <span className="text-xs font-bold text-zinc-800 dark:text-white mt-1">
                      {selectedApptDetails.time || '10:00'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-3 shrink-0">
                {(selectedApptDetails.status === 'pending' || selectedApptDetails.status === 'confirmed') && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
                        handleCancelAppointment(selectedApptDetails.id);
                        setSelectedApptDetails(null);
                      }
                    }}
                    className="w-full py-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-red-200 dark:shadow-none transition-all active:scale-[0.98] cursor-pointer"
                  >
                    Cancelar Cita
                  </button>
                )}

                {selectedApptDetails.status === 'completed' && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowReviewForm(selectedApptDetails.id);
                      setSelectedApptDetails(null);
                    }}
                    className="w-full py-4 rounded-2xl bg-theme-primary hover:opacity-90 text-white font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] cursor-pointer"
                  >
                    Dejar Valoración
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedApptDetails(null)}
                  className="w-full py-3.5 rounded-2xl border border-theme-secondary/20 hover:bg-theme-secondary/5 text-zinc-500 dark:text-zinc-400 font-black text-xs uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Notification */}
      <AnimatePresence>
        {bookingStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-24 sm:bottom-10 left-4 right-4 sm:left-6 sm:right-6 z-[100] flex justify-center pointer-events-none"
          >
            <div className="bg-zinc-900 text-white px-10 py-6 rounded-[3rem] flex items-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
              <div className="bg-green-500 rounded-full p-3 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <p className="font-black text-xl leading-tight">¡Cita Confirmada!</p>
                <p className="text-zinc-400 font-medium">Te enviamos un recordatorio por SMS.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {activeChat && auth.currentUser && (
          <ChatWindow 
            chatId={activeChat.id}
            recipientName={activeChat.name}
            currentUserId={auth.currentUser.uid}
            onClose={() => setActiveChat(null)}
          />
        )}
      </AnimatePresence>

    </ClienteLayout>
  );
}
