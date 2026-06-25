import { motion } from 'framer-motion';
import type { AppView } from '@/types';
import { useStore } from '@/store/useStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { HabitsPage } from '@/features/habits/HabitsPage';
import { RewardsPage } from '@/features/rewards/RewardsPage';
import { AnalyticsPage } from '@/features/analytics/AnalyticsPage';
import { CalendarPage } from '@/features/calendar/CalendarPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import styles from './AppShell.module.css';

function renderView(view: AppView) {
  switch (view) {
    case 'dashboard':
      return <DashboardPage />;
    case 'habits':
      return <HabitsPage />;
    case 'rewards':
      return <RewardsPage />;
    case 'analytics':
      return <AnalyticsPage />;
    case 'calendar':
      return <CalendarPage />;
    case 'settings':
      return <SettingsPage />;
  }
}

export function AppShell() {
  const view = useStore((s) => s.view);

  return (
    <div className={styles.app}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.inner}>
          <Topbar />
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className={styles.page}
          >
            {renderView(view)}
          </motion.div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
