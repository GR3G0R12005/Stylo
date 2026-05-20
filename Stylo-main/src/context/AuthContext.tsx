import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface UserProfile {
  nombre: string;
  email: string;
  tipo: 'cliente' | 'barbero' | 'salonera';
  foto?: string;
  telefono?: string;
  shopId?: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  theme: 'default' | 'feminine' | 'masculine';
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  theme: 'default',
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'default' | 'feminine' | 'masculine'>('default');

  const detectTheme = (name: string) => {
    const n = name.toLowerCase().trim();
    if (!n) return 'default';
    const femaleSuffixes = ['a', 'ia', 'ita', 'na', 'ra', 'sa', 'za', 'ie', 'is'];
    const maleSuffixes = ['o', 'os', 'an', 'el', 'on', 'er', 'ur'];
    if (femaleSuffixes.some((s) => n.endsWith(s))) return 'feminine';
    if (maleSuffixes.some((s) => n.endsWith(s))) return 'masculine';
    return 'default';
  };

  useEffect(() => {
    if (profile?.nombre) {
      setTheme(detectTheme(profile.nombre));
    } else {
      setTheme('default');
    }
  }, [profile]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        localStorage.removeItem('steylook_guest');
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setProfile(userDoc.data() as UserProfile);
          } else if (firebaseUser.displayName) {
            setProfile({
              nombre: firebaseUser.displayName,
              email: firebaseUser.email || '',
              tipo: 'cliente',
              foto: firebaseUser.photoURL || undefined,
            });
          } else {
            setProfile({
              nombre: firebaseUser.email?.split('@')[0] || 'Usuario',
              email: firebaseUser.email || '',
              tipo: 'cliente',
            });
          }
        } catch {
          setProfile({
            nombre: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
            email: firebaseUser.email || '',
            tipo: 'cliente',
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    localStorage.removeItem('steylook_guest');
    await auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, theme, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
