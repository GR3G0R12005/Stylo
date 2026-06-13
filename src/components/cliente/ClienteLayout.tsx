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
  activeInterface?: 'barberia' | 'salon';
  onChangeInterface?: (value: 'barberia' | 'salon') => void;
}

export default function ClienteLayout({
  children,
  isDarkMode,
  onToggleDark,
  onResetHome,
  activeTab = 'home',
  onTabChange,
  activeInterface = 'barberia',
  onChangeInterface,
}: Props) {
  const { profile, signOut, theme } = useAuth();

  const themeBadge =
    theme === 'feminine' ? 'Dama Elegante' : theme === 'masculine' ? 'Caballero Moderno' : 'Cliente Premium';

  return (
    <div
      className={cn(
        'min-h-screen min-h-[100dvh] bg-theme-bg text-theme-text font-sans transition-colors duration-500',
        'pb-24 lg:pb-10',
      )}
    >
      {/* ── Sticky Header — Structural Glassmorphism ──────────────────── */}
      <header className="sticky top-0 z-40 glass-structural">
        <motion.div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 h-14 sm:h-16 md:h-[4.5rem] flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link to="/cliente" onClick={onResetHome} className="flex items-center gap-2 sm:gap-3 min-w-0">
              <span className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl inline-flex items-center justify-center text-white bg-theme-primary shadow-lg shadow-theme-primary/20 shrink-0">
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 fill-current" />
              </span>
              <div className="text-left min-w-0 hidden sm:block">
                <p className="text-xs sm:text-sm font-black tracking-tight truncate">STAYLOOK</p>
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

          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
            <button
              type="button"
              onClick={onToggleDark}
              className="p-2 sm:p-2.5 rounded-xl bg-theme-secondary/10 text-theme-secondary hover:bg-theme-secondary/20 transition-all"
              aria-label="Cambiar tema"
            >
              {isDarkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
            <div className="hidden md:block text-right max-w-[120px] lg:max-w-[140px]">
              <p className="text-xs sm:text-sm font-bold leading-tight truncate">{profile?.nombre}</p>
              <p className="text-[9px] sm:text-[10px] text-theme-secondary font-medium truncate">{profile?.email}</p>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="p-2 sm:p-2.5 rounded-xl bg-theme-secondary/10 text-theme-secondary hover:bg-red-500/10 hover:text-red-500 transition-all"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </motion.div>
      </header>
      {/* ── Floating Interface Switch — Top Bubble ──────────────────── */}
      <div className="fixed top-[4.5rem] sm:top-20 right-4 sm:right-6 md:right-8 z-40 p-1 rounded-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChangeInterface?.('barberia')}
          className={cn(
            "px-3 py-1.5 rounded-full text-[9px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1",
            activeInterface === 'barberia'
              ? "bg-theme-primary text-white shadow-md"
              : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          )}
        >
          <span>💈</span>
          <span>Barber</span>
        </button>
        <button
          type="button"
          onClick={() => onChangeInterface?.('salon')}
          className={cn(
            "px-3 py-1.5 rounded-full text-[9px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1",
            activeInterface === 'salon'
              ? "bg-theme-primary text-white shadow-md"
              : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          )}
        >
          <span>✂️</span>
          <span>Salón</span>
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-10">{children}</main>

      {/* ── Bottom Tab Bar — Floating Bubble ─────────────────── */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-sm backdrop-blur-2xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/50 dark:border-zinc-800/50 rounded-full shadow-2xl px-4 py-2 lg:hidden">
        <div className="flex justify-between items-center">
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
                'flex flex-col items-center gap-1 px-2 sm:px-3 py-1 rounded-2xl transition-all min-w-[3.5rem] sm:min-w-[4rem]',
                activeTab === item.id ? 'text-theme-primary scale-105' : 'text-zinc-400',
              )}
            >
              <item.icon className={cn('w-5 h-5 sm:w-6 sm:h-6', activeTab === item.id && 'fill-current')} />
              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider">{item.label}</span>
            </button>
          ))}
          <button type="button" onClick={onToggleDark} className="flex flex-col items-center gap-1 px-2 sm:px-3 py-1 text-zinc-400 min-w-[3.5rem] sm:min-w-[4rem]">
            {isDarkMode ? <Sun className="w-5 h-5 sm:w-6 sm:h-6" /> : <Moon className="w-5 h-5 sm:w-6 sm:h-6" />}
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider">Tema</span>
          </button>
          <button type="button" onClick={signOut} className="flex flex-col items-center gap-1 px-2 sm:px-3 py-1 text-zinc-400 min-w-[3.5rem] sm:min-w-[4rem]">
            <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider">Salir</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
