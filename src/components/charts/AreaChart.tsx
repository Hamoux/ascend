import { useId, useMemo, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { useElementSize } from '@/hooks/useElementSize';
import { cx } from '@/lib/cx';
import styles from './Charts.module.css';

export interface AreaPoint {
  label: string;
  value: number;
  caption?: string;
}

interface AreaChartProps {
  data: AreaPoint[];
  height?: number;
  tone?: 'brand' | 'success' | 'cyan' | 'gold';
  formatValue?: (n: number) => string;
  className?: string;
}

const STOPS: Record<string, [string, string]> = {
  brand: ['#7c6cff', '#d96cff'],
  success: ['#2dd4bf', '#34d399'],
  cyan: ['#36d6e7', '#5b8cff'],
  gold: ['#ffd87a', '#ffae3b'],
};

function smoothPath(points: Array<[number, number]>): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0][0]} ${points[0][1]}`;
  const d = [`M ${points[0][0]} ${points[0][1]}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`);
  }
  return d.join(' ');
}

export function AreaChart({ data, height = 200, tone = 'brand', formatValue, className }: AreaChartProps) {
  const [ref, { width }] = useElementSize<HTMLDivElement>();
  const gid = useId();
  const [hover, setHover] = useState<number | null>(null);
  const [from, to] = STOPS[tone];

  const padT = 14;
  const padB = 10;
  const padX = 6;

  const geom = useMemo(() => {
    if (width === 0 || data.length === 0) return null;
    const values = data.map((d) => d.value);
    let min = Math.min(...values);
    let max = Math.max(...values);
    if (min === max) {
      min -= 1;
      max += 1;
    }
    const innerW = width - padX * 2;
    const innerH = height - padT - padB;
    const xFor = (i: number) => padX + (data.length === 1 ? innerW / 2 : (innerW * i) / (data.length - 1));
    const yFor = (v: number) => padT + innerH - ((v - min) / (max - min)) * innerH;
    const pts = data.map((d, i) => [xFor(i), yFor(d.value)] as [number, number]);
    const line = smoothPath(pts);
    const area = `${line} L ${pts[pts.length - 1][0]} ${height - padB} L ${pts[0][0]} ${height - padB} Z`;
    return { pts, line, area, xFor };
  }, [width, height, data]);

  const onMove = (e: ReactMouseEvent<SVGSVGElement>) => {
    if (!geom) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    let nearest = 0;
    let best = Infinity;
    geom.pts.forEach((p, i) => {
      const dist = Math.abs(p[0] - x);
      if (dist < best) {
        best = dist;
        nearest = i;
      }
    });
    setHover(nearest);
  };

  const fmt = formatValue ?? ((n: number) => String(Math.round(n)));
  const active = hover !== null && geom ? geom.pts[hover] : null;

  return (
    <div className={cx(styles.chart, className)} ref={ref} style={{ height }}>
      {geom && (
        <>
          <svg width={width} height={height} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
            <defs>
              <linearGradient id={`stroke-${gid}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={from} />
                <stop offset="100%" stopColor={to} />
              </linearGradient>
              <linearGradient id={`fill-${gid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={from} stopOpacity="0.34" />
                <stop offset="100%" stopColor={from} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={geom.area} fill={`url(#fill-${gid})`} />
            <path d={geom.line} fill="none" stroke={`url(#stroke-${gid})`} strokeWidth={2.5} strokeLinecap="round" />
            {active && (
              <g>
                <line x1={active[0]} y1={padT - 6} x2={active[0]} y2={height - padB} stroke="rgba(255,255,255,0.16)" strokeWidth={1} />
                <circle cx={active[0]} cy={active[1]} r={5.5} fill={from} stroke="#0c0c15" strokeWidth={3} />
              </g>
            )}
          </svg>
          {active && hover !== null && (
            <div
              className={styles.tooltip}
              style={{ left: active[0], top: active[1], transform: `translate(-50%, calc(-100% - 12px))` }}
            >
              <span className={styles.tipValue}>{fmt(data[hover].value)}</span>
              <span className={styles.tipLabel}>{data[hover].caption ?? data[hover].label}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
