import React from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { Scissors, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

export default function BusinessSelection() {
  const navigate = useNavigate();

  const BUSINESS_TYPES = [
    {
      id: 'barbero',
      label: 'Barbería',
      description: 'Gestiona tu barbería, citas, empleados y servicios',
      icon: Scissors,
      color: 'from-amber-600 to-amber-700',
      accent: 'bg-amber-500',
    },
    {
      id: 'salonera',
      label: 'Salón de Belleza',
      description: 'Administra tu salón, clientes, servicios y promociones',
      icon: Sparkles,
      color: 'from-pink-600 to-pink-700',
      accent: 'bg-pink-500',
    },
  ];

  return (
    <div className="min-h-screen min-h-[100dvh] bg-black text-white flex flex-col items-center justify-center p-4 sm:p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 to-black">
      {/* Background glow */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-amber-600/15 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-pink-600/10 blur-[150px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 sm:mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-xs uppercase tracking-widest font-semibold">Volver</span>
        </Link>

        <div className="text-center mb-12 sm:mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black uppercase tracking-tighter leading-tight mb-4"
          >
            ¿Qué tipo de negocio tienes?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-zinc-400 font-light max-w-2xl mx-auto"
          >
            Selecciona tu tipo de negocio para continuar
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {BUSINESS_TYPES.map((business, i) => {
            const Icon = business.icon;
            return (
              <motion.button
                key={business.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.3 }}
                onClick={() => navigate(`/auth/business?type=${business.id}`)}
                className="group relative h-full"
              >
                <div className="relative h-full flex flex-col p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 flex-shrink-0 transition-all group-hover:scale-110 ${business.accent}`}>
                    <Icon className="w-8 h-8" color={business.id === 'barbero' ? '#000' : '#fff'} />
                  </div>

                  <h3 className="text-2xl font-black mb-2 text-left">{business.label}</h3>
                  <p className="text-zinc-400 font-light text-sm text-left flex-1 mb-6">
                    {business.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white opacity-70">Continuar</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
