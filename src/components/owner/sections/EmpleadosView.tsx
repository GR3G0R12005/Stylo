import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { UserCheck, Star, Calendar } from 'lucide-react';
import { OwnerTheme } from '../ownerTheme';
import { useOwnerData } from '../../../context/OwnerDataContext';

interface Props { theme: OwnerTheme; }

const SCHEDULE = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

export default function EmpleadosView({ theme: t }: Props) {
  const { employees, appointments, today } = useOwnerData();

  const todayAppts = appointments.filter((a) => a.date === today && a.status !== 'cancelled');

  const schedule = useMemo(() => {
    const map: Record<string, Record<string, string | null>> = {};
    employees.forEach((e, ei) => {
      map[e.id] = {};
      SCHEDULE.forEach((hour) => {
        const match = todayAppts.find((a, ai) => a.time.startsWith(hour.slice(0, 2)) && ai % employees.length === ei);
        map[e.id][hour] = match ? match.clientName.split(' ')[0] + ' ' + (match.clientName.split(' ')[1]?.[0] || '') + '.' : null;
      });
    });
    return map;
  }, [employees, todayAppts]);

  const card = { background: t.cardBg, border: `1px solid ${t.border}` };
  const muted = { color: t.textMuted };
  const accent = { color: t.accent };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p style={muted} className="text-xs font-bold uppercase tracking-widest mb-1">Equipo</p>
        <h2 style={{ color: t.text }} className="text-3xl font-black">Empleados</h2>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {employees.map((e, i) => {
          const empToday = todayAppts.filter((_, ai) => ai % employees.length === i).length;
          return (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="rounded-2xl p-6"
              style={card}
            >
              <div className="flex items-start justify-between mb-4">
                <motion.div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black"
                  style={{ background: t.accentLight, color: t.accent }}
                  whileHover={{ rotate: 5 }}
                >
                  {e.avatar}
                </motion.div>
                <span
                  className="text-[10px] font-black px-2 py-1 rounded-full"
                  style={{ background: e.active ? 'rgba(34,197,94,0.15)' : 'rgba(161,161,170,0.15)', color: e.active ? '#22c55e' : '#71717a' }}
                >
                  {e.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <h3 style={{ color: t.text }} className="font-black text-lg">{e.name}</h3>
              <p style={accent} className="text-xs font-bold mb-3">{e.role}</p>
              <p style={muted} className="text-xs mb-4">{e.specialty}</p>
              <div className="space-y-2">
                <motion.div className="flex items-center justify-between">
                  <span style={muted} className="text-xs flex items-center gap-1"><Calendar size={12} /> Citas hoy</span>
                  <span style={{ color: t.text }} className="text-sm font-black">{empToday}</span>
                </motion.div>
                <div className="flex items-center justify-between">
                  <span style={muted} className="text-xs flex items-center gap-1"><Star size={12} /> Rating</span>
                  <span style={accent} className="text-sm font-black">{e.rating} ★</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={muted} className="text-xs flex items-center gap-1"><UserCheck size={12} /> Desde</span>
                  <span style={muted} className="text-xs font-bold">{e.since}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl overflow-hidden" style={card}>
        <div className="p-5" style={{ borderBottom: `1px solid ${t.border}` }}>
          <p style={muted} className="text-[10px] font-black uppercase tracking-widest">Agenda del día — {today}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                <th className="p-3 text-left text-[10px] font-black uppercase" style={muted}>Hora</th>
                {employees.map((e) => (
                  <th key={e.id} className="p-3 text-left text-[10px] font-black uppercase" style={muted}>{e.name.split(' ')[0]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SCHEDULE.map((hour, hi) => (
                <tr key={hour} style={{ borderBottom: hi < SCHEDULE.length - 1 ? `1px solid ${t.border}` : 'none' }}>
                  <td className="p-3 text-xs font-black" style={muted}>{hour}</td>
                  {employees.map((e) => {
                    const client = schedule[e.id]?.[hour];
                    return (
                      <td key={e.id} className="p-3">
                        {client ? (
                          <motion.span
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-xs font-bold px-3 py-1 rounded-lg inline-block"
                            style={{ background: t.accentLight, color: t.accent }}
                          >
                            {client}
                          </motion.span>
                        ) : (
                          <span style={muted} className="text-xs">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
