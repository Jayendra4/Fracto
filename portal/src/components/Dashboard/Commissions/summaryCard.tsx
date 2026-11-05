/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed props, matches the pattern in rwa.api.ts */
export default function SummaryCard({
  icon,
  title,
  subtitle,
  value,
  meta,
  metaPositive,
  danger,
  action,
}: any) {
  return (
    <div
      className={`rounded-xl p-5 relative transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${
        danger
          ? 'border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 shadow-sm'
          : 'bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/5 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#4F46E5]/20 to-[#2563EB]/10 border border-[#4F46E5]/15 flex items-center justify-center text-[#4F46E5] dark:text-[#60A5FA]">
          {icon}
        </div>

        {action && (
          <button className="font-12 font-semibold text-red-500 dark:text-red-400 hover:underline">
            {action}
          </button>
        )}
      </div>

      <div className="flex flex-row gap-1 items-center mt-4">
        <p className="font-12 text-gray-500 dark:text-gray-400">{title}</p>
        {subtitle && (
          <p className="text-[10px] text-gray-400 dark:text-gray-500">
            ({subtitle})
          </p>
        )}
      </div>
      <p className="font-14 md:font-16 font-semibold text-[#0B2545] dark:text-white mt-2">
        {value}
      </p>

      {meta && (
        <p
          className={`text-[10px] mt-2 ${
            metaPositive ? 'text-green-500' : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          {meta}
        </p>
      )}
    </div>
  );
}
