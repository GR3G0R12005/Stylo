import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Star, MessageSquare } from 'lucide-react';
import { Review } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReviewListProps {
  shopId: string;
}

export default function ReviewList({ shopId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'reviews'),
      where('shopId', '==', shopId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
      setReviews(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [shopId]);

  if (loading) return <div className="animate-pulse space-y-4">
    {[1, 2].map(i => <div key={i} className="h-24 bg-zinc-50 rounded-2xl" />)}
  </div>;

  if (reviews.length === 0) return (
    <div className="text-zinc-400 text-center py-10 bg-zinc-50 rounded-[2rem] border border-zinc-100 border-dashed">
      <Star className="w-10 h-10 mx-auto mb-3 opacity-20" />
      <p className="text-sm font-medium">Aún no hay reseñas. ¡Sé el primero!</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="p-6 rounded-[1.8rem] bg-zinc-50 border border-zinc-100 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold">
                {review.clientName?.[0]}
              </div>
              <div>
                <h5 className="font-bold text-sm">{review.clientName}</h5>
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-medium">
                  {review.createdAt?.toDate ? format(review.createdAt.toDate(), 'd MMMM, yyyy', { locale: es }) : 'Reciente'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-3 h-3",
                    i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-200"
                  )}
                />
              ))}
            </div>
          </div>
          <p className="text-zinc-600 text-sm leading-relaxed">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
