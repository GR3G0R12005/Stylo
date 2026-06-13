import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Register the PWA Service Worker with auto-update support
registerSW({
  onNeedRefresh() {
    // New content available — handled silently via autoUpdate
    // The VitePWA autoUpdate strategy handles the refresh automatically
  },
  onOfflineReady() {
    console.log('[STAYLOOK PWA] App lista para uso sin conexion.');
  },
  onRegistered(registration) {
    console.log('[STAYLOOK PWA] Service Worker registrado:', registration);
  },
  onRegisterError(error) {
    console.warn('[STAYLOOK PWA] Error al registrar Service Worker:', error);
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
