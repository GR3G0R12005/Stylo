import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Plus, X } from 'lucide-react';
import { OwnerTheme } from '../ownerTheme';
import { useOwnerData } from '../../../context/OwnerDataContext';

interface Props { theme: OwnerTheme; }

const METHOD_ICONS: Record<string, string> = { Efectivo: '💵', Tarjeta: '💳', Transferencia: '📱' };

export default function PagosView({ theme: t }: Props) {
  const { transactions, addTransaction } = useOwnerData();
  const [showExpense, setShowExpense] = useState(false);
  const [form, setForm] = useState({ client: '', service: '', amount: '', method: 'Efectivo' as const });

  const income = transactions.filter((x) => x.type === 'in').reduce((s, x) => s + x.amount, 0);
  const expense = transactions.filter((x) => x.type === 'out').reduce((s, x) => s + x.amount, 0);

  const card = { background: t.cardBg, border: `1px solid ${t.border}` };
  const muted = { color: t.textMuted };
  const accent = { color: t.accent };

  const handleAddExpense = () => {
    const amount = parseFloat(form.amount);
    if (!form.client.trim() || isNaN(amount)) return;
    addTransaction({
      client: form.client,
      service: form.service || 'Gasto',
      amount,
      date: 'Hoy',
      method: form.method,
      type: 'out',
    });
    setForm({ client: '', service: '', amount: '', method: 'Efectivo' });
    setShowExpense(false);
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex justify-between items-end flex-wrap gap-4">
        <div>
          <p style={muted} className="text-xs font-bold uppercase tracking-widest mb-1">Finanzas</p>
          <h2 style={{ color: t.text }} className="text-3xl font-black">Pagos</h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowExpense(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-black"
          style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <Plus size={16} /> Registrar Gasto
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Ingresos totales', value: `$${income}`, color: '#22c55e', icon: ArrowUpRight },
          { label: 'Gastos totales', value: `$${expense}`, color: '#ef4444', icon: ArrowDownRight },
          { label: 'Balance neto', value: `$${income - expense}`, color: t.accent, icon: TrendingUp },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="rounded-2xl p-6 flex items-center gap-4"
            style={card}
          >
            <motion.div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${s.color}22` }}>
              <s.icon size={22} style={{ color: s.color }} />
            </motion.div>
            <div>
              <p style={muted} className="text-[10px] font-black uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {(['Efectivo', 'Tarjeta', 'Transferencia'] as const).map((method, i) => {
          const total = transactions.filter((x) => x.method === method && x.type === 'in').reduce((s, x) => s + x.amount, 0);
          return (
            <motion.div
              key={method}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.07 }}
              className="rounded-2xl p-5 text-center"
              style={card}
            >
              <div className="text-3xl mb-2">{METHOD_ICONS[method]}</div>
              <p style={muted} className="text-[10px] font-black uppercase tracking-widest mb-1">{method}</p>
              <p style={{ color: t.text }} className="text-xl font-black">${total}</p>
            </motion.div>
          );
        })}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl overflow-hidden" style={card}>
        <div className="p-5" style={{ borderBottom: `1px solid ${t.border}` }}>
          <p style={muted} className="text-[10px] font-black uppercase tracking-widest">Transacciones Recientes</p>
        </div>
        {transactions.map((tx, i) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
            style={{ borderBottom: i < transactions.length - 1 ? `1px solid ${t.border}` : 'none' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: tx.type === 'in' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)' }}>
                {METHOD_ICONS[tx.method]}
              </div>
              <div>
                <p style={{ color: t.text }} className="font-bold text-sm">{tx.client}</p>
                <p style={muted} className="text-xs">{tx.service} · {tx.date}</p>
              </div>
            </div>
            <p className="font-black text-lg" style={{ color: tx.type === 'in' ? '#22c55e' : '#ef4444' }}>
              {tx.type === 'in' ? '+' : '-'}${tx.amount}
            </p>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {showExpense && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
            onClick={(e) => e.target === e.currentTarget && setShowExpense(false)}
          >
            <motion.div
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              className="w-full max-w-md rounded-3xl p-8 relative"
              style={{ background: t.isDark ? '#1a1a1a' : '#fff', border: `1px solid ${t.border}` }}
            >
              <button onClick={() => setShowExpense(false)} className="absolute top-4 right-4 p-2 rounded-full" style={{ background: t.accentLight, color: t.accent }}>
                <X size={16} />
              </button>
              <h3 style={{ color: t.text }} className="font-black text-2xl mb-6">Registrar Gasto</h3>
              {[
                { key: 'client', label: 'Concepto / Proveedor' },
                { key: 'service', label: 'Descripción' },
                { key: 'amount', label: 'Monto ($)', type: 'number' },
              ].map((f) => (
                <motion.div key={f.key} className="mb-4">
                  <label style={muted} className="text-[10px] font-black uppercase tracking-widest block mb-1.5">{f.label}</label>
                  <input
                    type={f.type || 'text'}
                    value={(form as Record<string, string>)[f.key]}
                    onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }}
                  />
                </motion.div>
              ))}
              <select
                value={form.method}
                onChange={(e) => setForm((p) => ({ ...p, method: e.target.value as typeof form.method }))}
                className="w-full px-4 py-3 rounded-xl text-sm mb-6 outline-none"
                style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }}
              >
                <option>Efectivo</option>
                <option>Tarjeta</option>
                <option>Transferencia</option>
              </select>
              <button onClick={handleAddExpense} className="w-full py-3 rounded-2xl text-sm font-black" style={{ background: '#ef4444', color: '#fff' }}>
                Guardar Gasto
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
