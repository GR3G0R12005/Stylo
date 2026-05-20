import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Star, LogOut, Moon, Sun, Menu, X, Home, Calendar, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

interface Props {
  children: React.ReactNode;
  isDarkMode: boolean;
  onToggleDark: () => void;
  onResetHome: () => void;
  activeTab?: 'home' | 'appointments';
  onTabChange?: (tab: 'home' | 'appointments') => void;
}

export default function ClienteLayout({
  children,
  isDarkMode,
  onToggleDark,
  onResetHome,
  activeTab = 'home',
  onTabChange,
}: Props) {
  const { profile, signOut, theme } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const themeBadge =
    theme === 'feminine' ? 'Dama Elegante' : theme === 'masculine' ? 'Caballero Moderno' : 'Cliente Premium';

  return (
    <div
      className={cn(
        'min-h-screen min-h-[100dvh] bg-theme-bg text-theme-text font-sans transition-colors duration-500',
        'pb-24 lg:pb-10',
      )}
    >
      <header className="sticky top-0 z-40 bg-theme-bg/85 backdrop-blur-xl border-b border-theme-secondary/20">
        <motion.div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[4.5rem] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="lg:hidden p-2.5 rounded-xl bg-theme-secondary/10 text-theme-secondary shrink-0"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/cliente" onClick={onResetHome} className="flex items-center gap-2 sm:gap-3 min-w-0">
              <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl inline-flex items-center justify-center text-white bg-theme-primary shadow-lg shadow-theme-primary/20 shrink-0">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              </span>
              <div className="text-left min-w-0 hidden sm:block">
                <p className="text-sm font-black tracking-tight truncate">STEYLOOK</p>
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-theme-secondary truncate">
                  {themeBadge}
                </p>
              </div>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            <button
              type="button"
              onClick={onResetHome}
              className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-theme-secondary hover:bg-theme-primary/5 transition-all"
            >
              Explorar
            </button>
            <button
              type="button"
              onClick={() => onTabChange?.('appointments')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all',
                activeTab === 'appointments'
                  ? 'bg-theme-primary text-white'
                  : 'text-theme-secondary hover:bg-theme-primary/5',
              )}
            >
              Mis citas
            </button>
            <Link
              to="/"
              className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-theme-primary hover:bg-theme-primary/5 transition-all"
            >
              Inicio web
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={onToggleDark}
              className="p-2 sm:p-2.5 rounded-xl bg-theme-secondary/10 text-theme-secondary hover:bg-theme-secondary/20 transition-all"
              aria-label="Cambiar tema"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="hidden md:block text-right max-w-[140px]">
              <p className="text-sm font-bold leading-tight truncate">{profile?.nombre}</p>
              <p className="text-[10px] text-theme-secondary font-medium truncate">{profile?.email}</p>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="p-2 sm:p-2.5 rounded-xl bg-theme-secondary/10 text-theme-secondary hover:bg-red-500/10 hover:text-red-500 transition-all"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed left-0 top-0 bottom-0 z-[51] w-[min(85vw,320px)] bg-theme-bg border-r border-theme-secondary/20 p-6 flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <p className="font-black text-lg">Menú</p>
                <button type="button" onClick={() => setMenuOpen(false)} className="p-2 rounded-xl bg-theme-secondary/10">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="space-y-2 flex-1">
                {[
                  { id: 'home' as const, label: 'Explorar locales', icon: Home },
                  { id: 'appointments' as const, label: 'Mis citas', icon: Calendar },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onTabChange?.(item.id);
                      if (item.id === 'home') onResetHome();
                      setMenuOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all',
                      activeTab === item.id ? 'bg-theme-primary text-white' : 'hover:bg-theme-primary/5',
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </button>
                ))}
                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm text-theme-secondary hover:bg-theme-primary/5"
                >
                  <Home className="w-5 h-5" />
                  Página principal
                </Link>
              </nav>
              <div className="pt-6 border-t border-theme-secondary/20">
                <p className="text-xs text-theme-secondary mb-1">Sesión</p>
                <p className="font-bold truncate">{profile?.nombre}</p>
                <p className="text-xs text-theme-secondary truncate">{profile?.email}</p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">{children}</main>

      <nav className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border-t border-theme-secondary/15 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex justify-between items-center max-w-md mx-auto">
          {[
            { id: 'home' as const, icon: Star, label: 'Explorar' },
            { id: 'appointments' as const, icon: Calendar, label: 'Citas' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onTabChange?.(item.id);
                if (item.id === 'home') onResetHome();
              }}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1 rounded-2xl transition-all min-w-[4rem]',
                activeTab === item.id ? 'text-theme-primary scale-105' : 'text-zinc-400',
              )}
            >
              <item.icon className={cn('w-6 h-6', activeTab === item.id && 'fill-current')} />
              <span className="text-[9px] font-black uppercase tracking-wider">{item.label}</span>
            </button>
          ))}
          <button type="button" onClick={onToggleDark} className="flex flex-col items-center gap-1 px-3 py-1 text-zinc-400 min-w-[4rem]">
            {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            <span className="text-[9px] font-black uppercase tracking-wider">Tema</span>
          </button>
          <button type="button" onClick={signOut} className="flex flex-col items-center gap-1 px-3 py-1 text-zinc-400 min-w-[4rem]">
            <User className="w-6 h-6" />
            <span className="text-[9px] font-black uppercase tracking-wider">Salir</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
