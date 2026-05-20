import React, { createContext, useCallback, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = crypto.randomUUID();
    setItems((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);

  const icons = { success: CheckCircle2, error: AlertCircle, info: Info };
  const colors = {
    success: { bg: 'rgba(34,197,94,0.95)', border: '#22c55e' },
    error: { bg: 'rgba(239,68,68,0.95)', border: '#ef4444' },
    info: { bg: 'rgba(59,130,246,0.95)', border: '#3b82f6' },
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <motion.div
        className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm pointer-events-none"
        aria-live="polite"
      >
        <AnimatePresence>
          {items.map((t) => {
            const Icon = icons[t.type];
            const c = colors[t.type];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                className="flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white text-sm font-bold shadow-2xl pointer-events-auto"
                style={{ background: c.bg, border: `1px solid ${c.border}` }}
              >
                <Icon size={18} className="flex-shrink-0" />
                {t.message}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
