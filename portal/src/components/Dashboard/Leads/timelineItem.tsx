interface TimelineItemProps {
  title: string;
  timestamp: string;
  isLast?: boolean;
}

export function TimelineItem({ title, timestamp, isLast }: TimelineItemProps) {
  return (
    <div className="flex gap-4">
      <div className="relative flex flex-col items-center">
        <div className="h-6 w-6 p-1 bg-green/12 rounded-full flex items-center justify-center shrink-0">
          <div className="rounded-full h-3 w-3  bg-green shrink-0" />
        </div>
        {!isLast && <div className="w-px flex-1 bg-green" />}
      </div>
      <div className="pb-8 space-y-2">
        <p className="font-16 font-semibold text-[var(--fg)]">{title}</p>
        <p className="text-xs text-[var(--fg)]/70">{timestamp}</p>
      </div>
    </div>
  );
}
