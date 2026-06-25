import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { ConfirmProvider } from '@/components/ui';
import { ToastViewport } from '@/components/ui';
import { UIProvider } from '@/components/layout/UIProvider';
import { AppShell } from '@/components/layout/AppShell';
import { Splash } from '@/components/layout/Splash';

export function App() {
  const initialize = useStore((s) => s.initialize);
  const language = useStore((s) => s.language);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initialize();
    const timer = setTimeout(() => setLoading(false), 850);
    return () => clearTimeout(timer);
  }, [initialize]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <ConfirmProvider>
      <UIProvider>
        <div className="aurora" aria-hidden />
        <div className="aurora-grain" aria-hidden />
        <AppShell />
        <ToastViewport />
        <AnimatePresence>{loading && <Splash key="splash" />}</AnimatePresence>
      </UIProvider>
    </ConfirmProvider>
  );
}
