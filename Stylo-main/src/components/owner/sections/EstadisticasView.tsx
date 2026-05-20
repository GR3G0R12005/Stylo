import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Download } from 'lucide-react';
import { OwnerTheme } from '../ownerTheme';
import { useOwnerData } from '../../../context/OwnerDataContext';

interface Props { theme: OwnerTheme; }

export default function EstadisticasView({ theme: t }: Props) {
  const { appointments, services, reviews, transactions } = useOwnerData();

  const completed = appointments.filter((a) => a.status === 'completed' || a.status === 'confirmed');
  const totalRevenue = completed.reduce((s, a) => s + a.price, 0);
  const avgTicket = completed.length ? Math.round(totalRevenue / completed.length) : 0;
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  const servicePop = useMemo(() => {
    const counts: Record<string, number> = {};
    completed.forEach((a) => {
      counts[a.service] = (counts[a.service] || 0) + 1;
    });
    const total = Object.values(counts).reduce((s, n) => s + n, 0) || 1;
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [completed]);

  const monthly = useMemo(() => {
    const months: { m: string; v: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const v = appointments
        .filter((a) => a.date.startsWith(prefix) && a.status !== 'cancelled')
        .reduce((s, a) => s + a.price, 0);
      months.push({
        m: d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', ''),
        v,
      });
    }
    return months;
  }, [appointments]);

  const maxMonth = Math.max(...monthly.map((m) => m.v), 1);

  const hourHeat = useMemo(() => {
    const hours = ['09', '10', '11', '12', '13', '14', '15', '16', '17', '18'];
    const counts = hours.map((h) =>
      appointments.filter((a) => a.time.startsWith(h) && a.status !== 'cancelled').length,
    );
    const max = Math.max(...counts, 1);
    return { hours, counts, max };
  }, [appointments]);

  const card = { background: t.cardBg, border: `1px solid ${t.border}` };
  const muted = { color: t.textMuted };
  const accent = { color: t.accent };

  const handleExportReport = () => {
    const headers = ['Mes', 'Ingresos (USD)'];
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      headers.join(',') +
      '\n' +
      monthly.map((m) => `${m.m},${m.v}`).join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `reporte_${t.role}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <p style={muted} className="text-xs font-bold uppercase tracking-widest mb-1">Métricas</p>
          <h2 style={{ color: t.text }} className="text-3xl font-black">Estadísticas</h2>
        </motion.div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={handleExportReport}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm"
          style={{ background: t.accent, color: t.isDark ? '#000' : '#fff' }}
        >
          <Download size={18} />
          Exportar Reporte
        </motion.button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Ingresos', value: `$${totalRevenue}`, sub: 'citas confirmadas/completadas' },
          { label: 'Ticket prom.', value: `$${avgTicket}`, sub: 'por servicio' },
          { label: 'Citas activas', value: String(completed.length), sub: `${services.length} servicios` },
          { label: 'Satisfacción', value: `${avgRating}★`, sub: `${reviews.length} reseñas` },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -2 }}
            className="rounded-2xl p-5"
            style={card}
          >
            <p style={muted} className="text-[10px] font-black uppercase tracking-widest mb-2">{k.label}</p>
            <p style={{ color: t.text }} className="text-3xl font-black mb-1">{k.value}</p>
            <p style={muted} className="text-xs">{k.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="rounded-2xl p-6" style={card}>
          <p style={muted} className="text-[10px] font-black uppercase tracking-widest mb-1">Ingresos Mensuales</p>
          <p style={{ color: t.text }} className="text-2xl font-black mb-6">
            ${monthly.reduce((s, m) => s + m.v, 0).toLocaleString()}
            <span style={muted} className="text-sm font-medium ml-2">últimos 6 meses</span>
          </p>
          <div className="flex items-end gap-3 h-36">
            {monthly.map((m, i) => (
              <div key={m.m} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(m.v / maxMonth) * 100}%` }}
                  transition={{ delay: 0.3 + i * 0.08, duration: 0.6 }}
                  className="w-full rounded-t-xl min-h-[4px]"
                  style={{ background: i === monthly.length - 1 ? t.accent : t.accentLight }}
                />
                <span style={muted} className="text-[10px] font-black">{m.m}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-2xl p-6" style={card}>
          <p style={muted} className="text-[10px] font-black uppercase tracking-widest mb-6">Servicios Populares</p>
          {servicePop.length === 0 ? (
            <p style={muted} className="text-sm">Sin datos aún.</p>
          ) : (
            <motion.div className="space-y-5">
              {servicePop.map((s, i) => (
                <div key={s.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span style={{ color: t.text }} className="text-sm font-bold">{s.name}</span>
                    <span style={muted} className="text-xs font-black">{s.count} citas · {s.pct}%</span>
                  </div>
                  <motion.div className="h-2.5 rounded-full overflow-hidden" style={{ background: t.isDark ? 'rgba(255,255,255,0.06)' : '#F0F0F0' }}>
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${s.pct}%` }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      style={{ background: t.accent }}
                    />
                  </motion.div>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-6" style={card}>
        <p style={muted} className="text-[10px] font-black uppercase tracking-widest mb-6">Horas Pico</p>
        <div className="flex items-end gap-3 h-28">
          {hourHeat.hours.map((h, i) => {
            const pct = (hourHeat.counts[i] / hourHeat.max) * 100;
            return (
              <div key={h} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(pct, 8)}%` }}
                  transition={{ delay: 0.5 + i * 0.06 }}
                  className="w-full rounded-t-lg min-h-[4px]"
                  style={{
                    background: pct > 80 ? t.accent : pct > 50 ? t.accentMid : t.accentLight,
                  }}
                />
                <span style={muted} className="text-[10px] font-black">{h}h</span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
