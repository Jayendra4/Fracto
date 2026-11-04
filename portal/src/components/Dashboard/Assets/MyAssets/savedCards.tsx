import { useNavigate } from 'react-router-dom';
import { CiLocationOn } from 'react-icons/ci';
import { FiShield } from 'react-icons/fi';
import { FaAngleRight } from 'react-icons/fa';
type Asset = {
  id: number | string;
  title: string;
  type: string;
  verified?: boolean;
  location: string;
  investment: number;
  ownership: number;
  yield: number;
  value: number;
  growth: number;
  image?: string;
  priceFraction: number;
  roi: number;
  savedyield: number;
  isSoldOut?: boolean;
};
export default function SavedCard({ asset }: { asset: Asset }) {
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const imageUrl = (asset.image || '').startsWith('http')
    ? asset.image
    : `${API_BASE_URL}/storage/${asset.image}`;
  const navigate = useNavigate();
  return (
    <div className="flex flex-col w-full sm:max-w-[380px] lg:max-w-[400px] bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 text-[#0B2545] dark:text-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-xl overflow-hidden">
      <div className="w-full aspect-video overflow-hidden shrink-0">
        <img
          src={imageUrl}
          alt={asset.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
      </div>
      <div className="p-4 space-y-4 flex-grow flex flex-col justify-between">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-[#0B2545] dark:text-white font-14 md:font-16 line-clamp-1">
              {asset.title}
            </h3>
            {asset.verified && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-green/30 bg-green/10 text-green text-[8px] font-bold uppercase tracking-wider shrink-0">
                <FiShield size={8} />
                Verified
              </div>
            )}
          </div>
          <p className="text-gray-400 dark:text-gray-500 font-12 flex items-center gap-1">
            <CiLocationOn className="text-sm shrink-0" />
            {asset.location}
          </p>
        </div>

        <div className="w-full h-px bg-dark-grey/10" />

        <div className="space-y-2 font-12">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400">
              Price of Structural Co-ownership:
            </span>
            <span className="font-semibold text-[#0B2545] dark:text-white">
              ₹ {asset.priceFraction.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400">ROI:</span>
            <span className="font-semibold text-green">{asset.roi}%</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400">Yield:</span>
            <span className="font-semibold text-blue-500">{asset.yield}%</span>
          </div>
        </div>

        <button
          onClick={() => navigate(`/property-details/${asset.id}`)}
          className="w-full text-white font-12 font-semibold rounded-lg bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden relative group/btn py-3 flex items-center justify-center gap-2"
        >
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out" />
          <span className="relative z-10 flex items-center gap-2">
            Get More Details{' '}
            <FaAngleRight className="group-hover/btn:translate-x-1 transition-transform duration-300" />
          </span>
        </button>
      </div>
    </div>
  );
}
