import type { RootState } from '@/redux/store';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';

type Point = {
  month: string;
  year?: number;
  value: number;
};

const FALLBACK: Point[] = [
  { month: 'Jan', value: 0 },
  { month: 'Feb', value: 0 },
  { month: 'Mar', value: 0 },
  { month: 'Apr', value: 0 },
  { month: 'May', value: 0 },
  { month: 'Jun', value: 0 },
  { month: 'Jul', value: 0 },
  { month: 'Aug', value: 0 },
  { month: 'Sep', value: 0 },
  { month: 'Oct', value: 0 },
  { month: 'Nov', value: 0 },
  { month: 'Dec', value: 0 },
];

export default function PortfolioPerformanceChart({ chartData }: { chartData?: Point[] }) {
  const theme = useSelector((state: RootState) => state.mode.theme);
  const isDark = theme === 'dark';

  const ref = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const data = (chartData && chartData.length > 0) ? chartData : FALLBACK;

  const W = 1000;
  const H = 320;
  const P = { top: 20, right: 20, bottom: 40, left: 70 };

  const rawMax = Math.max(...data.map((d) => d.value), 1);
  const max = rawMax * 1.1;
  const min = 0;

  const xStep = (W - P.left - P.right) / (data.length - 1);

  const points = data.map((d, i) => {
    const x = P.left + i * xStep;
    const y = P.top + ((max - d.value) / (max - min)) * (H - P.top - P.bottom);
    return { ...d, x, y };
  });

  const line = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const area = `
    ${line}
    L ${points.at(-1)!.x} ${H - P.bottom}
    L ${points[0].x} ${H - P.bottom}
    Z
  `;

  function formatMonthLabel(month: string) {
    // Example: "Mar" -> "18 Mar, 3:34 pm"
    // (you can later replace with real timestamps)
    return `01 ${month}, 11:59 pm`;
  }

  function getPercentageChange(current: number, previous?: number) {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  const tooltipData =
    hover !== null
      ? {
          month: points[hover].month,
          value: points[hover].value,
          percent: getPercentageChange(
            points[hover].value,
            hover > 0 ? points[hover - 1].value : undefined
          ),
        }
      : null;

  function onMove(e: React.MouseEvent) {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;

    let i = Math.floor((x - P.left) / xStep);
    i = Math.max(0, Math.min(i, points.length - 1));

    setHover(i);
  }

  return (
    <div className="relative py-6">
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        preserveAspectRatio="none"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid + Y labels */}
        {[0, 0.2, 0.4, 0.6, 0.8, 1].map((t, i) => {
          const y = P.top + t * (H - P.top - P.bottom);
          const v = Math.round(max - t * (max - min));

          return (
            <g key={i}>
              <line
                x1={P.left}
                x2={W - P.right}
                y1={y}
                y2={y}
                stroke={isDark ? '#329b59' : '#ff1100'}
                opacity="0.15"
                strokeDasharray="6 6"
              />
              <text
                x={P.left - 10}
                y={y + 4}
                textAnchor="end"
                className="fill-[var(--fg)]/40 text-xs"
              >
                ₹{v.toLocaleString('en-IN')}
              </text>
            </g>
          );
        })}

        {/* Area */}
        <path d={area} fill="url(#area)" />

        {/* Line */}
        <path d={line} fill="none" stroke="#22c55e" strokeWidth="3" />

        {/* X labels */}
        {points.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={H - 10}
            textAnchor="middle"
            className="fill-[var(--fg)]/50 text-xs"
          >
            {p.month}
          </text>
        ))}

        {/* Hover */}
        {hover !== null && (
          <>
            <line
              x1={points[hover].x}
              x2={points[hover].x}
              y1={P.top}
              y2={H - P.bottom}
              stroke="#22c55e"
              opacity="0.4"
            />
            <circle
              cx={points[hover].x}
              cy={points[hover].y}
              r="7"
              fill="#081829"
              stroke="#22c55e"
              strokeWidth="3"
            />
          </>
        )}
      </svg>

      {/* Tooltip */}
      {hover !== null && tooltipData && (
        <div
          className="absolute bg-white rounded-tl-xl rounded-tr-xl rounded-br-xl px-4 py-2 text-sm shadow-xl pointer-events-none w-[130px] "
          style={{
            left: `${(points[hover].x / W) * 100}%`,
            top: `${(points[hover].y / H) * 100}%`,
            transform: 'translate(-50%, -115%)', // ⬅ above the point
          }}
        >
          {/* Date */}
          <div className="text-gray-500 text-xs">
            {formatMonthLabel(tooltipData.month)}
          </div>

          {/* Value */}
          <div className="font-semibold text-lg text-black">
            ₹ {tooltipData.value.toLocaleString('en-IN')}
          </div>

          {/* Percentage */}
          <span
            className={`inline-block mt-1 px-2 py-0.5 rounded-md text-xs ${
              tooltipData.percent >= 0
                ? 'text-green-600 bg-green-100'
                : 'text-red-600 bg-red-100'
            }`}
          >
            {tooltipData.percent >= 0 ? '+' : ''}
            {tooltipData.percent.toFixed(2)}%
          </span>
        </div>
      )}
    </div>
  );
}
