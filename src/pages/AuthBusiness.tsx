import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { LogIn, UserPlus, ArrowLeft, Mail, Lock, User, Phone, Eye, EyeOff, Scissors, Sparkles } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { fetchUserRole, getRolePath, roleLabel } from '../lib/authHelpers';

export default function AuthBusiness() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const businessType = (searchParams.get('type') || 'barbero') as 'barbero' | 'salonera';
  
  const [isLogin, setIsLogin] = useState(true);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [nombreNegocio, setNombreNegocio] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const businessPath = businessType === 'barbero' ? '/barbero' : '/salon';
  const getColor = () => businessType === 'barbero' ? 'amber' : 'pink';
  const getIcon = () => businessType === 'barbero' ? Scissors : Sparkles;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      const tipo = await fetchUserRole(cred.user.uid);

      if (!tipo || tipo === 'cliente') {
        await auth.signOut();
        setError(
          tipo === 'cliente'
            ? 'Esta cuenta está registrada como cliente. Usa el acceso de cliente o crea una cuenta de negocio con otro email.'
            : 'No se encontró un perfil de negocio. Crea una cuenta primero.',
        );
        return;
      }

      if (tipo !== businessType) {
        await auth.signOut();
        setError(`Esta cuenta es de ${roleLabel(tipo)}. Usa el acceso correcto para tu tipo de negocio.`);
        return;
      }

      navigate(getRolePath(tipo));
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      const messages: Record<string, string> = {
        'auth/invalid-credential': 'Email o contraseña incorrectos.',
        'auth/user-not-found': 'No existe una cuenta con este email.',
        'auth/wrong-password': 'Contraseña incorrecta.',
        'auth/too-many-requests': 'Demasiados intentos. Espera un momento.',
        'auth/invalid-email': 'El email no es válido.',
      };
      setError(messages[code || ''] || 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      await updateProfile(cred.user, { displayName: nombre });

      await setDoc(doc(db, 'users', cred.user.uid), {
        nombre,
        email: email.trim().toLowerCase(),
        telefono: telefono || '',
        nombreNegocio: nombreNegocio || nombre,
        tipo: businessType,
        foto: `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=random`,
        createdAt: new Date().toISOString(),
      });

      // Create initial shops profile document
      await setDoc(doc(db, 'shops', cred.user.uid), {
        name: nombreNegocio || nombre,
        type: businessType === 'barbero' ? 'barberia' : 'salon',
        address: '',
        phone: telefono || '',
        description: '',
        bio: '',
        photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreNegocio || nombre)}&background=random`,
        coverImage: '',
        priceRange: 2,
        categories: [],
        services: [],
        promos: [],
        isPublic: false,
        settings: {
          shopName: nombreNegocio || nombre,
          address: '',
          bio: '',
          openTime: '09:00',
          closeTime: '18:00',
          notifEmail: true,
          notifWhatsapp: true,
          notifSMS: false,
          isPublic: false,
        },
        createdAt: new Date().toISOString(),
      });

      navigate(businessPath);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      const messages: Record<string, string> = {
        'auth/email-already-in-use': 'Este email ya está registrado.',
        'auth/weak-password': 'La contraseña es muy débil.',
        'auth/invalid-email': 'El email no es válido.',
      };
      setError(messages[code || ''] || 'Error al crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  const Icon = getIcon();
  const colorClass = getColor();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 sm:p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 to-black">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Link
          to="/business-selection"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-6 sm:mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-xs uppercase tracking-widest font-semibold">Volver</span>
        </Link>

        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10">
          <motion.div className="mb-8 sm:mb-10">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-${colorClass}-500`}>
              <Icon className="w-6 h-6" color={businessType === 'barbero' ? '#000' : '#fff'} />
            </div>
            <p className={`text-[10px] font-black uppercase tracking-[0.3em] text-${colorClass}-400 mb-2`}>STAYLOOK BUSINESS</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tighter mb-2">
              {isLogin ? 'Bienvenido' : 'Crear Cuenta de Negocio'}
            </h2>
            <p className="text-zinc-400 font-light text-sm">
              {businessType === 'barbero' ? 'Barbería' : 'Salón de Belleza'}
              {' - '}
              {isLogin ? 'Accede a tu panel' : 'Gestiona tu negocio'}
            </p>
          </motion.div>

          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-black text-zinc-500 ml-4">Nombre Propietario</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Tu nombre"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-white/20 font-light"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-black text-zinc-500 ml-4">Nombre del Negocio</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      value={nombreNegocio}
                      onChange={(e) => setNombreNegocio(e.target.value)}
                      placeholder="Mi barbería / Mi salón"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-white/20 font-light"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-black text-zinc-500 ml-4">Teléfono (opcional)</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="+1 809 000 0000"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-white/20 font-light"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest font-black text-zinc-500 ml-4">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-white/20 font-light"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest font-black text-zinc-500 ml-4">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-11 pr-12 focus:outline-none focus:ring-2 focus:ring-white/20 font-light"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">{error}</p>
            )}

            <button
              disabled={loading}
              type="submit"
              className={`w-full font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50 ${
                businessType === 'barbero'
                  ? 'bg-amber-500 hover:bg-amber-600 text-black'
                  : 'bg-pink-500 hover:bg-pink-600 text-white'
              }`}
            >
              {loading ? (isLogin ? 'Entrando...' : 'Creando...') : (
                <>
                  {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  {isLogin ? 'Entrar' : 'Crear Cuenta'}
                </>
              )}
            </button>
          </form>

          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="w-full mt-6 text-center text-zinc-400 text-sm font-light hover:text-white transition-colors"
          >
            {isLogin ? '¿No tienes cuenta? Crear una' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <Link
              to="/auth/client"
              className="text-xs font-semibold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest"
            >
              ¿Eres un cliente? Inicia sesión aquí
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
