import { FiCheckCircle, FiUser } from "react-icons/fi";

type Status = 'pending' | 'completed';

interface ComplianceCardProps {
  title: string;
  description: string;
  status: Status;
}

export function ComplianceCard({
  title,
  description,
  status,
}: ComplianceCardProps) {
  const isCompleted = status === 'completed';

  return (
    <div className="flex items-center justify-between rounded-xl border border-[var(--fg)]/10 px-3 md:px-5 py-4">
      <div className="flex items-start gap-2 md:gap-4">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            isCompleted
              ? 'bg-green-500/12 text-green-400'
              : 'bg-[#E56B00]/12 text-[#E56B00]'
          }`}
        >
          {isCompleted ? (
            <FiCheckCircle className="text-lg" />
          ) : (
            <FiUser className="text-lg" />
          )}
        </div>

        <div>
          <p className="font-16 font-semibold text-[var(--fg)]">{title}</p>
          <p className="font-14 text-[var(--fg)]/70">{description}</p>
        </div>
      </div>

      <span
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-md border text-xs ${
          isCompleted
            ? 'bg-green/12 text-green'
            : 'bg-[#E56B00]/12 text-[#E56B00]'
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${
            isCompleted ? 'bg-green' : 'bg-[#E56B00]'
          }`}
        />
        {isCompleted ? 'Completed' : 'Pending'}
      </span>
    </div>
  );
}
