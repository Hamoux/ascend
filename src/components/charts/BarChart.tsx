import { useMemo, useState } from 'react';
import { useElementSize } from '@/hooks/useElementSize';
import { cx } from '@/lib/cx';
import styles from './Charts.module.css';

export interface BarGroup {
  label: string;
  values: number[];
}

interface BarChartProps {
  data: BarGroup[];
  colors: string[];
  seriesNames?: string[];
  height?: number;
  formatValue?: (n: number) => string;
  className?: string;
}

export function BarChart({ data, colors, seriesNames, height = 200, formatValue, className }: BarChartProps) {
  const [ref, { width }] = useElementSize<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const padT = 12;
  const padB = 26;

  const geom = useMemo(() => {
    if (width === 0 || data.length === 0) return null;
    const seriesCount = Math.max(1, ...data.map((d) => d.values.length));
    const max = Math.max(1, ...data.flatMap((d) => d.values));
    const innerH = height - padT - padB;
    const groupW = width / data.length;
    const groupPad = Math.min(16, groupW * 0.22);
    const barsW = groupW - groupPad * 2;
    const barW = Math.max(5, (barsW - (seriesCount - 1) * 4) / seriesCount);
    return { seriesCount, max, innerH, groupW, groupPad, barW };
  }, [width, height, data]);

  const fmt = formatValue ?? ((n: number) => String(Math.round(n)));

  return (
    <div className={cx(styles.chart, className)} ref={ref} style={{ height }}>
      {geom && (
        <>
          <svg width={width} height={height}>
            {data.map((group, gi) => {
              const gx = gi * geom.groupW + geom.groupPad;
              const isHover = hover === gi;
              return (
                <g key={group.label} onMouseEnter={() => setHover(gi)} onMouseLeave={() => setHover(null)}>
                  <rect
                    x={gi * geom.groupW}
                    y={0}
                    width={geom.groupW}
                    height={height - padB}
                    fill={isHover ? 'rgba(255,255,255,0.04)' : 'transparent'}
                    rx={8}
                  />
                  {group.values.map((v, si) => {
                    const h = (v / geom.max) * geom.innerH;
                    const x = gx + si * (geom.barW + 4);
                    const y = padT + geom.innerH - h;
                    return (
                      <rect
                        key={si}
                        x={x}
                        y={y}
                        width={geom.barW}
                        height={Math.max(2, h)}
                        rx={Math.min(5, geom.barW / 2)}
                        fill={colors[si] ?? colors[0]}
                        opacity={hover === null || isHover ? 1 : 0.45}
                        style={{ transition: 'opacity 0.2s' }}
                      />
                    );
                  })}
                  <text x={gi * geom.groupW + geom.groupW / 2} y={height - 8} className={styles.axisLabel} textAnchor="middle">
                    {group.label}
                  </text>
                </g>
              );
            })}
          </svg>
          {hover !== null && (
            <div
              className={styles.tooltip}
              style={{ left: hover * geom.groupW + geom.groupW / 2, top: 4, transform: 'translate(-50%, 0)' }}
            >
              <span className={styles.tipLabel}>{data[hover].label}</span>
              {data[hover].values.map((v, si) => (
                <span key={si} className={styles.tipRow}>
                  <span className={styles.tipDot} style={{ background: colors[si] ?? colors[0] }} />
                  {seriesNames?.[si] ? `${seriesNames[si]}: ` : ''}
                  {fmt(v)}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
