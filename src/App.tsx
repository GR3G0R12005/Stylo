/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import InstallPrompt from './components/InstallPrompt';
import Landing from './pages/Landing';
import AuthClient from './pages/AuthClient';
import BusinessSelection from './pages/BusinessSelection';
import AuthBusiness from './pages/AuthBusiness';
import ClienteHome from './pages/cliente/Home';
import BarberoDashboard from './pages/barbero/Dashboard';
import SaloneraDashboard from './pages/salon/Dashboard';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { user, profile, loading } = useAuth();

  if (loading || (user && !profile)) return (
    <div className="h-screen w-screen flex items-center justify-center bg-black text-white">
      <div className="animate-pulse text-2xl font-light tracking-widest text-center">
        STEYLOOK<br />
        <span className="text-[10px] tracking-[0.5em] text-theme-secondary font-bold uppercase transition-all duration-1000">Cargando Experiencia</span>
      </div>
    </div>
  );

  // Allow either real user OR guest profile
  if (!user && !profile) {
    const path = window.location.pathname;
    if (path.startsWith('/barbero')) {
      return <Navigate to="/auth/business?type=barbero" />;
    }
    if (path.startsWith('/salon')) {
      return <Navigate to="/auth/business?type=salonera" />;
    }
    return <Navigate to="/auth/client" />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.tipo)) {
    if (profile.tipo === 'barbero') return <Navigate to="/barbero" replace />;
    if (profile.tipo === 'salonera') return <Navigate to="/salon" replace />;
    return <Navigate to="/cliente" replace />;
  }

  return <>{children}</>;
}

function RoleHome() {
  const { user, profile, loading } = useAuth();

  if (loading) return null;

  // Redirect authenticated users to their dashboard
  if (profile) {
    if (profile.tipo === 'barbero') return <Navigate to="/barbero" />;
    if (profile.tipo === 'salonera') return <Navigate to="/salon" />;
    if (profile.tipo === 'cliente') return <Navigate to="/cliente" />;
  }

  return <Landing />;
}

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useAuth();
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('steylook_dark') === 'true';
      if (saved) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    } catch {
      // ignore
    }
  }, []);
  return (
    <div data-theme={theme} className="min-h-screen">
      {children}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeWrapper>
        <Router>
          <Routes>
            <Route path="/" element={<RoleHome />} />
            <Route path="/auth/client" element={<AuthClient />} />
            <Route path="/business-selection" element={<BusinessSelection />} />
            <Route path="/auth/business" element={<AuthBusiness />} />

            <Route path="/cliente" element={
              <ProtectedRoute allowedRoles={['cliente', 'barbero', 'salonera']}>
                <ClienteHome />
              </ProtectedRoute>
            } />

            <Route path="/barbero" element={
              <ProtectedRoute allowedRoles={['barbero']}>
                <BarberoDashboard />
              </ProtectedRoute>
            } />

            <Route path="/salon" element={
              <ProtectedRoute allowedRoles={['salonera']}>
                <SaloneraDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>

        {/* PWA install prompt — floats above all content */}
        <InstallPrompt />
      </ThemeWrapper>
    </AuthProvider>
  );
}
