const PriceComingSoon = () => {
  return (
    <div className="bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 shadow-sm rounded-xl px-6 py-8 flex flex-col items-center gap-3 text-center">
      <div className="w-12 h-12 rounded-full bg-[#F5F8FF] dark:bg-white/10 flex items-center justify-center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-gray-400 dark:text-gray-500"
          />
          <path
            d="M12 7v5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="text-gray-400 dark:text-gray-500"
          />
          <circle
            cx="12"
            cy="16"
            r="0.75"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-gray-400 dark:text-gray-500"
          />
        </svg>
      </div>
      <div className="space-y-1.5">
        <p className="font-medium font-18 text-[#0B2545] dark:text-white">
          Asset details coming soon
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
          We are currently gathering the required information and will get back
          to you shortly with a detailed update.
        </p>
      </div>
    </div>
  );
};

export default PriceComingSoon;
