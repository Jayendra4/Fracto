type StatBox = {
  label: string;
  value: string | number;
};

type AssetStatusCardProps = {
  assetName: string;
  statusText: string;
  statusColor?: string;
  progressPercent: number;
  investedAmount: string;
  totalAmount: string;
  stats: StatBox[];
};

export default function AssetStatusCard({
  assetName,
  statusText,
  statusColor = 'text-green-600',
  progressPercent,
  investedAmount,
  totalAmount,
  // stats,
}: AssetStatusCardProps) {
  return (
    <div
      className="
      rounded-xl bg-gradient-to-b from-[var(--dark-card)] to-[var(--card)] border border-white/10  p-5 text-[var(--fg)]  space-y-5 font-work "
    >
      <div className="flex items-center justify-between">
        <p className="font-16 font-normal ">
          Asset Name:{' '}
          <span className=" font-20 font-semibold">{assetName}</span>{' '}
          <span className={`font-16 ${statusColor}`}>({statusText})</span>
        </p>
        {/* <span className="text-white/60"></span> */}
      </div>

      <div className="h-px bg-dark-grey my-4" />
      <div className="space-y-4">
        <p className="font-16  font-normal">Asset Status</p>

        <div className="flex items-center justify-between font-16  font-medium">
          <span>{progressPercent}% Liquidated</span>
          <span>
            {investedAmount} of {totalAmount}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-white/70 overflow-hidden">
          <div
            className="h-full bg-green rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
      <div className="space-y-2">
        <p className="font-16 ">Asset Projection</p>
        {/* <p className="font-16 font-medium">Estimated Completion and Value</p> */}

        {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
          {stats.map((item, index) => (
            <div
              key={index}
              className="
                rounded-lg
                bg-[var(--inner-card)]
                border border-white/20
                md:p-6 p-4
                space-y-1
              "
            >
              <p className="font-16  font-normal">{item.label}</p>
              <p className="font-16 font-medium">{item.value}</p>
            </div>
          ))}
        </div> */}
      </div>
    </div>
  );
}
