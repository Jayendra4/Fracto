import { FiCheck, FiRefreshCw } from "react-icons/fi";

type TimelineStatus = 'completed' | 'active' | 'pending';

type TimelineStepProps = {
  title: string;
  subtitle?: string;
  status: TimelineStatus;
  isLast?: boolean;
};

export function TimelineStep({
  title,
  subtitle,
  status,
  isLast = false,
}: TimelineStepProps) {
  return (
    <div className="relative flex gap-4">
      <div className="relative flex flex-col items-center py-2">
        <div
          className={`
            flex h-6 w-6 items-center justify-center rounded-full z-10
            ${
              status === 'completed'
                ? 'bg-green-500 text-white'
                : status === 'active'
                  ? 'border-2 border-blue-400 text-blue-400'
                  : 'border-2 border-gray text-gray'
            }
          `}
        >
          {status === 'completed' && <FiCheck />}
          {status === 'active' && <FiRefreshCw />}
        </div>
        {!isLast && (
          <div
            className={`
              w-px flex-1 mt-1
              ${
                status === 'completed'
                  ? 'bg-green-500/60'
                  : status === 'active'
                    ? 'bg-blue-400/60'
                    : 'bg-[var(--fg)]'
              }
            `}
          />
        )}
      </div>

      {/* Content */}
      <div className="pb-10">
        <p
          className={`
            font-20 font-medium
            ${status === 'active' ? 'text-blue-400' : 'text-[var(--fg)]'}
          `}
        >
          {title}
        </p>

        {subtitle && <p className="font-16 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
