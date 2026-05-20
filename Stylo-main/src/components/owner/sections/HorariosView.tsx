import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, X, AlertTriangle, Check } from 'lucide-react';
import { OwnerTheme } from '../ownerTheme';
import { useOwnerData } from '../../../context/OwnerDataContext';
import type { BlockedSlot } from '../../../data/ownerSeed';

interface Props { theme: OwnerTheme; }

const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

function getWeekDays(): { key: string; label: string; date: string }[] {
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return days.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const date = d.toISOString().slice(0, 10);
    return { key: date, label: `${label} ${d.getDate()}`, date };
  });
}

interface ModalState { day: string; hour: string; }

export default function HorariosView({ theme: t }: Props) {
  const { appointments, blockedSlots, blockSlot, unblockSlot, today } = useOwnerData();
  const weekDays = useMemo(() => getWeekDays(), []);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [reason, setReason] = useState('');
  const [blockOnwards, setBlockOnwards] = useState(false);

  const bookedByDayHour = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    appointments
      .filter((a) => a.status !== 'cancelled')
      .forEach((a) => {
        if (!map[a.date]) map[a.date] = new Set();
        map[a.date].add(a.time);
      });
    return map;
  }, [appointments]);

  const card = { background: t.cardBg, border: `1px solid ${t.border}` };
  const muted = { color: t.textMuted };

  const isBlocked = (day: string, hour: string) => !!blockedSlots[day]?.[hour];
  const isBooked = (day: string, hour: string) => bookedByDayHour[day]?.has(hour);

  const handleBlock = () => {
    if (!modal) return;
    blockSlot(
      modal.day,
      modal.hour,
      { reason: reason || 'No disponible', fromOnwards: blockOnwards },
      blockOnwards,
      HOURS,
    );
    setModal(null);
    setReason('');
    setBlockOnwards(false);
  };

  const totalBlocked = Object.values(blockedSlots).reduce<number>(
    (sum, day) => sum + Object.values(day as Record<string, BlockedSlot | null>).filter(Boolean).length,
    0,
  );

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <p style={muted} className="text-xs font-bold uppercase tracking-widest mb-1">Disponibilidad</p>
        <h2 style={{ color: t.text }} className="text-3xl font-black">Horarios</h2>
        <p style={muted} className="text-sm mt-1">
          Clic en horario libre para bloquear. Clic en bloqueado para liberar.
        </p>
      </motion.div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        {[
          { color: t.accentLight, border: t.accent, textColor: t.accent, label: 'Disponible' },
          { color: 'rgba(239,68,68,0.12)', border: '#ef4444', textColor: '#ef4444', label: 'Bloqueado' },
          { color: 'rgba(99,102,241,0.12)', border: '#6366f1', textColor: '#6366f1', label: 'Reservado' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md" style={{ background: l.color, border: `1.5px solid ${l.border}` }} />
            <span style={{ color: l.textColor }} className="text-xs font-bold">{l.label}</span>
          </div>
        ))}
        {totalBlocked > 0 && (
          <span className="text-xs font-black px-3 py-1 rounded-full ml-auto" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
            {totalBlocked} horas bloqueadas
          </span>
        )}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl overflow-hidden" style={card}>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                <th className="p-4 text-left w-20">
                  <span style={muted} className="text-[10px] font-black uppercase tracking-widest">Hora</span>
                </th>
                {weekDays.map((day) => (
                  <th key={day.key} className="p-4 text-center">
                    <span
                      style={{ color: day.date === today ? t.accent : t.textMuted }}
                      className="text-xs font-black"
                    >
                      {day.label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour, hi) => (
                <tr key={hour} style={{ borderBottom: hi < HOURS.length - 1 ? `1px solid ${t.border}` : 'none' }}>
                  <td className="p-3 pl-4">
                    <span style={muted} className="text-xs font-black font-mono">{hour}</span>
                  </td>
                  {weekDays.map((day) => {
                    const blockedInfo = blockedSlots[day.key]?.[hour];
                    const booked = isBooked(day.key, hour);
                    const isBlock = !!blockedInfo;
                    let bg = t.isDark ? 'rgba(255,255,255,0.03)' : '#F9F9FB';
                    let borderColor = t.border;
                    let cursor = 'pointer';
                    if (booked) { bg = 'rgba(99,102,241,0.12)'; borderColor = '#6366f1'; cursor = 'default'; }
                    if (isBlock) { bg = 'rgba(239,68,68,0.12)'; borderColor = '#ef4444'; }
                    return (
                      <td key={day.key} className="p-2 text-center">
                        <motion.button
                          whileHover={!booked ? { scale: 1.05 } : {}}
                          whileTap={!booked ? { scale: 0.95 } : {}}
                          disabled={booked}
                          onClick={() => (isBlock ? unblockSlot(day.key, hour) : setModal({ day: day.key, hour }))}
                          className="w-full h-10 rounded-xl flex items-center justify-center gap-1 text-xs font-bold transition-all disabled:cursor-default"
                          style={{ background: bg, border: `1.5px solid ${borderColor}`, cursor }}
                          title={isBlock ? `Bloqueado: ${blockedInfo?.reason}` : booked ? 'Reservado' : 'Clic para bloquear'}
                        >
                          {booked ? (
                            <span style={{ color: '#6366f1' }} className="text-[10px] font-black">●</span>
                          ) : isBlock ? (
                            <>
                              <Lock size={12} style={{ color: '#ef4444' }} />
                              <span style={{ color: '#ef4444' }} className="text-[10px] truncate max-w-[50px]">{blockedInfo?.reason}</span>
                            </>
                          ) : (
                            <span style={{ color: t.textMuted }} className="text-[10px] opacity-40">Libre</span>
                          )}
                        </motion.button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
            onClick={(e) => e.target === e.currentTarget && setModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="w-full max-w-md rounded-3xl p-8 relative"
              style={{ background: t.isDark ? '#1a1a1a' : '#fff', border: `1px solid ${t.border}` }}
            >
              <button onClick={() => setModal(null)} className="absolute top-4 right-4 p-2 rounded-full" style={{ background: t.accentLight, color: t.accent }}>
                <X size={16} />
              </button>
              <h3 style={{ color: t.text }} className="font-black text-xl mb-6">Bloquear Horario — {modal.hour}</h3>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Motivo del bloqueo..."
                className="w-full px-4 py-3 rounded-xl text-sm mb-4 outline-none"
                style={{ background: t.inputBg, border: `1.5px solid ${t.border}`, color: t.text }}
              />
              <motion.div className="flex flex-wrap gap-2 mb-5">
                {['Almuerzo', 'Reunión', 'Cita médica', 'Descanso'].map((r) => (
                  <button key={r} onClick={() => setReason(r)} className="px-3 py-1.5 rounded-full text-xs font-black" style={{ background: reason === r ? t.accent : t.accentLight, color: reason === r ? '#fff' : t.accent }}>
                    {r}
                  </button>
                ))}
              </motion.div>
              <button
                onClick={() => setBlockOnwards(!blockOnwards)}
                className="w-full flex items-center justify-between p-4 rounded-2xl mb-6"
                style={{ background: blockOnwards ? 'rgba(239,68,68,0.08)' : t.accentLight, border: `1.5px solid ${blockOnwards ? '#ef4444' : t.border}` }}
              >
                <span style={{ color: t.text }} className="text-sm font-black">Bloquear desde {modal.hour} en adelante</span>
                <motion.div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: blockOnwards ? '#ef4444' : t.border }}>
                  {blockOnwards && <Check size={14} color="#fff" />}
                </motion.div>
              </button>
              <motion.div className="flex gap-3">
                <button onClick={() => setModal(null)} className="flex-1 py-3 rounded-2xl text-sm font-black" style={{ background: t.accentLight, color: t.accent }}>Cancelar</button>
                <button onClick={handleBlock} className="flex-1 py-3 rounded-2xl text-sm font-black" style={{ background: '#ef4444', color: '#fff' }}>Bloquear</button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
