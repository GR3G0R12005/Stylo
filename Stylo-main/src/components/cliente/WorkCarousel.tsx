import React from 'react';
import { motion } from 'motion/react';

interface WorkCarouselProps {
  type: 'barberia' | 'salon';
}

export default function WorkCarousel({ type }: WorkCarouselProps) {
  const barberImages = [
    'https://images.unsplash.com/photo-1593702275687-f8b402bf1fb5?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=800',
  ];

  const salonImages = [
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1492162300535-c6966b93dc91?auto=format&fit=crop&q=80&w=800',
  ];

  const images = type === 'barberia' ? barberImages : salonImages;

  return (
    <div className="relative w-full overflow-hidden mb-8">
      <div className="flex gap-4 overflow-x-auto pb-4 px-2 snap-x scrollbar-hide">
        {images.map((img, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex-shrink-0 w-64 h-80 rounded-[2rem] overflow-hidden snap-center group shadow-md"
          >
            <img 
              src={img} 
              alt={`Trabajo ${i + 1}`} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        ))}
      </div>
      
      <div className="absolute right-4 bottom-8 flex gap-1">
        {images.map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full bg-white/50" />
        ))}
      </div>
    </div>
  );
}
