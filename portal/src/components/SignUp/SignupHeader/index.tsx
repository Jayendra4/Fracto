import { HiArrowLongLeft } from 'react-icons/hi2';

export default function SignupHeader({
  handleBack,
}: {
  handleBack: () => void;
}) {
  return (
    <div className=" flex justify-center items-center bottom-6 z-50">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 font-18 px-3 py-2 bg-transparent border border-transparent  rounded-md text-[var(--fg)] cursor-pointer"
      >
        <HiArrowLongLeft size={20} />
        <span className="font-18">Back</span>
      </button>
    </div>
  );
}
