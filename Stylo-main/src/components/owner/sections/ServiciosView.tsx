import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, CheckCircle, XCircle, Plus, ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react';
import { OwnerTheme } from '../ownerTheme';
import { useOwnerData } from '../../../context/OwnerDataContext';
import { addDays } from '../../../data/ownerSeed';

interface Props { theme: OwnerTheme; }

export default function ServiciosView({ theme: t }: Props) {
  const {
    services,
    addService,
    updateService,
    toggleServiceActive,
    getServiceRequests,
    updateAppointmentStatus,
    today,
  } = useOwnerData();
  const [expanded, setExpanded] = useState<string | null>(services[0]?.id ?? null);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', price: '', duration: '30', category: 'Básico' });

  const card = { background: t.cardBg, border: `1px solid ${t.border}` };
  const muted = { color: t.textMuted };
  const accent = { color: t.accent };

  const openNew = () => {
    setEditId(null);
    setForm({ name: '', price: '', duration: '30', category: t.role === 'barbero' ? 'Básico' : 'Corte' });
    setShowModal(true);
  };

  const openEdit = (id: string) => {
    const s = services.find((x) => x.id === id);
    if (!s) return;
    setEditId(id);
    setForm({ name: s.name, price: String(s.price), duration: String(s.duration), category: s.category });
    setShowModal(true);
  };

  const handleSave = () => {
    const price = parseFloat(form.price);
    const duration = parseInt(form.duration, 10);
    if (!form.name.trim() || isNaN(price) || isNaN(duration)) return;
    if (editId) {
      updateService(editId, { name: form.name, price, duration, category: form.category });
    } else {
      addService({ name: form.name, price, duration, category: form.category });
    }
    setShowModal(false);
  };

  const todayRequests = services.reduce(
    (n, sv) => n + getServiceRequests(sv.id).filter((a) => a.date === today).length,
    0,
  );
  const tomorrowRequests = services.reduce(
    (n, sv) => n + getServiceRequests(sv.id).filter((a) => a.date === addDays(1)).length,
    0,
  );

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p style={muted} className="text-xs font-bold uppercase tracking-widest mb-1">Catálogo</p>
        <h2 style={{ color: t.text }} className="text-3xl font-black">Servicios & Solicitudes</h2>
        <p style={muted} className="text-sm mt-1">Gestiona tus servicios y confirma solicitudes pendientes.</p>
      </motion.div>

      <div className="flex gap-4 mb-6 overflow-x-auto pb-1">
        {[
          { label: 'Servicios activos', value: services.filter((s) => s.active).length },
          { label: 'Solicitudes hoy', value: todayRequests },
          { label: 'Mañana', value: tomorrowRequests },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl px-5 py-4 flex-shrink-0" style={card}>
            <p style={muted} className="text-[10px] font-black uppercase tracking-widest mb-1">{s.label}</p>
            <p style={{ color: t.text }} className="text-2xl font-black">{s.value}</p>
          </div>
        ))}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={openNew}
          className="rounded-2xl px-5 py-4 flex items-center gap-2 flex-shrink-0"
          style={{ background: t.accent, color: '#fff' }}
        >
          <Plus size={16} />
          <span className="text-xs font-black uppercase tracking-wider">Nuevo Servicio</span>
        </motion.button>
      </div>

      <div className="space-y-4">
        {services.map((sv, i) => {
          const requests = getServiceRequests(sv.id);
          return (
            <motion.div
              key={sv.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`rounded-2xl overflow-hidden ${!sv.active ? 'opacity-60' : ''}`}
              style={card}
            >
              <button
                onClick={() => setExpanded(expanded === sv.id ? null : sv.id)}
                className="w-full flex items-center justify-between p-6 text-left transition-all"
                style={{ background: expanded === sv.id ? t.accentLight : 'transparent' }}
              >
                <div className="flex items-center gap-5">
                  <motion.div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg"
                    style={{ background: t.accentMid, color: t.accent }}
                    whileHover={{ rotate: 5 }}
                  >
                    {sv.name.charAt(0)}
                  </motion.div>
                  <div>
                    <h3 style={{ color: t.text }} className="font-black text-lg leading-tight">{sv.name}</h3>
                    <span
                      className="text-[10px] font-black px-2 py-0.5 rounded-full"
                      style={{ background: t.accentLight, color: t.accent }}
                    >
                      {sv.category}
                    </span>
                    {!sv.active && (
                      <span className="text-[10px] font-black ml-2 text-zinc-500">(inactivo)</span>
                    )}
                  </div>
                </div>
                <motion.div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p style={accent} className="font-black text-xl">${sv.price}</p>
                    <p style={muted} className="text-xs flex items-center gap-1 justify-end">
                      <Clock size={11} /> {sv.duration} min
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(sv.id); }}
                    className="p-2 rounded-lg hidden sm:block"
                    style={{ background: t.accentLight, color: t.accent }}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleServiceActive(sv.id); }}
                    className="p-2 rounded-lg hidden sm:block"
                    style={{ background: t.accentLight, color: t.accent }}
                    title={sv.active ? 'Desactivar' : 'Activar'}
                  >
                    <Trash2 size={14} />
                  </button>
                  <span
                    className="text-xs font-black px-3 py-1 rounded-full"
                    style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}
                  >
                    {requests.length} pendiente{requests.length !== 1 ? 's' : ''}
                  </span>
                  {expanded === sv.id ? <ChevronUp size={18} style={accent} /> : <ChevronDown size={18} style={muted} />}
                </motion.div>
              </button>

              <AnimatePresence>
                {expanded === sv.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <div className="px-6 pb-6" style={{ borderTop: `1px solid ${t.border}` }}>
                      <p style={muted} className="text-[10px] font-black uppercase tracking-widest py-4">
                        Solicitudes pendientes
                      </p>
                      {requests.length === 0 ? (
                        <p style={muted} className="text-sm py-4">No hay solicitudes para este servicio.</p>
                      ) : (
                        <div className="space-y-3">
                          {requests.map((req) => (
                            <motion.div
                              key={req.id}
                              layout
                              className="flex items-center justify-between p-4 rounded-xl"
                              style={{
                                background: t.isDark ? 'rgba(255,255,255,0.04)' : '#F9F9FB',
                                border: `1px solid ${t.border}`,
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <motion.div
                                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black"
                                  style={{ background: t.accentMid, color: t.accent }}
                                >
                                  {req.clientAvatar}
                                </motion.div>
                                <div>
                                  <p style={{ color: t.text }} className="font-black text-sm">{req.clientName}</p>
                                  <p style={muted} className="text-xs flex items-center gap-1">
                                    <Clock size={11} />
                                    {req.date === today ? 'Hoy' : req.date} — {req.time}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => updateAppointmentStatus(req.id, 'confirmed')}
                                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black hover:scale-105 transition-all"
                                  style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}
                                >
                                  <CheckCircle size={14} /> Confirmar
                                </button>
                                <button
                                  onClick={() => updateAppointmentStatus(req.id, 'cancelled')}
                                  className="p-2 rounded-xl hover:scale-110 transition-all"
                                  style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}
                                >
                                  <XCircle size={16} />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              className="w-full max-w-md rounded-3xl p-8"
              style={{ background: t.isDark ? '#1a1a1a' : '#fff', border: `1px solid ${t.border}` }}
            >
              <h3 style={{ color: t.text }} className="font-black text-2xl mb-6">
                {editId ? 'Editar Servicio' : 'Nuevo Servicio'}
              </h3>
              {[
                { key: 'name', label: 'Nombre', type: 'text' },
                { key: 'price', label: 'Precio ($)', type: 'number' },
                { key: 'duration', label: 'Duración (min)', type: 'number' },
                { key: 'category', label: 'Categoría', type: 'text' },
              ].map((f) => (
                <div key={f.key} className="mb-4">
                  <label style={muted} className="text-[10px] font-black uppercase tracking-widest block mb-1.5">
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    value={(form as Record<string, string>)[f.key]}
                    onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }}
                  />
                </div>
              ))}
              <motion.div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-2xl text-sm font-black"
                  style={{ background: t.accentLight, color: t.accent }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 rounded-2xl text-sm font-black"
                  style={{ background: t.accent, color: '#fff' }}
                >
                  Guardar
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
