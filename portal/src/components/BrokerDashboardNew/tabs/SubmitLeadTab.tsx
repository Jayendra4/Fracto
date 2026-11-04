import { useState } from 'react';
import LeadsTable from './LeadsTable';

// function CustomSelect({
//   label,
//   value,
//   options,
//   onChange,
// }: {
//   label?: string;
//   value: string;
//   options: string[];
//   onChange: (val: string) => void;
// }) {
//   const [open, setOpen] = useState(false);
//   const ref = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const handler = (e: MouseEvent) => {
//       if (ref.current && !ref.current.contains(e.target as Node)) {
//         setOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handler);
//     return () => document.removeEventListener('mousedown', handler);
//   }, []);

//   return (
//     <div className="flex flex-col relative w-full" ref={ref}>
//       {label && (
//         <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
//           {label}
//         </label>
//       )}
//       <div className="relative">
//         <div
//           onClick={() => setOpen(!open)}
//           className="bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg py-2 px-3 text-xs md:text-sm font-normal text-gray-850 dark:text-white flex items-center justify-between cursor-pointer focus:border-[#1F4FE0] focus:ring-1 focus:ring-[#1F4FE0] select-none"
//         >
//           <span>{value}</span>
//           <FiChevronDown
//             className={`text-gray-500 dark:text-gray-305 transition-transform ${open ? 'rotate-180' : ''}`}
//           />
//         </div>
//         {open && (
//           <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#1c3147] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl max-h-60 overflow-y-auto">
//             <ul className="py-1 divide-y divide-gray-150 dark:divide-white/5">
//               {options.map((opt) => (
//                 <li
//                   key={opt}
//                   onClick={() => {
//                     onChange(opt);
//                     setOpen(false);
//                   }}
//                   className={`px-3 py-2 text-xs md:text-sm text-start cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition ${
//                     value === opt
//                       ? 'bg-[#E8EEFC] dark:bg-blue-900/40 text-[#1F4FE0] dark:text-blue-300 font-semibold'
//                       : 'text-gray-800 dark:text-white'
//                   }`}
//                 >
//                   {opt}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

export default function SubmitLeadTab() {
  // const navigate = useNavigate();
  const [leadType, setLeadType] = useState<'investor' | 'owner'>('investor');
  // const [assetType, setAssetType] = useState('Residential');

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   // Navigate to referrals tab
  //   navigate('/dashboard/my-referrals');
  // };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-serif font-semibold text-[#0B2545] dark:text-white">
          Submit a Lead
        </h1>
        <p className="text-xs md:text-sm text-gray-550 dark:text-gray-400 mt-1">
          Refer a Investor or an asset owner you've identified.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E3E7EE] dark:border-white/10 pb-0 mb-6 gap-6">
        <button
          className={`${
            leadType === 'investor'
              ? 'border-b-2 border-[#1F4FE0] text-[#1F4FE0] dark:text-[#60a5fa] font-bold'
              : 'text-gray-550 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-350'
          } pb-2 text-xs md:text-sm cursor-pointer`}
          onClick={() => setLeadType('investor')}
        >
          Investor Lead
        </button>
        <button
          className={`${
            leadType === 'owner'
              ? 'border-b-2 border-[#1F4FE0] text-[#1F4FE0] dark:text-[#60a5fa] font-bold'
              : 'text-gray-550 hover:text-gray-600 dark:text-gray-400'
          } pb-2 text-xs md:text-sm cursor-pointer`}
          onClick={() => setLeadType('owner')}
        >
          Asset Owner Lead
        </button>
      </div>

      {/* <form
        className="bg-white dark:bg-[#132436] p-6 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm space-y-6"
        onSubmit={handleSubmit} */}
      {/* > */}
      {/* Investor Lead */}
      {/* {leadType === 'investor' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  Investor Full Name
                </label>
                <input
                  type="text"
                  placeholder="As they'd register"
                  required
                  className="bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg py-2 px-3 text-xs md:text-sm font-normal text-gray-850 dark:text-white focus:outline-none focus:border-[#1F4FE0] focus:ring-1 focus:ring-[#1F4FE0]"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  Mobile / Email
                </label>
                <input
                  type="text"
                  placeholder="Contact details"
                  required
                  className="bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg py-2 px-3 text-xs md:text-sm font-normal text-gray-850 dark:text-white focus:outline-none focus:border-[#1F4FE0] focus:ring-1 focus:ring-[#1F4FE0]"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  Approximate Investment Interest (₹)
                </label>
                <input
                  type="text"
                  placeholder="Indicative only"
                  required
                  className="bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg py-2 px-3 text-xs md:text-sm font-normal text-gray-850 dark:text-white focus:outline-none focus:border-[#1F4FE0] focus:ring-1 focus:ring-[#1F4FE0]"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  required
                  className="bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg py-2 px-3 text-xs md:text-sm font-normal text-gray-850 dark:text-white focus:outline-none focus:border-[#1F4FE0] focus:ring-1 focus:ring-[#1F4FE0]"
                />
              </div>
            </div>
          </div>
        )} */}

      {/* Asset Owner Lead */}
      {/* {leadType === 'owner' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  Owner Full Name / Entity
                </label>
                <input
                  type="text"
                  required
                  className="bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg py-2 px-3 text-xs md:text-sm font-normal text-gray-850 dark:text-white focus:outline-none focus:border-[#1F4FE0] focus:ring-1 focus:ring-[#1F4FE0]"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  Mobile / Email
                </label>
                <input
                  type="text"
                  required
                  className="bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg py-2 px-3 text-xs md:text-sm font-normal text-gray-850 dark:text-white focus:outline-none focus:border-[#1F4FE0] focus:ring-1 focus:ring-[#1F4FE0]"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  Asset City
                </label>
                <input
                  type="text"
                  required
                  className="bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg py-2 px-3 text-xs md:text-sm font-normal text-gray-850 dark:text-white focus:outline-none focus:border-[#1F4FE0] focus:ring-1 focus:ring-[#1F4FE0]"
                />
              </div>
              <div className="flex flex-col">
                <CustomSelect
                  label="Asset Type"
                  value={assetType}
                  options={['Residential', 'Commercial']}
                  onChange={setAssetType}
                />
              </div>
            </div>
          </div>
        )} */}
      {/* 
        <div className="pt-4 border-t border-gray-100 dark:border-white/5">
          <button
            type="submit"
            className="flex items-center gap-2 bg-[#1F4FE0] hover:bg-[#153eb2] text-white text-xs md:text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm transition cursor-pointer"
          >
            Submit Lead
          </button>
        </div>
      </form> */}

      {/* Leads Table */}
      <LeadsTable
        type={leadType === 'investor' ? 'InvestorSignup' : 'AssetOwnerSignup'}
      />
    </div>
  );
}
