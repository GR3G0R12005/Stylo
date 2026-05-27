import React from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { Scissors, Sparkles, Users, ArrowRight, ArrowLeft } from 'lucide-react';

const ROLES = [
  {
    id: 'cliente',
    label: 'Soy Cliente',
    description: 'Busco y reservo servicios de barbería y salón',
    icon: Users,
    color: 'from-blue-600 to-blue-700',
    accent: 'bg-blue-500',
  },
  {
    id: 'barbero',
    label: 'Tengo Barbería',
    description: 'Gestiona tu barbería, citas y clientes',
    icon: Scissors,
    color: 'from-amber-600 to-amber-700',
    accent: 'bg-amber-500',
  },
  {
    id: 'salonera',
    label: 'Tengo Salón',
    description: 'Administra tu salón de belleza y servicios',
    icon: Sparkles,
    color: 'from-pink-600 to-pink-700',
    accent: 'bg-pink-500',
  },
];

export default function RoleSelection() {
  const navigate = useNavigate();

  const handleRoleSelect = (roleId: string) => {
    navigate(`/register?role=${roleId}`);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-black text-white flex flex-col items-center justify-center p-4 sm:p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 to-black">
      {/* Background glow */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-600/15 blur-[150px] rounded-full" />
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
          <span className="text-xs uppercase tracking-widest font-semibold">Volver al inicio</span>
        </Link>

        <div className="text-center mb-12 sm:mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black uppercase tracking-tighter leading-tight mb-4"
          >
            ¿Qué eres tú?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-zinc-400 font-light max-w-2xl mx-auto"
          >
            Elige tu rol para continuar con el registro
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {ROLES.map((role, i) => {
            const Icon = role.icon;
            return (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.3 }}
                onClick={() => handleRoleSelect(role.id)}
                className="group relative h-full"
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity rounded-3xl pointer-events-none"
                  style={{ backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))` }}
                />
                <div className="relative h-full flex flex-col p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 flex-shrink-0 transition-all group-hover:scale-110 ${role.accent}`}>
                    <Icon className="w-8 h-8" color={role.id === 'barbero' ? '#000' : '#fff'} />
                  </div>

                  <h3 className="text-2xl font-black mb-2 text-left">{role.label}</h3>
                  <p className="text-zinc-400 font-light text-sm text-left flex-1 mb-6">
                    {role.description}
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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-zinc-500 text-sm font-light"
        >
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-white font-medium hover:underline">
            Iniciar sesión
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
