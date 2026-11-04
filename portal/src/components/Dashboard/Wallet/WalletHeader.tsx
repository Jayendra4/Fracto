import { FiPlus } from 'react-icons/fi';

interface WalletHeaderProps {
  onAddBankClick: () => void;
}
export default function WalletHeader({ onAddBankClick }: WalletHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-6 px-8 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm bg-white dark:bg-[#132436] text-[#0B2545] dark:text-white flex-col md:flex-row">
      <div>
        <h3 className="font-serif text-base md:text-lg font-semibold text-center sm:text-left">
          Add Your Bank Account
        </h3>
        <p className="font-12 md:font-14 mt-1 text-gray-500 dark:text-gray-400 text-center sm:text-left">
          To start your investment journey we need to add bank account, please
          add your bank account.
        </p>
      </div>
      <button
        onClick={onAddBankClick}
        className="px-5 py-2.5 bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] text-white hover:shadow-md hover:brightness-110 transition-all duration-300 font-12 rounded-lg font-semibold flex flex-row justify-center items-center gap-2 cursor-pointer whitespace-nowrap"
      >
        <FiPlus size={16} />
        <span>Add Now</span>
      </button>
    </div>
  );
}
