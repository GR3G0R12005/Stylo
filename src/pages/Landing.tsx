import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import {
  Scissors,
  Search,
  Star,
  MapPin,
  ArrowRight,
  Sparkles,
  Calendar,
  User,
  X,
} from "lucide-react";

const FEATURED_SPOTS = [
  {
    name: "Stylo Original",
    type: "Barbería",
    rating: "4.9",
    reviews: 128,
    img: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&auto=format&fit=crop&q=60",
  },
  {
    name: "Glamour VIP",
    type: "Salón",
    rating: "4.8",
    reviews: 95,
    img: "https://images.unsplash.com/photo-1521590832167-7bfc1748b565?w=500&auto=format&fit=crop&q=60",
  },
  {
    name: "Fade Master",
    type: "Barbería",
    rating: "5.0",
    reviews: 312,
    img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&auto=format&fit=crop&q=60",
  },
];

export default function Landing() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-zinc-800 selection:text-white">
        {/* Background glow */}
        <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-600/15 blur-[150px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-pink-600/10 blur-[150px] rounded-full" />
        </div>

        {/* Navbar */}
        <nav className="fixed top-0 w-full border-b border-white/5 bg-black/50 backdrop-blur-xl z-50">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-barber-gold text-black rounded-xl">
                <Scissors className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-[0.2em] uppercase">
                STEY<span className="text-barber-gold">LOOK</span>
              </span>
            </div>

            <div>
              <button
                onClick={() => setIsSheetOpen(true)}
                className="px-6 py-2.5 rounded-full bg-white text-black font-black tracking-widest text-[11px] uppercase hover:scale-105 transition-transform"
              >
                Entrar
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black tracking-[0.2em] text-zinc-300 uppercase mb-8 backdrop-blur-md"
          >
            <Sparkles className="w-3 h-3 text-white" />
            Descubre, Reserva y Relájate
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[6rem] font-black uppercase tracking-tighter leading-[0.9] mb-8 px-2"
          >
            Tu Próximo Estilo <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-600">
              A Un Clic De Distancia
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mb-12 font-medium leading-relaxed px-4 sm:px-0"
          >
            Encuentra los mejores barberos y salones de belleza de tu ciudad.
            Lee reseñas reales, mira sus portafolios y reserva tu cita 24/7 sin
            hacer una sola llamada.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full max-w-sm sm:max-w-xs justify-center px-4 sm:px-0"
          >
            <button
              onClick={() => setIsSheetOpen(true)}
              className="flex-1 px-6 sm:px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-xl shadow-white/5"
            >
              Comenzar <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </section>

        {/* Featured Professionals */}
        <section id="descubrir" className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-end justify-between mb-10 sm:mb-12 gap-6">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">
                Destacados esta semana
              </h2>
              <p className="text-zinc-400 font-medium text-sm sm:text-base">
                Los profesionales más valorados por nuestra comunidad.
              </p>
            </div>
            <button
              onClick={() => setIsSheetOpen(true)}
              className="text-xs font-bold uppercase tracking-widest hover:text-zinc-300 flex items-center gap-2 cursor-pointer bg-transparent border-none text-white"
            >
              Ver Todos <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {FEATURED_SPOTS.map((spot, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative rounded-[2rem] bg-zinc-900 border border-zinc-800 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.25)] hover:-translate-y-1 hover:shadow-[0_20px_50px_rgb(0,0,0,0.4)] hover:border-zinc-700 transition-all duration-500 cursor-pointer"
              >
                <div className="h-52 overflow-hidden relative">
                  <img
                    src={spot.img}
                    alt={spot.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {/* Gradient overlay for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent" />
                  <div className="absolute top-4 right-4 bg-zinc-900/80 px-3 py-1.5 rounded-2xl flex items-center gap-1.5 border border-zinc-700">
                    <Star className="w-3.5 h-3.5 text-barber-gold fill-current" />
                    <span className="text-xs font-black">{spot.rating}</span>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
                    {spot.type}
                  </p>
                  <h3 className="text-xl font-black mb-1 text-white">
                    {spot.name}
                  </h3>
                  <p className="text-xs text-zinc-500 font-medium mb-4">
                    {spot.reviews} reseñas verificadas
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, j) => (
                        <Star
                          key={j}
                          className="w-3 h-3 fill-barber-gold text-barber-gold"
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => setIsSheetOpen(true)}
                      className="px-5 py-2 bg-white text-black rounded-full text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors cursor-pointer shadow-lg shadow-white/5"
                    >
                      Reservar
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How it works for clients */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white/5 border-y border-white/10">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight mb-12 sm:mb-16">
              ¿Por qué usar Steylook?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12">
              {[
                {
                  icon: Search,
                  title: "1. Descubre",
                  desc: "Explora fotos reales de los trabajos de los estilistas antes de elegir.",
                },
                {
                  icon: Calendar,
                  title: "2. Reserva 24/7",
                  desc: "Ve los horarios disponibles en tiempo real y aparta tu turno al instante.",
                },
                {
                  icon: Sparkles,
                  title: "3. Disfruta",
                  desc: "Recibe recordatorios en tu celular. Solo llega y siéntate en la silla.",
                },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="w-20 h-20 mx-auto rounded-full bg-white/10 flex items-center justify-center mb-6 border border-white/10">
                    <s.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                  <p className="text-zinc-400 leading-relaxed font-medium">
                    {s.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* B2B Section - For Businesses */}
        <section
          id="negocios"
          className="py-20 sm:py-32 px-4 sm:px-6 max-w-7xl mx-auto relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-pink-900/20 rounded-[2rem] sm:rounded-[3rem] blur-3xl -z-10" />
          <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 sm:gap-12">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-[10px] font-black tracking-widest uppercase mb-4 sm:mb-6 border border-white/10">
                Para Profesionales
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight mb-4 sm:mb-6 leading-none">
                Impulsa tu <br /> Barbería o Salón
              </h2>
              <p className="text-base sm:text-lg text-zinc-400 mb-6 sm:mb-8 font-medium max-w-md mx-auto md:mx-0">
                Únete a Steylook y obtén un sistema de reservas automático,
                métricas de ingresos en tiempo real y exposición a miles de
                nuevos clientes buscando un corte en tu área.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  to="/business-selection"
                  className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-full hover:scale-105 transition-transform flex items-center justify-center gap-2"
                >
                  Afiliar mi Negocio <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => setIsSheetOpen(true)}
                  className="px-6 sm:px-8 py-3.5 sm:py-4 bg-transparent border border-white/20 text-white font-bold uppercase tracking-widest text-xs rounded-full hover:bg-white/5 transition-colors flex items-center justify-center cursor-pointer"
                >
                  Iniciar Sesión (Negocio)
                </button>
              </div>
            </div>

            {/* Dashboard Preview Mockup */}
            <div className="flex-1 w-full relative max-w-md md:max-w-full">
              <div className="aspect-[4/3] rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-3 sm:p-4 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-8 bg-black border-b border-zinc-800 flex items-center px-4 gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                <div className="mt-6 space-y-4">
                  {/* Premium shimmer skeletons — upgraded from animate-pulse */}
                  <div className="h-8 w-3/4 shimmer-loader" />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-20 shimmer-loader" />
                    <div
                      className="h-20 shimmer-loader"
                      style={{ animationDelay: "0.15s" }}
                    />
                    <div
                      className="h-20 shimmer-loader"
                      style={{ animationDelay: "0.3s" }}
                    />
                  </div>
                  <div
                    className="h-32 w-full shimmer-loader"
                    style={{ animationDelay: "0.1s" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 sm:py-12 text-center text-zinc-500 text-[10px] font-black uppercase tracking-widest border-t border-white/5 mt-10 px-4">
          <div className="flex justify-center items-center gap-3 mb-4 sm:mb-6">
            <Scissors className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" /> STEYLOOK
          </div>
          <p className="px-4">
            © {new Date().getFullYear()} Steylook Global Group. Todos los
            derechos reservados.
          </p>
        </footer>
      </div>
      <RoleBottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
    </>
  );
}

function RoleBottomSheet({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9998] cursor-pointer"
          />

          {/* Wrapper for responsive centering */}
          <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center p-0 md:p-4 sm:md:p-6 pointer-events-none">
            {/* Sheet / Modal */}
            <motion.div
              initial={
                isMobile
                  ? { y: "100%", scale: 1, opacity: 1 }
                  : { y: 0, scale: 0.9, opacity: 0 }
              }
              animate={
                isMobile
                  ? { y: 0, scale: 1, opacity: 1 }
                  : { y: 0, scale: 1, opacity: 1 }
              }
              exit={
                isMobile
                  ? { y: "100%", scale: 1, opacity: 1 }
                  : { y: 0, scale: 0.9, opacity: 0 }
              }
              transition={
                isMobile
                  ? { type: "spring", stiffness: 260, damping: 28 }
                  : { duration: 0.25, ease: "easeOut" }
              }
              className="pointer-events-auto w-full max-w-md bg-zinc-900 border-t md:border border-white/10 rounded-t-[2rem] md:rounded-[2.5rem] p-5 sm:p-6 md:p-8 shadow-2xl relative"
            >
              {/* Top pull handle - only on mobile */}
              {isMobile && (
                <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto mb-6" />
              )}

              {/* Close Button - only on desktop */}
              {!isMobile && (
                <button
                  onClick={onClose}
                  className="absolute top-4 sm:top-6 right-4 sm:right-6 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition-colors cursor-pointer"
                  aria-label="Cerrar"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}

              <div className="text-center mb-6 sm:mb-8">
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-2 text-white">
                  Comenzar en Steylook
                </h3>
                <p className="text-zinc-400 text-xs sm:text-sm font-medium">
                  Elige cómo quieres continuar
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <Link
                  to="/auth/client"
                  onClick={onClose}
                  className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="text-left min-w-0">
                      <h4 className="font-bold text-white text-sm sm:text-base">Soy Cliente</h4>
                      <p className="text-[10px] sm:text-xs text-zinc-400">
                        Buscar servicios y reservar citas
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:translate-x-1 transition-transform shrink-0" />
                </Link>

                <Link
                  to="/auth/business?type=barbero"
                  onClick={onClose}
                  className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                      <Scissors className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="text-left min-w-0">
                      <h4 className="font-bold text-white text-sm sm:text-base">Soy Barbero</h4>
                      <p className="text-[10px] sm:text-xs text-zinc-400">
                        Gestionar barbería y mis turnos
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:translate-x-1 transition-transform shrink-0" />
                </Link>

                <Link
                  to="/auth/business?type=salonera"
                  onClick={onClose}
                  className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400 shrink-0">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="text-left min-w-0">
                      <h4 className="font-bold text-white text-sm sm:text-base">
                        Soy Salón de Belleza
                      </h4>
                      <p className="text-[10px] sm:text-xs text-zinc-400">
                        Administrar salón y mi equipo
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:translate-x-1 transition-transform shrink-0" />
                </Link>
              </div>

              <button
                onClick={onClose}
                className="w-full mt-4 sm:mt-6 py-3 sm:py-4 bg-zinc-800 text-zinc-300 font-bold text-[10px] sm:text-xs uppercase tracking-widest rounded-xl hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
