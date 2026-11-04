import { FiCheck, FiX } from 'react-icons/fi';

export default function TrainingRulesTab() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-serif font-semibold text-[#0B2545] dark:text-white">
          Training &amp; Rules
        </h1>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
          What you can and cannot do as a Channel Partner.
        </p>
      </div>

      <div className="bg-white dark:bg-[#132436] p-6 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm space-y-3">
        <h3 className="font-semibold text-base border-b border-gray-300 dark:border-white/5 pb-2 text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <FiCheck /> You May
        </h3>
        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          Submit investor and asset owner leads, source and submit assets for
          onboarding, share approved listings with your own network via tracked
          links, and earn commission on conversions as agreed in your Channel
          Partner Agreement.
        </p>
      </div>

      <div className="bg-white dark:bg-[#132436] p-6 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm space-y-3">
        <h3 className="font-semibold text-base border-b border-gray-300 dark:border-white/5 pb-2 text-rose-600 dark:text-rose-455 flex items-center gap-2">
          <FiX /> You May Not
        </h3>
        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          Promise or imply any guaranteed return, collect money from investors
          or owners on behalf of the platform, provide investment advice,
          misrepresent House of Frac, share confidential or legal documents
          externally, or guarantee approval or funding outcomes.
        </p>
      </div>
    </div>
  );
}
