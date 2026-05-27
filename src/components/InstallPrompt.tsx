/**
 * InstallPrompt.tsx
 * Smart PWA install banner for STEYLOOK.
 * - Android/Chrome: uses the native `beforeinstallprompt` event.
 * - iOS/Safari: detects standalone mode and shows manual instructions.
 * - Remembers dismissals via localStorage.
 */

import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useState } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const isIOS = (): boolean =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const isInStandaloneMode = (): boolean =>
  window.matchMedia('(display-mode: standalone)').matches ||
  ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true);

const STORAGE_KEY = 'steylook_install_dismissed';

// ── Component ────────────────────────────────────────────────────────────────

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIOS, setShowIOS] = useState(false);

  useEffect(() => {
    // Don't show if already installed or previously dismissed
    if (isInStandaloneMode()) return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    // Android / Chrome prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowAndroid(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS Safari banner (show after 3 seconds)
    if (isIOS() && !sessionStorage.getItem(STORAGE_KEY)) {
      const timer = setTimeout(() => setShowIOS(true), 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handler);
      };
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      sessionStorage.setItem(STORAGE_KEY, '1');
    }
    setDeferredPrompt(null);
    setShowAndroid(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setShowAndroid(false);
    setShowIOS(false);
  };

  return (
    <AnimatePresence>
      {/* ── Android / Chrome banner ── */}
      {showAndroid && (
        <motion.div
          key="android-banner"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="fixed bottom-4 left-1/2 z-[9999] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2"
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
              border: '1px solid #D4AF37',
              borderRadius: '1rem',
              boxShadow: '0 8px 32px rgba(212,175,55,0.25)',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            {/* Icon */}
            <img
              src="/icons/icon-192.png"
              alt="STEYLOOK"
              style={{ width: 48, height: 48, borderRadius: '0.5rem', flexShrink: 0 }}
            />

            {/* Text */}
            <div style={{ flex: 1 }}>
              <p style={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>
                Instalar STEYLOOK
              </p>
              <p style={{ color: '#a1a1aa', fontSize: '0.75rem', margin: '2px 0 0' }}>
                Añade la app a tu pantalla de inicio
              </p>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flexShrink: 0 }}>
              <button
                id="pwa-install-btn"
                onClick={handleInstall}
                style={{
                  background: '#D4AF37',
                  color: '#000',
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '0.35rem 0.75rem',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Instalar
              </button>
              <button
                id="pwa-dismiss-btn"
                onClick={handleDismiss}
                style={{
                  background: 'transparent',
                  color: '#71717a',
                  border: '1px solid #3f3f46',
                  borderRadius: '0.5rem',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                Ahora no
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── iOS / Safari instructions banner ── */}
      {showIOS && (
        <motion.div
          key="ios-banner"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="fixed bottom-4 left-1/2 z-[9999] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2"
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
              border: '1px solid #D4AF37',
              borderRadius: '1rem',
              boxShadow: '0 8px 32px rgba(212,175,55,0.25)',
              padding: '1rem 1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <img
                src="/icons/icon-192.png"
                alt="STEYLOOK"
                style={{ width: 40, height: 40, borderRadius: '0.5rem' }}
              />
              <div>
                <p style={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>
                  Instalar STEYLOOK
                </p>
                <p style={{ color: '#a1a1aa', fontSize: '0.75rem', margin: '2px 0 0' }}>
                  En tu pantalla de inicio
                </p>
              </div>
              <button
                onClick={handleDismiss}
                style={{
                  marginLeft: 'auto',
                  background: 'transparent',
                  border: 'none',
                  color: '#71717a',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            {/* Step-by-step iOS instructions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                { icon: '⬆️', text: 'Toca el botón Compartir en Safari' },
                { icon: '➕', text: 'Selecciona "Añadir a pantalla de inicio"' },
                { icon: '✅', text: 'Pulsa "Añadir" para confirmar' },
              ].map(({ icon, text }, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.78rem',
                    color: '#d4d4d8',
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
          {/* iOS arrow pointing down */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderTop: '10px solid #D4AF37',
              margin: '0 auto',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
