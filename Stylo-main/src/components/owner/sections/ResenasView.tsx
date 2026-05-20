import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, MessageSquare } from 'lucide-react';
import { OwnerTheme } from '../ownerTheme';
import { useOwnerData } from '../../../context/OwnerDataContext';

interface Props { theme: OwnerTheme; }

export default function ResenasView({ theme: t }: Props) {
  const { reviews, replyReview } = useOwnerData();
  const [replyOpen, setReplyOpen] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '0';
  const distribution = [5, 4, 3, 2, 1].map((r) => ({
    stars: r,
    count: reviews.filter((rv) => rv.rating === r).length,
    pct: reviews.length ? (reviews.filter((rv) => rv.rating === r).length / reviews.length) * 100 : 0,
  }));

  const card = { background: t.cardBg, border: `1px solid ${t.border}` };
  const muted = { color: t.textMuted };
  const accent = { color: t.accent };

  const submitReply = (id: string) => {
    if (!replyText.trim()) return;
    replyReview(id, replyText.trim());
    setReplyOpen(null);
    setReplyText('');
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p style={muted} className="text-xs font-bold uppercase tracking-widest mb-1">Opiniones</p>
        <h2 style={{ color: t.text }} className="text-3xl font-black">Reseñas</h2>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-8 text-center flex flex-col items-center justify-center"
          style={card}
        >
          <p style={accent} className="text-7xl font-black mb-2">{avgRating}</p>
          <div className="flex gap-1 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={20} fill="#f59e0b" style={{ color: '#f59e0b' }} />
            ))}
          </div>
          <p style={muted} className="text-sm font-bold">{reviews.length} reseñas</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 rounded-2xl p-6" style={card}>
          <p style={muted} className="text-[10px] font-black uppercase tracking-widest mb-4">Distribución</p>
          <div className="space-y-3">
            {distribution.map((d) => (
              <div key={d.stars} className="flex items-center gap-3">
                <span style={muted} className="text-xs font-black w-4">{d.stars}</span>
                <Star size={12} fill="#f59e0b" style={{ color: '#f59e0b' }} />
                <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: t.isDark ? 'rgba(255,255,255,0.06)' : '#F0F0F0' }}>
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${d.pct}%` }}
                    transition={{ duration: 0.6 }}
                    style={{ background: '#f59e0b' }}
                  />
                </div>
                <span style={muted} className="text-xs font-black w-4">{d.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="space-y-4">
        {reviews.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.005 }}
            className="rounded-2xl p-6"
            style={card}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-black" style={{ background: t.accentLight, color: t.accent }}>
                  {r.avatar}
                </div>
                <div>
                  <p style={{ color: t.text }} className="font-black text-sm">{r.client}</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={11} fill={j < r.rating ? '#f59e0b' : 'none'} style={{ color: j < r.rating ? '#f59e0b' : t.textMuted }} />
                    ))}
                  </div>
                </div>
              </div>
              <span style={muted} className="text-[10px] font-bold">{r.date}</span>
            </div>
            <p style={{ color: t.textSecondary }} className="text-sm leading-relaxed mb-4">{r.comment}</p>

            {r.reply && (
              <motion.div className="rounded-xl p-4 mb-3" style={{ background: t.accentLight, border: `1px solid ${t.border}` }}>
                <p style={accent} className="text-[10px] font-black uppercase tracking-widest mb-1">Tu respuesta</p>
                <p style={{ color: t.textSecondary }} className="text-xs">{r.reply}</p>
              </motion.div>
            )}

            {!r.reply && (
              replyOpen === r.id ? (
                <div className="space-y-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={2}
                    placeholder="Escribe tu respuesta..."
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                    style={{ background: t.inputBg, border: `1.5px solid ${t.border}`, color: t.text }}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setReplyOpen(null)} className="px-4 py-2 rounded-xl text-xs font-black" style={{ background: t.accentLight, color: t.accent }}>
                      Cancelar
                    </button>
                    <button onClick={() => submitReply(r.id)} className="px-4 py-2 rounded-xl text-xs font-black" style={{ background: t.accent, color: '#fff' }}>
                      Publicar
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setReplyOpen(r.id)} className="flex items-center gap-2 text-xs font-black" style={accent}>
                  <MessageSquare size={14} /> Responder
                </button>
              )
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
