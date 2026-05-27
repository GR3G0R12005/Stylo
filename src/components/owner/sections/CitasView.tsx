import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, Clock, Search, Plus, Check } from 'lucide-react';
import { OwnerTheme } from '../ownerTheme';
import { useOwnerData } from '../../../context/OwnerDataContext';
import { STATUS_COLORS, STATUS_LABEL, type AppointmentStatus } from '../../../data/ownerSeed';

interface Props { theme: OwnerTheme; }

type Status = 'all' | AppointmentStatus;

export default function CitasView({ theme: t }: Props) {
  const { appointments, updateAppointmentStatus, addAppointment, services, today } = useOwnerData();
  const [filter, setFilter] = useState<Status>('all');
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ clientName: '', serviceId: '', date: today, time: '10:00' });

  const filtered = appointments.filter((a) => {
    const matchFilter = filter === 'all' || a.status === filter;
    const matchSearch =
      a.clientName.toLowerCase().includes(search.toLowerCase()) ||
      a.service.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const card = { background: t.cardBg, border: `1px solid ${t.border}` };
  const muted = { color: t.textMuted };
  const accent = { color: t.accent };

  const tabs: { key: Status; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'pending', label: 'Pendientes' },
    { key: 'confirmed', label: 'Confirmadas' },
    { key: 'completed', label: 'Completadas' },
    { key: 'cancelled', label: 'Canceladas' },
  ];

  const handleCreate = () => {
    const svc = services.find((s) => s.id === form.serviceId);
    if (!form.clientName.trim() || !svc) return;
    addAppointment({
      clientName: form.clientName.trim(),
      clientAvatar: form.clientName.trim().split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
      service: svc.name,
      serviceId: svc.id,
      date: form.date,
      time: form.time,
      status: 'pending',
      price: svc.price,
    });
    setShowNew(false);
    setForm({ clientName: '', serviceId: services[0]?.id || '', date: today, time: '10:00' });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <p style={muted} className="text-xs font-bold uppercase tracking-widest mb-1">Gestión</p>
          <h2 style={{ color: t.text }} className="text-3xl font-black">Mis Citas</h2>
        </motion.div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-black transition-all hover:scale-105"
          style={{ background: t.accent, color: '#fff' }}
        >
          <Plus size={16} /> Nueva Cita
        </button>
      </div>

      <motion.div className="flex flex-col sm:flex-row gap-4 mb-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <motion.div className="relative flex-1" whileFocus={{ scale: 1.01 }}>
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={muted} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente o servicio..."
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition-all focus:ring-2"
            style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }}
          />
        </motion.div>
      </motion.div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className="px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all hover:scale-105"
            style={{
              background: filter === tab.key ? t.accent : t.accentLight,
              color: filter === tab.key ? '#fff' : t.accent,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <motion.div className="rounded-2xl overflow-hidden" style={card} layout>
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <div className="p-16 text-center">
              <p style={muted} className="font-bold">No se encontraron citas.</p>
            </div>
          ) : (
            filtered.map((a, i) => (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ delay: i * 0.03 }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 transition-all hover:bg-white/[0.02]"
                style={{
                  borderBottom: i < filtered.length - 1 ? `1px solid ${t.border}` : 'none',
                }}
              >
                <motion.div className="flex items-center gap-4 mb-3 sm:mb-0" whileHover={{ x: 4 }}>
                  <motion.div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                    style={{ background: t.accentLight, color: t.accent }}
                    whileHover={{ scale: 1.08 }}
                  >
                    {a.clientAvatar}
                  </motion.div>
                  <motion.div>
                    <p style={{ color: t.text }} className="font-black text-sm">{a.clientName}</p>
                    <p style={muted} className="text-xs">{a.service}</p>
                    <p style={muted} className="text-xs mt-0.5 flex items-center gap-1">
                      <Clock size={11} /> {a.date} — {a.time}
                    </p>
                  </motion.div>
                </motion.div>

                <div className="flex items-center gap-3 ml-16 sm:ml-0 flex-wrap">
                  <span className="font-black text-sm" style={{ color: t.text }}>${a.price}</span>
                  <span
                    className="text-[10px] font-black px-3 py-1 rounded-full"
                    style={{ background: STATUS_COLORS[a.status].bg, color: STATUS_COLORS[a.status].text }}
                  >
                    {STATUS_LABEL[a.status]}
                  </span>
                  {a.status === 'pending' && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => updateAppointmentStatus(a.id, 'confirmed')}
                        className="p-2 rounded-lg transition-all hover:scale-110 active:scale-95"
                        style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}
                        title="Confirmar"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() => updateAppointmentStatus(a.id, 'cancelled')}
                        className="p-2 rounded-lg transition-all hover:scale-110 active:scale-95"
                        style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
                        title="Cancelar"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  )}
                  {a.status === 'confirmed' && (
                    <button
                      onClick={() => updateAppointmentStatus(a.id, 'completed')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all hover:scale-105"
                      style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}
                    >
                      <Check size={12} /> Completar
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showNew && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
            onClick={(e) => e.target === e.currentTarget && setShowNew(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-md rounded-3xl p-8"
              style={{ background: t.isDark ? '#1a1a1a' : '#fff', border: `1px solid ${t.border}` }}
            >
              <h3 style={{ color: t.text }} className="font-black text-2xl mb-6">Nueva Cita</h3>
              <motion.div className="space-y-4">
                <div>
                  <label style={muted} className="text-[10px] font-black uppercase tracking-widest block mb-1.5">Cliente</label>
                  <input
                    value={form.clientName}
                    onChange={(e) => setForm((p) => ({ ...p, clientName: e.target.value }))}
                    placeholder="Nombre del cliente"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }}
                  />
                </div>
                <motion.div>
                  <label style={muted} className="text-[10px] font-black uppercase tracking-widest block mb-1.5">Servicio</label>
                  <select
                    value={form.serviceId}
                    onChange={(e) => setForm((p) => ({ ...p, serviceId: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }}
                  >
                    {services.filter((s) => s.active).map((s) => (
                      <option key={s.id} value={s.id}>{s.name} — ${s.price}</option>
                    ))}
                  </select>
                </motion.div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={muted} className="text-[10px] font-black uppercase tracking-widest block mb-1.5">Fecha</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                      style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }}
                    />
                  </div>
                  <div>
                    <label style={muted} className="text-[10px] font-black uppercase tracking-widest block mb-1.5">Hora</label>
                    <input
                      type="time"
                      value={form.time}
                      onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                      style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }}
                    />
                  </div>
                </div>
              </motion.div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowNew(false)}
                  className="flex-1 py-3 rounded-2xl text-sm font-black"
                  style={{ background: t.accentLight, color: t.accent }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-1 py-3 rounded-2xl text-sm font-black"
                  style={{ background: t.accent, color: '#fff' }}
                >
                  Crear Cita
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
