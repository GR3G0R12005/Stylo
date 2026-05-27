import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Scissors, Search, Star, MapPin, ArrowRight, Sparkles, Menu, X, Calendar } from 'lucide-react';

const FEATURED_SPOTS = [
  { name: 'Stylo Original', type: 'Barbería', rating: '4.9', reviews: 128, img: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&auto=format&fit=crop&q=60' },
  { name: 'Glamour VIP', type: 'Salón', rating: '4.8', reviews: 95, img: 'https://images.unsplash.com/photo-1521590832167-7bfc1748b565?w=500&auto=format&fit=crop&q=60' },
  { name: 'Fade Master', type: 'Barbería', rating: '5.0', reviews: 312, img: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&auto=format&fit=crop&q=60' },
];

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-zinc-800 selection:text-white">
      {/* Background glow */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none">
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
            <span className="text-2xl font-black tracking-[0.2em] uppercase">STEY<span className="text-barber-gold">LOOK</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-[11px] font-black tracking-widest uppercase">
            <a href="#descubrir" className="text-zinc-400 hover:text-white transition-colors">Descubrir</a>
            <a href="#negocios" className="text-zinc-400 hover:text-white transition-colors">Soy Negocio</a>
            <Link to="/login" className="text-zinc-400 hover:text-white transition-colors">Iniciar Sesión</Link>
            <Link to="/register?role=cliente" className="px-6 py-2.5 rounded-full bg-white text-black hover:scale-105 transition-transform">
              Crear Cuenta
            </Link>
          </div>

          <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed top-20 left-0 w-full bg-black/95 backdrop-blur-3xl border-b border-white/10 z-40 p-6 flex flex-col gap-6 text-sm font-bold uppercase tracking-widest text-center">
          <a href="#descubrir" onClick={() => setMenuOpen(false)}>Descubrir</a>
          <a href="#negocios" onClick={() => setMenuOpen(false)}>Para Negocios</a>
          <Link to="/login" onClick={() => setMenuOpen(false)}>Iniciar Sesión</Link>
          <Link to="/register?role=cliente" onClick={() => setMenuOpen(false)} className="py-3 bg-white text-black rounded-full">
            Crear Cuenta
          </Link>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black tracking-[0.2em] text-zinc-300 uppercase mb-8 backdrop-blur-md"
        >
          <Sparkles className="w-3 h-3 text-white" />
          Descubre, Reserva y Relájate
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-[6rem] font-black uppercase tracking-tighter leading-[0.9] mb-8"
        >
          Tu Próximo Estilo <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-600">
            A Un Clic De Distancia
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-12 font-medium leading-relaxed"
        >
          Encuentra los mejores barberos y salones de belleza de tu ciudad. Lee reseñas reales, mira sus portafolios y reserva tu cita 24/7 sin hacer una sola llamada.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-2xl relative"
        >
          <div className="flex flex-col sm:flex-row p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl gap-2 shadow-2xl focus-within:border-barber-gold/50 transition-colors">
            <div className="flex-1 flex items-center gap-3 px-4 py-3">
              <Search className="w-5 h-5 text-barber-gold" />
              <input 
                type="text" 
                placeholder="Ej. Fade, Manicura, Tinte..." 
                className="w-full bg-transparent border-none outline-none text-white placeholder-zinc-500 font-medium"
              />
            </div>
            <div className="hidden sm:block w-[1px] bg-white/10 my-2" />
            <div className="flex-1 flex items-center gap-3 px-4 py-3">
              <MapPin className="w-5 h-5 text-barber-gold" />
              <input 
                type="text" 
                placeholder="Ubicación" 
                className="w-full bg-transparent border-none outline-none text-white placeholder-zinc-500 font-medium"
              />
            </div>
            <Link to="/register?role=cliente" className="px-8 py-4 bg-barber-gold text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:scale-105 transition-transform flex items-center justify-center gap-2">
              Buscar <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Featured Professionals */}
      <section id="descubrir" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">Destacados esta semana</h2>
            <p className="text-zinc-400 font-medium">Los profesionales más valorados por nuestra comunidad.</p>
          </div>
          <Link to="/register?role=cliente" className="text-xs font-bold uppercase tracking-widest hover:text-zinc-300 flex items-center gap-2">
            Ver Todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURED_SPOTS.map((spot, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="group rounded-[2rem] bg-white/5 border border-white/10 overflow-hidden hover:border-white/20 transition-all cursor-pointer"
            >
              <div className="h-48 overflow-hidden relative">
                <img src={spot.img} alt={spot.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/10">
                  <Star className="w-3.5 h-3.5 text-barber-gold fill-current" />
                  <span className="text-xs font-bold">{spot.rating}</span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">{spot.type}</p>
                <h3 className="text-xl font-bold mb-4">{spot.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-400">{spot.reviews} reseñas</span>
                  <Link to="/register?role=cliente" className="px-4 py-2 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white text-white hover:text-black transition-colors">
                    Reservar
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works for clients */}
      <section className="py-20 px-6 bg-white/5 border-y border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-16">¿Por qué usar Steylook?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Search, title: "1. Descubre", desc: "Explora fotos reales de los trabajos de los estilistas antes de elegir." },
              { icon: Calendar, title: "2. Reserva 24/7", desc: "Ve los horarios disponibles en tiempo real y aparta tu turno al instante." },
              { icon: Sparkles, title: "3. Disfruta", desc: "Recibe recordatorios en tu celular. Solo llega y siéntate en la silla." },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="w-20 h-20 mx-auto rounded-full bg-white/10 flex items-center justify-center mb-6 border border-white/10">
                  <s.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                <p className="text-zinc-400 leading-relaxed font-medium">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* B2B Section - For Businesses */}
      <section id="negocios" className="py-32 px-6 max-w-7xl mx-auto relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-pink-900/20 rounded-[3rem] blur-3xl -z-10" />
        <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-[10px] font-black tracking-widest uppercase mb-6 border border-white/10">
              Para Profesionales
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6 leading-none">
              Impulsa tu <br/> Barbería o Salón
            </h2>
            <p className="text-lg text-zinc-400 mb-8 font-medium max-w-md">
              Únete a Steylook y obtén un sistema de reservas automático, métricas de ingresos en tiempo real y exposición a miles de nuevos clientes buscando un corte en tu área.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register?role=barbero" className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-full hover:scale-105 transition-transform flex items-center justify-center gap-2">
                Afiliar mi Negocio <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/login" className="px-8 py-4 bg-transparent border border-white/20 text-white font-bold uppercase tracking-widest text-xs rounded-full hover:bg-white/5 transition-colors flex items-center justify-center">
                Iniciar Sesión (Negocio)
              </Link>
            </div>
          </div>
          
          {/* Dashboard Preview Mockup */}
          <div className="flex-1 w-full relative">
            <div className="aspect-[4/3] rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-4 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-8 bg-black border-b border-zinc-800 flex items-center px-4 gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"/>
                <div className="w-2 h-2 rounded-full bg-yellow-500"/>
                <div className="w-2 h-2 rounded-full bg-green-500"/>
              </div>
              <div className="mt-6 space-y-4">
                <div className="h-8 w-3/4 bg-zinc-800 rounded animate-pulse" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-20 bg-zinc-800 rounded animate-pulse" />
                  <div className="h-20 bg-zinc-800 rounded animate-pulse" />
                  <div className="h-20 bg-zinc-800 rounded animate-pulse" />
                </div>
                <div className="h-32 w-full bg-zinc-800 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-zinc-500 text-[10px] font-black uppercase tracking-widest border-t border-white/5 mt-10">
        <div className="flex justify-center items-center gap-3 mb-6">
          <Scissors className="w-5 h-5 text-zinc-400" /> STEYLOOK
        </div>
        <p>© {new Date().getFullYear()} Steylook Global Group. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
