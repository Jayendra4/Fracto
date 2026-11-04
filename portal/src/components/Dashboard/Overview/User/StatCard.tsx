export default function StatCard({
  title,
  value,
  changePercent,
  trend,
  isLoading,
}: {
  title: string;
  value: number;
  changePercent?: number;
  trend?: 'UP' | 'DOWN';
  isLoading?: boolean;
}) {
  const isPositive = trend !== 'DOWN';

  return (
    <div className="p-4 lg:py-5 lg:px-6 flex flex-col gap-4 lg:gap-8 bg-[var(--inner-card)] border border-[var(--fg)]/5 shadow-sm hover:shadow-md hover:-translate-y-1 rounded-2xl transition-all duration-300 text-[var(--fg)]">
      <p className="font-18 text-center sm:text-left">{title}</p>
      <div className="flex flex-col lg:flex-row items-center justify-center md:justify-between lg:justify-start gap-2">
        {isLoading ? (
          <div className="h-9 w-36 bg-[var(--fg)]/10 rounded animate-pulse" />
        ) : (
          <span className="font-30 xl:font-new-40 font-medium leading-[100%] whitespace-nowrap">
            ₹ {value.toLocaleString('en-IN')}
          </span>
        )}
        {!isLoading && changePercent !== undefined && (
          <div
            className={`font-16 flex flex-row justify-center items-center gap-1 py-1 px-2 rounded-sm ${
              isPositive
                ? 'bg-[#33BD5629] text-[#33BD56]'
                : 'bg-[#F03F2329] text-[#F03F23]'
            }`}
          >
            {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
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
