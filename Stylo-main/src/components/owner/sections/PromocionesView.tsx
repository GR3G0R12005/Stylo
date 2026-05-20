import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Tag, Percent, Clock, X, Check, Trash2 } from 'lucide-react';
import { OwnerTheme } from '../ownerTheme';
import { useOwnerData } from '../../../context/OwnerDataContext';

interface Props { theme: OwnerTheme; }

export default function PromocionesView({ theme: t }: Props) {
  const { promos, addPromo, deletePromo } = useOwnerData();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', discount: '', code: '', expires: '' });

  const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
    active: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e', label: 'Activa' },
    scheduled: { bg: t.accentLight, text: t.accent, label: 'Programada' },
    expired: { bg: 'rgba(161,161,170,0.15)', text: '#71717a', label: 'Expirada' },
  };

  const card = { background: t.cardBg, border: `1px solid ${t.border}` };
  const muted = { color: t.textMuted };
  const accent = { color: t.accent };

  const handleCreate = () => {
    if (!form.title.trim() || !form.code.trim() || !form.expires) return;
    addPromo({
      title: form.title,
      discount: form.discount || '10% OFF',
      code: form.code.toUpperCase(),
      expires: form.expires,
    });
    setForm({ title: '', discount: '', code: '', expires: '' });
    setShowModal(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p style={muted} className="text-xs font-bold uppercase tracking-widest mb-1">Marketing</p>
        <h2 style={{ color: t.text }} className="text-3xl font-black">Promociones</h2>
      </motion.div>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex gap-3">
          {[
            { label: 'Activas', count: promos.filter((p) => p.status === 'active').length },
            { label: 'Programadas', count: promos.filter((p) => p.status === 'scheduled').length },
            { label: 'Expiradas', count: promos.filter((p) => p.status === 'expired').length },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl px-4 py-3 text-center" style={card}>
              <p style={{ color: t.text }} className="text-xl font-black">{s.count}</p>
              <p style={muted} className="text-[10px] font-black uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-black"
          style={{ background: t.accent, color: '#fff' }}
        >
          <Plus size={16} /> Nueva Promoción
        </motion.button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {promos.map((p, i) => {
          const ss = STATUS_STYLE[p.status];
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl p-6 relative overflow-hidden group"
              style={card}
            >
              <button
                onClick={() => deletePromo(p.id)}
                className="absolute top-4 right-4 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}
              >
                <Trash2 size={14} />
              </button>
              <div className="absolute top-0 right-12 p-6 opacity-5">
                <Percent size={80} />
              </div>
              <motion.div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: t.accentLight }}>
                  <Tag size={22} style={accent} />
                </div>
                <span className="text-[10px] font-black px-3 py-1 rounded-full" style={{ background: ss.bg, color: ss.text }}>
                  {ss.label}
                </span>
              </motion.div>
              <h3 style={{ color: t.text }} className="font-black text-xl mb-1">{p.title}</h3>
              <p style={accent} className="text-3xl font-black mb-4">{p.discount}</p>
              <div className="space-y-2">
                <motion.div className="flex items-center justify-between">
                  <span style={muted} className="text-xs">Código</span>
                  <code className="text-xs font-black px-3 py-1 rounded-lg" style={{ background: t.accentMid, color: t.accent }}>
                    {p.code}
                  </code>
                </motion.div>
                <div className="flex items-center justify-between">
                  <span style={muted} className="text-xs flex items-center gap-1">
                    <Clock size={11} /> Expira
                  </span>
                  <span style={{ color: t.text }} className="text-xs font-bold">{p.expires}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={muted} className="text-xs">Usos</span>
                  <span style={accent} className="text-xs font-black">{p.uses} veces</span>
                </div>
              </div>
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
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="w-full max-w-md rounded-3xl p-8 relative"
              style={{ background: t.isDark ? '#1a1a1a' : '#fff', border: `1px solid ${t.border}` }}
            >
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 rounded-full" style={{ background: t.accentLight, color: t.accent }}>
                <X size={16} />
              </button>
              <h3 style={{ color: t.text }} className="font-black text-2xl mb-6">Nueva Promoción</h3>
              {[
                { key: 'title', label: 'Nombre', placeholder: 'Ej: Promo Fin de Semana' },
                { key: 'discount', label: 'Descuento', placeholder: 'Ej: 20% OFF' },
                { key: 'code', label: 'Código', placeholder: 'Ej: PROMO20' },
                { key: 'expires', label: 'Vencimiento', type: 'date' },
              ].map((f) => (
                <div key={f.key} className="mb-4">
                  <label style={muted} className="text-[10px] font-black uppercase tracking-widest block mb-1.5">{f.label}</label>
                  <input
                    type={(f as { type?: string }).type || 'text'}
                    value={(form as Record<string, string>)[f.key]}
                    onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: t.inputBg, border: `1.5px solid ${t.border}`, color: t.text }}
                  />
                </div>
              ))}
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-2xl text-sm font-black" style={{ background: t.accentLight, color: t.accent }}>
                  Cancelar
                </button>
                <button onClick={handleCreate} className="flex-1 py-3 rounded-2xl text-sm font-black" style={{ background: t.accent, color: '#fff' }}>
                  <Check size={16} className="inline mr-2" />Crear
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
