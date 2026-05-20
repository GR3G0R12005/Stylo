import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Star, MessageSquare, Calendar, Download, X } from 'lucide-react';
import { OwnerTheme } from '../ownerTheme';
import { useOwnerData } from '../../../context/OwnerDataContext';
import { useToast } from '../ui/Toast';
import { STATUS_LABEL } from '../../../data/ownerSeed';

interface Props { theme: OwnerTheme; onNavigate?: (section: string) => void; }

export default function ClientesView({ theme: t, onNavigate }: Props) {
  const { clients, appointments } = useOwnerData();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [historyClient, setHistoryClient] = useState<string | null>(null);

  const filtered = clients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStr = monthStart.toISOString().slice(0, 10).slice(0, 7);

  const card = { background: t.cardBg, border: `1px solid ${t.border}` };
  const muted = { color: t.textMuted };
  const accent = { color: t.accent };

  const handleExportCSV = () => {
    const headers = ['ID', 'Nombre', 'Visitas', 'Ultima Visita', 'Gastado', 'Rating'];
    const rows = filtered.map((c) => [c.id, c.name, c.visits, c.lastVisit, c.spent, c.rating]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + headers.join(',') + '\n' + rows.map((e) => e.join(',')).join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `clientes_${t.role}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast('CSV exportado correctamente');
  };

  const clientHistory = historyClient
    ? appointments.filter((a) => a.clientName === historyClient)
    : [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p style={muted} className="text-xs font-bold uppercase tracking-widest mb-1">Base de datos</p>
        <h2 style={{ color: t.text }} className="text-3xl font-black">Mis Clientes</h2>
      </motion.div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Clientes', value: clients.length },
          { label: 'Activos (mes)', value: clients.filter((c) => c.lastVisit.startsWith(monthStr)).length },
          { label: 'VIP (10+ visitas)', value: clients.filter((c) => c.visits >= 10).length },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ scale: 1.02 }}
            className="rounded-2xl p-5"
            style={card}
          >
            <p style={muted} className="text-[10px] font-black uppercase tracking-widest mb-1">{s.label}</p>
            <p style={{ color: t.text }} className="text-3xl font-black">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={muted} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente..."
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium outline-none"
            style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }}
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-5 rounded-xl font-bold text-sm"
          style={{ background: t.accent, color: t.isDark ? '#000' : '#fff' }}
        >
          <Download size={18} />
          <span className="hidden sm:inline">Exportar CSV</span>
        </motion.button>
      </div>

      <motion.div className="rounded-2xl overflow-hidden" style={card}>
        <div className="hidden sm:grid grid-cols-5 px-5 py-3" style={{ borderBottom: `1px solid ${t.border}` }}>
          {['Cliente', 'Visitas', 'Última Visita', 'Total Gastado', 'Acciones'].map((h) => (
            <p key={h} style={muted} className="text-[10px] font-black uppercase tracking-widest">{h}</p>
          ))}
        </div>
        {filtered.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ backgroundColor: t.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}
            className="grid grid-cols-1 sm:grid-cols-5 items-center gap-3 sm:gap-0 px-5 py-4"
            style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${t.border}` : 'none' }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black"
                style={{ background: t.accentLight, color: t.accent }}
                whileHover={{ scale: 1.1 }}
              >
                {c.avatar}
              </motion.div>
              <div>
                <p style={{ color: t.text }} className="font-black text-sm">{c.name}</p>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={10} fill={j < c.rating ? '#f59e0b' : 'none'} style={{ color: j < c.rating ? '#f59e0b' : t.textMuted }} />
                  ))}
                </div>
              </div>
            </div>
            <span
              className="px-3 py-1 rounded-full text-xs font-black w-fit"
              style={{ background: c.visits >= 10 ? t.accentLight : 'transparent', color: c.visits >= 10 ? t.accent : t.textMuted }}
            >
              {c.visits} citas {c.visits >= 10 ? '⭐ VIP' : ''}
            </span>
            <p style={muted} className="text-xs font-medium">{c.lastVisit}</p>
            <p style={{ color: t.text }} className="font-black text-sm">${c.spent}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setHistoryClient(c.name)}
                className="p-2 rounded-lg hover:scale-110 transition-all"
                style={{ background: t.accentLight, color: t.accent }}
                title="Ver historial"
              >
                <Calendar size={15} />
              </button>
              <button
                onClick={() => {
                  toast(`Mensaje enviado a ${c.name}`, 'info');
                  onNavigate?.('citas');
                }}
                className="p-2 rounded-lg hover:scale-110 transition-all"
                style={{ background: t.accentLight, color: t.accent }}
                title="Enviar mensaje"
              >
                <MessageSquare size={15} />
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {historyClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
            onClick={(e) => e.target === e.currentTarget && setHistoryClient(null)}
          >
            <motion.div
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.92 }}
              className="w-full max-w-lg rounded-3xl p-8 max-h-[80vh] overflow-y-auto"
              style={{ background: t.isDark ? '#1a1a1a' : '#fff', border: `1px solid ${t.border}` }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 style={{ color: t.text }} className="font-black text-xl">Historial — {historyClient}</h3>
                <button onClick={() => setHistoryClient(null)} className="p-2 rounded-full" style={{ background: t.accentLight, color: t.accent }}>
                  <X size={16} />
                </button>
              </div>
              {clientHistory.length === 0 ? (
                <p style={muted} className="text-sm">Sin citas registradas.</p>
              ) : (
                <div className="space-y-3">
                  {clientHistory.map((a) => (
                    <div key={a.id} className="p-4 rounded-xl" style={{ background: t.accentLight, border: `1px solid ${t.border}` }}>
                      <p style={{ color: t.text }} className="font-bold text-sm">{a.service}</p>
                      <p style={muted} className="text-xs">{a.date} · {a.time} · ${a.price}</p>
                      <span className="text-[10px] font-black" style={{ color: t.accent }}>{STATUS_LABEL[a.status]}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
