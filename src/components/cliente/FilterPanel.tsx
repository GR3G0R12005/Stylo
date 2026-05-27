import React from 'react';
import { motion } from 'motion/react';
import { Star, DollarSign, Clock, X, SlidersHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface FilterState {
  category: string;
  minRating: number;
  maxPrice: number;
  onlyAvailable: boolean;
}

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onClose: () => void;
}

const CATEGORIES = ['Todos', 'Corte', 'Barba', 'Tinte', 'Tratamiento', 'Color', 'Facial'];

export default function FilterPanel({ filters, onFilterChange, onClose }: FilterPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white rounded-[2.5rem] border border-theme-secondary/10 shadow-2xl p-8 sticky top-24 z-20 w-full lg:max-w-xs h-fit"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-theme-primary" />
          <h3 className="text-xl font-black tracking-tight">Filtros</h3>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-zinc-50 rounded-full lg:hidden">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-10">
        {/* Category */}
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-theme-secondary mb-4">Especialidad</h4>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => onFilterChange({ ...filters, category: cat })}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                  filters.category === cat
                    ? "bg-theme-primary text-white border-theme-primary shadow-lg shadow-theme-primary/20"
                    : "bg-zinc-50 text-zinc-500 border-zinc-100 hover:border-theme-primary/30"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-theme-secondary mb-4">Calificación mínima</h4>
          <div className="grid grid-cols-2 gap-2">
            {[3, 4, 4.5].map(rating => (
              <button
                key={rating}
                onClick={() => onFilterChange({ ...filters, minRating: filters.minRating === rating ? 0 : rating })}
                className={cn(
                  "p-4 rounded-2xl text-sm font-bold transition-all border flex items-center justify-center gap-2",
                  filters.minRating === rating
                    ? "bg-theme-primary text-white border-theme-primary shadow-lg shadow-theme-primary/20 scale-105"
                    : "bg-zinc-50 text-zinc-500 border-zinc-100"
                )}
              >
                <Star className={cn("w-4 h-4", filters.minRating === rating ? "fill-white" : "fill-yellow-400 text-yellow-400")} />
                {rating}+
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-theme-secondary mb-4">Rango de Precio</h4>
          <div className="flex items-center justify-between gap-2">
            {[1, 2, 3].map(level => (
              <button
                key={level}
                onClick={() => onFilterChange({ ...filters, maxPrice: level })}
                className={cn(
                  "flex-1 p-4 rounded-2xl transition-all border flex items-center justify-center gap-0.5",
                  filters.maxPrice === level
                    ? "bg-theme-primary text-white border-theme-primary shadow-lg shadow-theme-primary/20 scale-110 z-10"
                    : "bg-zinc-50 text-zinc-400 border-zinc-100"
                )}
              >
                {[...Array(level)].map((_, i) => (
                  <DollarSign key={i} className="w-5 h-5 flex-shrink-0" />
                ))}
              </button>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div className="pt-4 border-t border-zinc-50">
          <label className="flex items-center justify-between cursor-pointer group">
            <div>
              <p className="font-bold text-sm text-zinc-900 group-hover:text-theme-primary transition-colors">Disponible HOY</p>
              <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Ver solo citas libres</p>
            </div>
            <div 
              onClick={() => onFilterChange({ ...filters, onlyAvailable: !filters.onlyAvailable })}
              className={cn(
                "w-12 h-6 rounded-full relative transition-all duration-300",
                filters.onlyAvailable ? "bg-theme-primary" : "bg-zinc-200"
              )}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300",
                filters.onlyAvailable ? "right-1" : "left-1"
              )} />
            </div>
          </label>
        </div>

        {/* Reset */}
        <button
          onClick={() => onFilterChange({ category: 'Todos', minRating: 0, maxPrice: 3, onlyAvailable: false })}
          className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-theme-primary transition-colors"
        >
          Limpiar todos los filtros
        </button>
      </div>
    </motion.div>
  );
}
