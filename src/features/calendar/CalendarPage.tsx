import { useMemo, useState, type CSSProperties } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { logsByDate } from '@/store/selectors';
import { Card, IconButton } from '@/components/ui';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Heatmap } from '@/components/charts/Heatmap';
import { useT } from '@/i18n/useT';
import { monthMatrix, parseISO, todayISO } from '@/lib/date';
import { clamp, formatNumber, signed } from '@/lib/format';
import { cx } from '@/lib/cx';
import styles from './CalendarPage.module.css';

function tint(net: number, max: number): string {
  if (net === 0) return 'transparent';
  const t = clamp(Math.abs(net) / (max || 1), 0.2, 1);
  return net > 0 ? `rgba(52,211,153,${0.1 + 0.28 * t})` : `rgba(251,111,132,${0.1 + 0.28 * t})`;
}

export function CalendarPage() {
  const logs = useStore((s) => s.logs);
  const { t, locale, fmtFullDate, dayLabel, monthName, weekdaysShort } = useT();
  const today = todayISO();
  const [cursor, setCursor] = useState(() => {
    const d = parseISO(today);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selected, setSelected] = useState(today);

  const byDate = useMemo(() => logsByDate(logs), [logs]);
  const heatData = useMemo(() => new Map([...byDate].map(([k, v]) => [k, v.net])), [byDate]);
  const maxAbs = useMemo(() => Math.max(1, ...[...byDate.values()].map((v) => Math.abs(v.net))), [byDate]);

  const cells = useMemo(() => monthMatrix(cursor.year, cursor.month), [cursor]);
  const detail = byDate.get(selected);

  const move = (delta: number) => {
    setCursor((c) => {
      const m = c.month + delta;
      return { year: c.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    });
  };
  const goToday = () => {
    const d = parseISO(today);
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
    setSelected(today);
  };

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        <Card pad="md" className={styles.calCard}>
          <div className={styles.calHead}>
            <h2 className={styles.monthLabel}>
              {monthName(cursor.month)} <span className={styles.year}>{cursor.year}</span>
            </h2>
            <div className={styles.navGroup}>
              <button className={styles.todayBtn} onClick={goToday}>
                {t('common.today')}
              </button>
              <IconButton label={t('cal.prev_month')} variant="surface" size="sm" onClick={() => move(-1)}>
                <ChevronLeft />
              </IconButton>
              <IconButton label={t('cal.next_month')} variant="surface" size="sm" onClick={() => move(1)}>
                <ChevronRight />
              </IconButton>
            </div>
          </div>

          <div className={styles.weekdays}>
            {weekdaysShort().map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          <div className={styles.grid}>
            {cells.map((cell) => {
              const day = byDate.get(cell.iso);
              const net = day?.net ?? 0;
              const isFuture = cell.iso > today;
              return (
                <button
                  key={cell.iso}
                  className={cx(
                    styles.cell,
                    !cell.inMonth && styles.muted,
                    cell.isToday && styles.today,
                    selected === cell.iso && styles.selected,
                    isFuture && styles.future,
                  )}
                  style={{ '--tint': tint(net, maxAbs) } as CSSProperties}
                  onClick={() => setSelected(cell.iso)}
                >
                  <span className={styles.cellDay}>{cell.day}</span>
                  {day && (
                    <span className={styles.cellMarks}>
                      {day.completes.length > 0 && <span className={cx(styles.mark, styles.markUp)}>{day.completes.length}</span>}
                      {day.skips.length > 0 && <span className={cx(styles.mark, styles.markDown)}>{day.skips.length}</span>}
                    </span>
                  )}
                  {day && net !== 0 && <span className={cx(styles.cellNet, net < 0 && styles.netNeg)}>{signed(net)}</span>}
                </button>
              );
            })}
          </div>
        </Card>

        <Card pad="md" className={styles.detailCard}>
          <SectionHeader icon={<CalendarDays />} title={dayLabel(selected)} subtitle={fmtFullDate(selected)} />
          <div className={cx(styles.scoreBox, (detail?.net ?? 0) < 0 && styles.scoreNeg)}>
            <span className={styles.scoreLabel}>{t('cal.daily_score')}</span>
            <span className={styles.scoreValue}>{signed(detail?.net ?? 0)}</span>
          </div>

          {!detail ? (
            <p className={styles.noLogs}>{t('cal.no_logs')}</p>
          ) : (
            <div className={styles.dayLists}>
              {detail.completes.length > 0 && (
                <div className={styles.dayGroup}>
                  <p className={styles.dayGroupTitle} data-tone="up">
                    {t('cal.completed_n', { n: detail.completes.length })}
                  </p>
                  {detail.completes.map((l) => (
                    <div key={l.id} className={styles.logRow}>
                      <span className={styles.logIcon}>{l.habitIcon}</span>
                      <span className={styles.logName}>{l.habitName}</span>
                      <span className={styles.up}>+{l.points}</span>
                    </div>
                  ))}
                </div>
              )}
              {detail.skips.length > 0 && (
                <div className={styles.dayGroup}>
                  <p className={styles.dayGroupTitle} data-tone="down">
                    {t('cal.skipped_n', { n: detail.skips.length })}
                  </p>
                  {detail.skips.map((l) => (
                    <div key={l.id} className={styles.logRow}>
                      <span className={styles.logIcon}>{l.habitIcon}</span>
                      <span className={styles.logName}>{l.habitName}</span>
                      <span className={styles.down}>{l.points}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      <Card pad="md">
        <SectionHeader icon={<Flame />} title={t('cal.heatmap_title')} subtitle={t('cal.heatmap_sub')} />
        <Heatmap
          data={heatData}
          weeks={18}
          locale={locale}
          noActivityLabel={t('cal.no_activity')}
          ptsSuffix={t('common.pts')}
          onSelectDay={(iso) => {
            const d = parseISO(iso);
            setCursor({ year: d.getFullYear(), month: d.getMonth() });
            setSelected(iso);
          }}
        />
        <div className={styles.heatLegend}>
          <span>{t('cal.legend_skipped')}</span>
          <span className={styles.legendSwatch} style={{ background: 'rgba(251,111,132,0.7)' }} />
          <span className={styles.legendSwatch} style={{ background: 'rgba(255,255,255,0.08)' }} />
          <span className={styles.legendSwatch} style={{ background: 'rgba(52,211,153,0.7)' }} />
          <span>{t('cal.legend_completed', { n: formatNumber(maxAbs) })}</span>
        </div>
      </Card>
    </div>
  );
}
