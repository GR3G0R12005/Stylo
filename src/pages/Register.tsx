import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserPlus, ArrowLeft, Mail, Lock, User, Phone } from 'lucide-react';
import { getRolePath, parseRole, roleLabel } from '../lib/authHelpers';

export default function Register() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = parseRole(searchParams.get('role'));

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
        tipo: role,
        foto: `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=random`,
        createdAt: new Date().toISOString(),
      });

      navigate(getRolePath(role));
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      const messages: Record<string, string> = {
        'auth/email-already-in-use': 'Este email ya está registrado. Inicia sesión.',
        'auth/weak-password': 'La contraseña es muy débil (mínimo 6 caracteres).',
        'auth/invalid-email': 'El email no es válido.',
      };
      setError(messages[code || ''] || 'No se pudo crear la cuenta. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-black text-white flex items-center justify-center p-4 sm:p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 to-black">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Link
          to={`/login?role=${role}`}
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-6 sm:mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-xs uppercase tracking-widest font-semibold">Regresar</span>
        </Link>

        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10">
          <div className="mb-8 text-center sm:text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-barber-gold mb-2">STEYLOOK</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tighter mb-2">Crear cuenta</h2>
            <p className="text-zinc-400 font-light text-sm">
              Registro como <span className="text-white font-medium">{roleLabel(role)}</span>
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest font-black text-zinc-500 ml-4">Nombre</label>
              <motion.div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre completo"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-white/20 font-light"
                  required
                />
              </motion.div>
            </div>

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

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest font-black text-zinc-500 ml-4">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-white/20 font-light"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">{error}</p>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? 'Creando...' : (
                <>
                  <UserPlus className="w-5 h-5" /> Crear cuenta
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-zinc-500 text-sm font-light">
            ¿Ya tienes cuenta?{' '}
            <Link to={`/login?role=${role}`} className="text-white font-medium hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
