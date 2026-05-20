/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import InstallPrompt from './components/InstallPrompt';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ClienteHome from './pages/cliente/Home';
import BarberoDashboard from './pages/barbero/Dashboard';
import SaloneraDashboard from './pages/salon/Dashboard';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { user, profile, loading } = useAuth();

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-black text-white">
      <div className="animate-pulse text-2xl font-light tracking-widest text-center">
        STEYLOOK<br />
        <span className="text-[10px] tracking-[0.5em] text-theme-secondary font-bold uppercase transition-all duration-1000">Cargando Experiencia</span>
      </div>
    </div>
  );

  // Allow either real user OR guest profile
  if (!user && !profile) return <Navigate to="/login" />;

  if (allowedRoles && profile && !allowedRoles.includes(profile.tipo)) {
    return <Navigate to="/" />;
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
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

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
