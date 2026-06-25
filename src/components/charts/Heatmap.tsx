import { useMemo, useState } from 'react';
import { useElementSize } from '@/hooks/useElementSize';
import { addDays, parseISO, startOfWeek, toISODate, todayISO } from '@/lib/date';
import { signed } from '@/lib/format';
import { clamp } from '@/lib/format';
import { cx } from '@/lib/cx';
import styles from './Charts.module.css';

interface HeatmapProps {
  data: Map<string, number>;
  weeks?: number;
  onSelectDay?: (iso: string) => void;
  className?: string;
  /** Locale for tooltip dates and month labels (defaults to en-US). */
  locale?: string;
  noActivityLabel?: string;
  ptsSuffix?: string;
}

function cellColor(value: number | null, maxAbs: number): string {
  if (value === null) return 'rgba(255,255,255,0.04)';
  if (value === 0) return 'rgba(255,255,255,0.08)';
  const t = clamp(Math.abs(value) / (maxAbs || 1), 0.18, 1);
  return value > 0 ? `rgba(52,211,153,${0.16 + 0.66 * t})` : `rgba(251,111,132,${0.16 + 0.66 * t})`;
}

export function Heatmap({
  data,
  weeks = 18,
  onSelectDay,
  className,
  locale = 'en-US',
  noActivityLabel = 'No activity',
  ptsSuffix = 'pts',
}: HeatmapProps) {
  const [ref, { width }] = useElementSize<HTMLDivElement>();
  const [hover, setHover] = useState<{ iso: string; x: number; y: number } | null>(null);

  const today = todayISO();
  const start = useMemo(() => {
    const s = startOfWeek();
    s.setDate(s.getDate() - (weeks - 1) * 7);
    return s;
  }, [weeks]);

  const maxAbs = useMemo(() => Math.max(1, ...[...data.values()].map((v) => Math.abs(v))), [data]);

  const topPad = 18;
  const gap = 4;
  const step = width > 0 ? Math.max(10, Math.floor((width + gap) / weeks)) : 16;
  const cell = step - gap;
  const height = topPad + 7 * step;

  const columns = useMemo(() => {
    const cols: Array<{ col: number; monthLabel?: string; cells: Array<{ iso: string; row: number; value: number | null; future: boolean }> }> = [];
    let prevMonth = -1;
    for (let c = 0; c < weeks; c++) {
      const cells = [];
      let monthLabel: string | undefined;
      for (let r = 0; r < 7; r++) {
        const date = addDays(start, c * 7 + r);
        const iso = toISODate(date);
        const future = iso > today;
        const value = future ? null : data.has(iso) ? data.get(iso)! : null;
        if (r === 0) {
          const m = date.getMonth();
          if (m !== prevMonth) {
            monthLabel = new Date(2024, m, 1).toLocaleDateString(locale, { month: 'short' });
            prevMonth = m;
          }
        }
        cells.push({ iso, row: r, value, future });
      }
      cols.push({ col: c, monthLabel, cells });
    }
    return cols;
  }, [start, weeks, data, today, locale]);

  return (
    <div className={cx(styles.chart, className)} ref={ref} style={{ height }}>
      {width > 0 && (
        <>
          <svg width={width} height={height}>
            {columns.map((column) => (
              <g key={column.col}>
                {column.monthLabel && (
                  <text x={column.col * step} y={11} className={styles.axisLabel}>
                    {column.monthLabel}
                  </text>
                )}
                {column.cells.map((c) => (
                  <rect
                    key={c.iso}
                    x={column.col * step}
                    y={topPad + c.row * step}
                    width={cell}
                    height={cell}
                    rx={3}
                    fill={cellColor(c.value, maxAbs)}
                    stroke={hover?.iso === c.iso ? 'rgba(255,255,255,0.5)' : 'transparent'}
                    strokeWidth={1.5}
                    style={{ cursor: c.future ? 'default' : 'pointer' }}
                    onMouseEnter={() =>
                      !c.future &&
                      setHover({ iso: c.iso, x: column.col * step + cell / 2, y: topPad + c.row * step })
                    }
                    onMouseLeave={() => setHover(null)}
                    onClick={() => !c.future && onSelectDay?.(c.iso)}
                  />
                ))}
              </g>
            ))}
          </svg>
          {hover && (
            <div className={styles.tooltip} style={{ left: hover.x, top: hover.y, transform: 'translate(-50%, calc(-100% - 8px))' }}>
              <span className={styles.tipValue}>{data.has(hover.iso) ? `${signed(data.get(hover.iso)!)} ${ptsSuffix}` : noActivityLabel}</span>
              <span className={styles.tipLabel}>
                {parseISO(hover.iso).toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
