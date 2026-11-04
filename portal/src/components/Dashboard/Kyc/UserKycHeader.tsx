import { Link } from 'react-router-dom';

export default function UserKycHeader() {
  return (
    <div className="w-full flex items-center justify-between sm:flex-row flex-col pb-3 gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="font-serif font-24 md:font-30 font-semibold text-[#0B2545] dark:text-white text-center sm:text-left">
          User KYC Verification
        </h2>
        <p className="font-14 text-gray-500 dark:text-gray-400 text-center sm:text-left">
          Complete your KYC. It will only take few minutes
        </p>
      </div>
      <Link
        to="/"
        className="
     whitespace-nowrap sm:block text-[#0B2545] dark:text-white bg-white dark:bg-white/5 border border-[#E3E7EE] dark:border-white/10 px-3 py-2 rounded-lg font-12 font-semibold hover:bg-gray-50 dark:hover:bg-white/10 transition
    "
      >
        Do It Later
      </Link>
    </div>
  );
}
