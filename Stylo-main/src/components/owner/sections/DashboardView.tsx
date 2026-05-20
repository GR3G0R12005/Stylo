import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Calendar, TrendingUp, Star, CheckCircle, Clock, ChevronRight, Zap } from 'lucide-react';
import { OwnerTheme } from '../ownerTheme';
import { useOwnerData } from '../../../context/OwnerDataContext';
import { STATUS_COLORS, STATUS_LABEL } from '../../../data/ownerSeed';

interface Props { theme: OwnerTheme; onNavigate: (section: string) => void; }

export default function DashboardView({ theme: t, onNavigate }: Props) {
  const { appointments, today, reviews, transactions } = useOwnerData();

  const todayAppts = appointments.filter((a) => a.date === today && a.status !== 'cancelled');
  const pending = todayAppts.filter((a) => a.status === 'pending').length;
  const income = todayAppts
    .filter((a) => a.status === 'confirmed' || a.status === 'completed')
    .reduce((s, a) => s + a.price, 0);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  const weeklyData = useMemo(() => {
    const days = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
    const now = new Date();
    return days.map((day, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      const value = appointments
        .filter((a) => a.date === key && (a.status === 'completed' || a.status === 'confirmed'))
        .reduce((s, a) => s + a.price, 0);
      return { day, value };
    });
  }, [appointments]);

  const maxWeek = Math.max(...weeklyData.map((d) => d.value), 1);
  const weekTotal = weeklyData.reduce((s, d) => s + d.value, 0);

  const stats = [
    { label: 'Citas Hoy', value: String(todayAppts.length), icon: Calendar, trend: `${pending} por confirmar` },
    { label: 'Ingresos Hoy', value: `$${income}`, icon: TrendingUp, trend: `$${weekTotal} esta semana` },
    { label: 'Pendientes', value: String(pending), icon: Clock, trend: 'requieren acción' },
    { label: 'Rating', value: `${avgRating} ★`, icon: Star, trend: `${reviews.length} reseñas` },
  ];

  const card = { background: t.cardBg, border: `1px solid ${t.border}` };
  const muted = { color: t.textMuted };
  const accent = { color: t.accent };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <p style={muted} className="text-xs font-bold uppercase tracking-widest mb-2">Panel General</p>
        <h2 style={{ color: t.text }} className="text-4xl font-black tracking-tight">
          {t.role === 'barbero' ? 'Dashboard Diario' : 'Mi Estudio de Belleza'}
        </h2>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.02, y: -2 }}
            onClick={() => onNavigate(s.label.includes('Citas') || s.label.includes('Pendientes') ? 'citas' : 'estadisticas')}
            className="rounded-2xl p-6 relative overflow-hidden group cursor-pointer transition-shadow hover:shadow-lg"
            style={card}
          >
            <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <s.icon size={48} />
            </div>
            <p style={muted} className="text-[10px] font-bold uppercase tracking-widest mb-3">{s.label}</p>
            <p style={{ color: t.text }} className="text-3xl font-black mb-1">{s.value}</p>
            <p style={accent} className="text-[11px] font-bold">{s.trend}</p>
          </motion.div>
        ))}
      </div>

      <motion.div className="grid grid-cols-1 lg:grid-cols-5 gap-6" layout>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3 rounded-2xl p-6"
          style={card}
        >
          <motion.div className="flex items-center justify-between mb-6">
            <p style={muted} className="text-[10px] font-black uppercase tracking-widest">Citas de Hoy</p>
            <button
              onClick={() => onNavigate('citas')}
              style={accent}
              className="text-xs font-black flex items-center gap-1 hover:opacity-70 transition-opacity"
            >
              Ver todas <ChevronRight size={14} />
            </button>
          </motion.div>
          <div className="space-y-3">
            {todayAppts.length === 0 ? (
              <p style={muted} className="text-sm text-center py-8">Sin citas para hoy</p>
            ) : (
              todayAppts.slice(0, 5).map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.07 }}
                  whileHover={{ scale: 1.01, x: 4 }}
                  className="flex items-center gap-4 p-4 rounded-xl cursor-pointer"
                  style={{ background: t.isDark ? 'rgba(255,255,255,0.03)' : '#F9F9FB', border: `1px solid ${t.border}` }}
                  onClick={() => onNavigate('citas')}
                >
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                    style={{ background: t.accentLight, color: t.accent }}
                  >
                    {a.clientAvatar}
                  </div>
                  <motion.div className="flex-1 min-w-0">
                    <p style={{ color: t.text }} className="font-bold text-sm truncate">{a.clientName}</p>
                    <p style={muted} className="text-xs">{a.service}</p>
                  </motion.div>
                  <div className="text-right flex-shrink-0">
                    <p style={{ color: t.text }} className="text-sm font-black">{a.time}</p>
                    <span
                      className="text-[10px] font-black px-2 py-0.5 rounded-full"
                      style={{
                        background: STATUS_COLORS[a.status].bg,
                        color: STATUS_COLORS[a.status].text,
                      }}
                    >
                      {STATUS_LABEL[a.status]}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 rounded-2xl p-6 flex flex-col"
          style={card}
        >
          <p style={muted} className="text-[10px] font-black uppercase tracking-widest mb-1">Ingresos Semanales</p>
          <p style={{ color: t.text }} className="text-2xl font-black mb-6">${weekTotal}</p>
          <div className="flex items-end gap-2 flex-1">
            {weeklyData.map((d, i) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  className="w-full rounded-t-lg"
                  initial={{ height: 8 }}
                  animate={{ height: `${Math.max(8, (d.value / maxWeek) * 120)}px` }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                  style={{
                    background: i === weeklyData.length - 1 ? t.accent : t.accentLight,
                    minHeight: '8px',
                  }}
                />
                <span style={muted} className="text-[10px] font-bold">{d.day}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 rounded-2xl p-6"
        style={card}
      >
        <p style={muted} className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
          <Zap size={12} /> Acciones Rápidas
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Nueva Cita', section: 'citas', icon: Calendar },
            { label: 'Ver Horarios', section: 'horarios', icon: Clock },
            { label: 'Mis Servicios', section: 'servicios', icon: CheckCircle },
            { label: 'Estadísticas', section: 'estadisticas', icon: TrendingUp },
          ].map((q) => (
            <motion.button
              key={q.label}
              onClick={() => onNavigate(q.section)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 p-4 rounded-xl text-left"
              style={{ background: t.accentLight, border: `1px solid ${t.accentMid}` }}
            >
              <q.icon size={18} style={accent} />
              <span style={accent} className="text-xs font-black">{q.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
