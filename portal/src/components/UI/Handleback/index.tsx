import { HiArrowLongLeft } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';

export default function HandleBack() {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex justify-center items-center bottom-6 z-40">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 font-20 px-0 py-2 bg-transparent border border-transparent rounded-md text-[var(--fg)]  cursor-pointer"
      >
        <HiArrowLongLeft size={24} />
        <span className="font-20">Back</span>
      </button>
    </div>
  );
}
