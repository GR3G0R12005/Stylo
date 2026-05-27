import React, { useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Star, Send } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ReviewFormProps {
  shopId: string;
  clientId: string;
  clientName: string;
  onSuccess: () => void;
}

export default function ReviewForm({ shopId, clientId, clientName, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        shopId,
        clientId,
        clientName,
        rating,
        comment,
        createdAt: serverTimestamp()
      });
      onSuccess();
    } catch (err) {
      console.error("Error submitting review:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-8 bg-zinc-900 rounded-[2.5rem] text-white">
      <div>
        <h4 className="text-xl font-black tracking-tight mb-2">¿Cómo fue tu experiencia?</h4>
        <p className="text-zinc-400 text-sm">Tu opinión ayuda a otros a encontrar el mejor estilo.</p>
      </div>

      <div className="flex items-center gap-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="transition-transform hover:scale-125 active:scale-95"
          >
            <Star
              className={cn(
                "w-10 h-10 transition-colors",
                star <= rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-700"
              )}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Escribe tu reseña aquí..."
        className="w-full bg-zinc-800 border border-zinc-700 rounded-3xl p-5 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-700 transition-all min-h-[120px] font-medium"
      />

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-theme-primary text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-theme-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        Publicar Reseña <Send className="w-4 h-4" />
      </button>
    </form>
  );
}
