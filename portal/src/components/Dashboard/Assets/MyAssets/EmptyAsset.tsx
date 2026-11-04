import { CiShare1 } from 'react-icons/ci';
import { Link } from 'react-router-dom';

export default function EmptyAssets() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 rounded-2xl py-16 lg:py-24 bg-[var(--inner-card)] border border-[var(--fg)]/5 shadow-sm text-[var(--fg)]">
      <p className="font-16 mb-2 text-[var(--fg)]/70">
        Nothing to show up here!
      </p>
      <p className="font-20  font-medium pb-5 flex flex-row items-center gap-2">
        Start Your Investment Journey, Click Here{' '}
        <img
          src="/images/dashboard/pointer-finger.svg"
          alt="pointer"
          className="h-7"
        />
      </p>
      <Link
        to={'/primary-club'}
        className="px-5 py-3 lg:px-9 lg:py-4 bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] shadow-md hover:shadow-lg hover:brightness-110 transition-all duration-300 text-white font-20 rounded-xl font-medium flex flex-row justify-center items-center gap-2 cursor-pointer max-w-[300px] whitespace-nowrap"
      >
        <CiShare1 size={24} className="bold" />
        <span> Explore Properties</span>
      </Link>
    </div>
  );
}
