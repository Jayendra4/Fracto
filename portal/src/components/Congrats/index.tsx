interface CongratsProps {
  title: string;
  subtitle: string;
  highlightText: string;
}

export default function Congrats({
  title,
  subtitle,
  highlightText,
}: CongratsProps) {
  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex flex-col">
          <h2 className="font-32 text-[var(--fg)] font-medium">{title}</h2>
          <p className="font-normal font-14 text-[var(--fg)]/40">{subtitle}</p>
        </div>
      </div>

      <div className="w-full h-[1px] bg-[var(--fg)]/10 mb-6"></div>

      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
          <img
            src="/images/complete.svg"
            alt="complete"
            className="w-[100px] relative z-10"
          />
        </div>

        <h2 className="font-44 font-medium text-green-500 mb-2">
          Congratulations!
        </h2>

        <p className="font-24 text-[var(--fg)]/80 max-w-[680px] text-center leading-relaxed">
          <span className="font-semibold text-green-500/80">
            {highlightText}
          </span>{' '}
          Let’s continue with the next step...
        </p>
      </div>
    </div>
  );
}
