type OverviewStatsCardProps = {
  title: string;
  total: string | number;
  leftText: string;
  rightText: string;
  backgroundClass: string; 
};

export default function OverviewStatsCard({
  title,
  total,
  leftText,
  rightText,
  backgroundClass,
}: OverviewStatsCardProps) {
  return (
    <div
      className={`
        ${backgroundClass}
        rounded-xl
        px-6 py-5
        w-full font-work
      `}
    >
      <div className="text-center space-y-2">
        <p className="font-20 font-normal">{title}</p>
        <p className="font-36 font-meduim">{total}</p>
      </div>

      <div className="h-px bg-dark-grey my-4" />
      <div className="flex gap-2 justify-around text-center items-center">
        <p className="font-16 font-normal">{leftText}</p>
        <p className="h-6 w-px bg-dark-grey my-4"></p>
        <p className="font-16 font-normal ">{rightText}</p>
      </div>
    </div>
  );
}
