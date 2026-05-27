import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useOwnerData } from '../../context/OwnerDataContext';
import {
  LayoutDashboard, Calendar, CalendarCheck, Users, UserCog,
  Scissors, Clock, CreditCard, BarChart3, Star, Tag, Settings,
  LogOut, Menu, X, ChevronRight, Sparkles, Bell, Globe,
} from 'lucide-react';
import { OwnerRole, getTheme } from './ownerTheme';
import DashboardView    from './sections/DashboardView';
import CalendarioView   from './sections/CalendarioView';
import CitasView        from './sections/CitasView';
import ClientesView     from './sections/ClientesView';
import EmpleadosView    from './sections/EmpleadosView';
import ServiciosView    from './sections/ServiciosView';
import HorariosView     from './sections/HorariosView';
import PagosView        from './sections/PagosView';
import EstadisticasView from './sections/EstadisticasView';
import ResenasView      from './sections/ResenasView';
import PromocionesView  from './sections/PromocionesView';
import ConfiguracionView from './sections/ConfiguracionView';

interface Props { role: OwnerRole; }

type SectionId = 'dashboard'|'calendario'|'citas'|'clientes'|'empleados'|
                 'servicios'|'horarios'|'pagos'|'estadisticas'|'reseñas'|
                 'promociones'|'configuracion';

const NAV_ITEMS: { id: SectionId; label: string; icon: React.ElementType; badgeKey?: 'citas' | 'servicios' }[] = [
  { id:'dashboard',    label:'Dashboard',    icon: LayoutDashboard },
  { id:'calendario',   label:'Calendario',   icon: Calendar        },
  { id:'citas',        label:'Citas',         icon: CalendarCheck,   badgeKey: 'citas' },
  { id:'clientes',     label:'Clientes',      icon: Users           },
  { id:'empleados',    label:'Empleados',     icon: UserCog         },
  { id:'servicios',    label:'Servicios',     icon: Scissors,        badgeKey: 'servicios' },
  { id:'horarios',     label:'Horarios',      icon: Clock           },
  { id:'pagos',        label:'Pagos',         icon: CreditCard      },
  { id:'estadisticas', label:'Estadísticas',  icon: BarChart3       },
  { id:'reseñas',      label:'Reseñas',       icon: Star            },
  { id:'promociones',  label:'Promociones',   icon: Tag             },
  { id:'configuracion',label:'Configuración', icon: Settings        },
];

export default function OwnerLayout({ role }: Props) {
  const { profile, signOut } = useAuth();
  const { pendingCount, appointments, settings } = useOwnerData();
  const [active, setActive]   = useState<SectionId>('dashboard');
  const [sidebar, setSidebar] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  
  const lsKey = `steylook_palette_${role}`;
  const [paletteId, setPaletteId] = useState<string>(() => localStorage.getItem(lsKey) || '');
  
  const t = getTheme(role, paletteId);
  
  const handlePaletteChange = (id: string) => {
    setPaletteId(id);
    localStorage.setItem(lsKey, id);
  };

  const navigate = (id: string) => {
    setActive(id as SectionId);
    setSidebar(false);
    setNotifOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pendingRequests = useMemo(
    () => appointments.filter((a) => a.status === 'pending').slice(0, 5),
    [appointments],
  );

  const navBadges = useMemo(
    () => ({
      citas: pendingCount,
      servicios: appointments.filter((a) => a.status === 'pending').length,
    }),
    [pendingCount, appointments],
  );

  const renderSection = () => {
    const props = { theme: t, onNavigate: navigate };
    switch (active) {
      case 'dashboard':    return <DashboardView    {...props} />;
      case 'calendario':   return <CalendarioView   theme={t} />;
      case 'citas':        return <CitasView        theme={t} />;
      case 'clientes':     return <ClientesView     theme={t} onNavigate={navigate} />;
      case 'empleados':    return <EmpleadosView    theme={t} />;
      case 'servicios':    return <ServiciosView    theme={t} />;
      case 'horarios':     return <HorariosView     theme={t} />;
      case 'pagos':        return <PagosView        theme={t} />;
      case 'estadisticas': return <EstadisticasView theme={t} />;
      case 'reseñas':      return <ResenasView      theme={t} />;
      case 'promociones':  return <PromocionesView  theme={t} />;
      case 'configuracion':return <ConfiguracionView theme={t} onPaletteChange={handlePaletteChange} currentPalette={paletteId} />;
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <button onClick={() => window.location.href = '/'}
        className="flex items-center gap-3 mb-8 px-2 hover:opacity-80 transition-opacity">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: t.accent }}>
          {role === 'barbero'
            ? <Scissors size={20} color="#000" />
            : <Sparkles size={20} color="#fff" fill="currentColor" />}
        </div>
        <div className="text-left leading-none">
          <p className="font-black text-lg" style={{ color: t.text }}>STEYLOOK</p>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: t.accent }}>
            {role === 'barbero' ? 'Barber Pro' : 'Studio Pro'}
          </p>
        </div>
      </button>

      {/* Profile mini */}
      <div className="flex items-center gap-3 p-3 rounded-2xl mb-6"
        style={{ background: t.accentLight, border: `1px solid ${t.accentMid}` }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
          style={{ background: t.accentMid, color: t.accent }}>
          {profile?.nombre?.charAt(0) || 'U'}
        </div>
        <div className="min-w-0">
          <p style={{ color: t.text }} className="text-sm font-black truncate">{profile?.nombre}</p>
          <p style={{ color: t.accent }} className="text-[10px] font-bold uppercase tracking-widest">
            {role === 'barbero' ? 'Master Barber' : 'Stylist Expert'}
          </p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => navigate(item.id)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative"
              style={{
                background: isActive ? t.accent : 'transparent',
                color: isActive ? '#fff' : t.textMuted,
              }}>
              <item.icon size={18} />
              <span className="text-sm font-bold flex-1 text-left">{item.label}</span>
              {item.badgeKey && navBadges[item.badgeKey] > 0 && !isActive && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full min-w-[20px] text-center"
                  style={{ background: t.accentLight, color: t.accent }}>
                  {navBadges[item.badgeKey]}
                </span>
              )}
              {isActive && <ChevronRight size={14} />}
            </button>
          );
        })}
      </nav>

      {/* Switch to client view */}
      <button onClick={() => window.location.href = '/cliente'}
        className="flex items-center gap-3 px-3 py-3 rounded-xl mt-4 transition-all hover:scale-[1.02] group"
        style={{ color: t.text }}>
        <Globe size={18} />
        <span className="text-sm font-bold">Ver como Cliente</span>
      </button>

      {/* Sign out */}
      <button onClick={signOut}
        className="flex items-center gap-3 px-3 py-3 rounded-xl mt-2 transition-all hover:scale-[1.02] group"
        style={{ color: '#ef4444' }}>
        <LogOut size={18} />
        <span className="text-sm font-bold">Cerrar Sesión</span>
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen" style={{ background: t.bg }}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col p-5 fixed left-0 top-0 h-screen overflow-y-auto z-20"
        style={{ background: t.sidebar, borderRight: `1px solid ${t.sidebarBorder}` }}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebar && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 z-30 lg:hidden"
              style={{ background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)' }}
              onClick={() => setSidebar(false)} />
            <motion.aside initial={{ x:'-100%' }} animate={{ x:0 }} exit={{ x:'-100%' }}
              transition={{ type:'spring', damping:25, stiffness:200 }}
              className="fixed left-0 top-0 h-screen w-72 z-40 p-5 flex flex-col lg:hidden"
              style={{ background: t.sidebar, borderRight:`1px solid ${t.sidebarBorder}` }}>
              <button onClick={() => setSidebar(false)} className="absolute top-4 right-4 p-2 rounded-xl"
                style={{ background: t.accentLight, color: t.accent }}>
                <X size={18} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
          style={{ background: t.headerBg, borderBottom: `1px solid ${t.border}`, backdropFilter:'blur(12px)' }}>
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebar(true)} className="lg:hidden p-2 rounded-xl transition-all"
              style={{ background: t.accentLight, color: t.accent }}>
              <Menu size={20} />
            </button>
            <div>
              <p style={{ color: t.text }} className="font-black text-sm capitalize">
                {NAV_ITEMS.find(n => n.id === active)?.label}
              </p>
              <p style={{ color: t.textMuted }} className="text-[10px] font-bold">
                {new Date().toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long' })}
              </p>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2 rounded-xl relative transition-all hover:scale-110"
              style={{ background: t.accentLight, color: t.accent }}
            >
              <Bell size={18} />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center"
                  style={{ background: t.accent, color: '#fff' }}>
                  {pendingCount}
                </span>
              )}
            </button>
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-80 rounded-2xl shadow-2xl overflow-hidden z-50"
                  style={{ background: t.isDark ? '#1a1a1a' : '#fff', border: `1px solid ${t.border}` }}
                >
                  <div className="p-4" style={{ borderBottom: `1px solid ${t.border}` }}>
                    <p style={{ color: t.text }} className="font-black text-sm">Notificaciones</p>
                    <p style={{ color: t.textMuted }} className="text-[10px] font-bold">{settings.shopName}</p>
                  </div>
                  {pendingRequests.length === 0 ? (
                    <p style={{ color: t.textMuted }} className="p-6 text-sm text-center">Todo al día ✓</p>
                  ) : (
                    <motion.div className="max-h-64 overflow-y-auto">
                      {pendingRequests.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => navigate('citas')}
                          className="w-full text-left p-4 hover:bg-white/5 transition-colors"
                          style={{ borderBottom: `1px solid ${t.border}` }}
                        >
                          <p style={{ color: t.text }} className="text-sm font-bold">{a.clientName}</p>
                          <p style={{ color: t.textMuted }} className="text-xs">{a.service} · {a.time}</p>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-10">
          <AnimatePresence mode="wait">
            <motion.div key={active}
              initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:-8 }} transition={{ duration:0.2 }}>
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
