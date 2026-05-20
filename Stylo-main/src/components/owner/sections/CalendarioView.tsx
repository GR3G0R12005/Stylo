import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { OwnerTheme } from '../ownerTheme';
import { useOwnerData } from '../../../context/OwnerDataContext';
import { STATUS_COLORS, STATUS_LABEL } from '../../../data/ownerSeed';

interface Props { theme: OwnerTheme; }

const DAYS_SHORT = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function CalendarioView({ theme: t }: Props) {
  const now = new Date();
  const [current, setCurrent] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selected, setSelected] = useState<number | null>(now.getDate());
  const { appointments, today, updateAppointmentStatus } = useOwnerData();

  const todayParts = today.split('-').map(Number);
  const isCurrentMonth = current.year === todayParts[0] && current.month === todayParts[1] - 1;

  const apptDays = useMemo(() => {
    const prefix = `${current.year}-${String(current.month + 1).padStart(2, '0')}`;
    return new Set(
      appointments
        .filter((a) => a.date.startsWith(prefix) && a.status !== 'cancelled')
        .map((a) => parseInt(a.date.split('-')[2], 10)),
    );
  }, [appointments, current]);

  const firstDay = new Date(current.year, current.month, 1).getDay();
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();

  const selectedDate =
    selected !== null
      ? `${current.year}-${String(current.month + 1).padStart(2, '0')}-${String(selected).padStart(2, '0')}`
      : null;

  const selectedAppts = selectedDate
    ? appointments.filter((a) => a.date === selectedDate)
    : [];

  const prev = () =>
    setCurrent((c) => (c.month === 0 ? { year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 }));
  const next = () =>
    setCurrent((c) => (c.month === 11 ? { year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 }));

  const card = { background: t.cardBg, border: `1px solid ${t.border}` };
  const muted = { color: t.textMuted };
  const accent = { color: t.accent };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p style={muted} className="text-xs font-bold uppercase tracking-widest mb-1">Vista mensual</p>
        <h2 style={{ color: t.text }} className="text-3xl font-black">Calendario</h2>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 rounded-2xl p-6"
          style={card}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 style={{ color: t.text }} className="text-xl font-black">
              {MONTHS[current.month]} {current.year}
            </h3>
            <div className="flex gap-2">
              <button onClick={prev} className="p-2 rounded-xl hover:scale-110 transition-all" style={{ background: t.accentLight, color: t.accent }}>
                <ChevronLeft size={18} />
              </button>
              <button onClick={next} className="p-2 rounded-xl hover:scale-110 transition-all" style={{ background: t.accentLight, color: t.accent }}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <motion.div className="grid grid-cols-7 mb-2">
            {DAYS_SHORT.map((d) => (
              <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest py-2" style={muted}>
                {d}
              </div>
            ))}
          </motion.div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <motion.div key={`e-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = isCurrentMonth && day === todayParts[2];
              const hasAppt = apptDays.has(day);
              const isSelected = selected === day;
              return (
                <motion.button
                  key={day}
                  onClick={() => setSelected(day)}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  className="aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-bold relative"
                  style={{
                    background: isSelected ? t.accent : isToday ? t.accentLight : 'transparent',
                    color: isSelected ? '#fff' : t.text,
                  }}
                >
                  {day}
                  {hasAppt && !isSelected && (
                    <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full" style={{ background: t.accent }} />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-2xl p-6" style={card}>
          <p style={muted} className="text-[10px] font-black uppercase tracking-widest mb-4">
            {selected ? `${selected} de ${MONTHS[current.month]}` : 'Selecciona un día'}
          </p>

          {selectedAppts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: t.accentLight }}>
                <Clock size={28} style={accent} />
              </div>
              <p style={{ color: t.text }} className="font-bold mb-1">Sin citas</p>
              <p style={muted} className="text-xs">No hay citas programadas para este día.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedAppts.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="p-4 rounded-xl"
                  style={{ background: t.isDark ? 'rgba(255,255,255,0.04)' : '#F9F9FB', border: `1px solid ${t.border}` }}
                >
                  <motion.div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black" style={{ background: t.accentLight, color: t.accent }}>
                      {a.clientAvatar}
                    </div>
                    <div>
                      <p style={{ color: t.text }} className="text-sm font-bold">{a.clientName}</p>
                      <p style={muted} className="text-xs">{a.service}</p>
                    </div>
                  </motion.div>
                  <div className="flex items-center justify-between">
                    <span style={accent} className="text-xs font-black flex items-center gap-1">
                      <Clock size={12} /> {a.time} · ${a.price}
                    </span>
                    {a.status === 'pending' && (
                      <button
                        onClick={() => updateAppointmentStatus(a.id, 'confirmed')}
                        className="text-[10px] font-black px-2 py-1 rounded-full"
                        style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}
                      >
                        Confirmar
                      </button>
                    )}
                    <span
                      className="text-[10px] font-black px-2 py-0.5 rounded-full"
                      style={{ background: STATUS_COLORS[a.status].bg, color: STATUS_COLORS[a.status].text }}
                    >
                      {STATUS_LABEL[a.status]}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
