import { useEffect, useRef, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import type { OverviewPeriod } from '@/api/overview.api';

type OverviewCardProps = {
  title: string;
  value: number;
  changePercent?: number;
  trend?: 'UP' | 'DOWN';
  label?: string;
  isLoading?: boolean;
  period: OverviewPeriod;
  onPeriodChange: (p: OverviewPeriod) => void;
};

const FILTERS: { label: string; value: OverviewPeriod }[] = [
  { label: 'Past 24 Hours', value: '24h' },
  { label: 'Past 7 Days', value: '7d' },
  { label: 'Past 30 Days', value: '30d' },
];

export default function OverviewCard({
  title,
  value,
  changePercent,
  trend,
  label,
  isLoading,
  period,
  onPeriodChange,
}: OverviewCardProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const isPositive = trend !== 'DOWN';
  const selectedLabel = FILTERS.find((f) => f.value === period)?.label ?? 'Past 30 Days';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-4 lg:gap-8 p-4 lg:px-5 lg:py-5 bg-[var(--inner-card)] border border-[var(--fg)]/5 shadow-sm hover:shadow-md hover:-translate-y-1 rounded-2xl transition-all duration-300 text-[var(--fg)]">
      <div className="flex flex-col gap-2 sm:flex-row md:flex-col lg:flex-row items-center justify-between">
        <p className="font-18">{title}</p>

        <div ref={dropdownRef} className="relative">
          <button onClick={() => setOpen(!open)} className="flex items-center gap-2 transition">
            <span className="font-14">{selectedLabel}</span>
            <FiChevronDown className={`transition ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="absolute right-0 z-20 mt-2 w-44 bg-[var(--card)] border border-white/10 rounded-lg overflow-hidden">
              {FILTERS.map((item) => (
                <button
                  key={item.value}
                  onClick={() => {
                    onPeriodChange(item.value);
                    setOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs xl:text-sm transition hover:bg-white/5"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row items-center justify-center sm:justify-between lg:justify-start xl:justify-start">
        {isLoading ? (
          <div className="h-9 w-36 bg-[var(--fg)]/10 rounded animate-pulse" />
        ) : (
          <span className="font-30 xl:font-new-40 font-medium leading-[100%] whitespace-nowrap">
            ₹ {value.toLocaleString('en-IN')}
          </span>
        )}

        {!isLoading && changePercent !== undefined && (
          <div
            className={`flex items-center justify-center gap-1 px-2 py-1 font-16 rounded-sm ${
              isPositive ? 'bg-[#33BD5629] text-[#33BD56]' : 'bg-[#F03F2329] text-[#F03F23]'
            }`}
          >
            {label ?? `${isPositive ? '+' : ''}${changePercent.toFixed(2)}%`}
            <img
              src={isPositive ? '/images/dashboard/stats.svg' : '/images/dashboard/stats-down.svg'}
              alt="stats"
            />
          </div>
        )}
      </div>
    </div>
  );
}
