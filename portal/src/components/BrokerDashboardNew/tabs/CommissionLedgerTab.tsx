// import { useState, useRef, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { FiSearch, FiChevronDown } from 'react-icons/fi';
import CommissionHistoryTable from './CommissionHistoryTable';

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
//           className="bg-gray-55 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg py-2 px-3 text-xs md:text-sm font-normal text-gray-800 dark:text-white flex items-center justify-between cursor-pointer focus:border-[#1F4FE0] focus:ring-1 focus:ring-[#1F4FE0] select-none"
//         >
//           <span>{value}</span>
//           <FiChevronDown
//             className={`text-gray-500 dark:text-gray-300 transition-transform ${open ? 'rotate-180' : ''}`}
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

interface CommissionLedgerTabProps {
  showToast: (msg: string) => void;
}

export default function CommissionLedgerTab({
  showToast,
}: CommissionLedgerTabProps) {
  void showToast;
  // const navigate = useNavigate();
  // const [showEmptyPreview, setShowEmptyPreview] = useState(false);
  // const [searchQuery, setSearchQuery] = useState('');
  // const [statusFilter, setStatusFilter] = useState('All Statuses');

  return (
    <div className="space-y-6">
      {/* Filters bar */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative col-span-1 sm:col-span-2">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <FiSearch />
          </span>
          <input
            type="text"
            placeholder="Search commission entries…"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            className="w-full bg-gray-55 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg py-2 pl-9 pr-3 text-xs md:text-sm font-normal text-gray-850 dark:text-white focus:outline-none focus:border-[#1F4FE0] focus:ring-1 focus:ring-[#1F4FE0]"
          />
        </div>
        <CustomSelect
          value={statusFilter}
          options={[
            'All Statuses',
            'Paid',
            'Pending Funding Close',
            'Not Yet Eligible',
          ]}
          onChange={(val) => {
            setStatusFilter(val);
          }}
        />
      </div> */}

      {/* One-time */}
      {/* <div className="bg-white dark:bg-[#132436] p-4 sm:p-6 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm space-y-4">
        <h3 className="font-serif text-lg font-semibold text-[#0B2545] dark:text-white border-b border-gray-300 dark:border-white/5 pb-2">
          One-Time Commission
        </h3>
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[550px] text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b border-gray-400 dark:border-white/10 text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold whitespace-nowrap">
                <th className="py-3 px-2 sm:px-3">Source</th>
                <th className="py-3 px-2 sm:px-3">Basis</th>
                <th className="py-3 px-2 sm:px-3">Amount</th>
                <th className="py-3 px-2 sm:px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 dark:divide-white/5 text-gray-700 dark:text-gray-300">
              <tr>
                <td className="py-3.5 px-2 sm:px-3 font-medium text-gray-800 dark:text-white">
                  FRACTO-LEAD-0042 (Investor, Sora Heights)
                </td>
                <td className="py-3.5 px-2 sm:px-3 whitespace-nowrap">
                  0.5% of subscription
                </td>
                <td className="py-3.5 px-2 sm:px-3 whitespace-nowrap font-semibold">
                  ₹7,500
                </td>
                <td className="py-3.5 px-2 sm:px-3 whitespace-nowrap">
                  <span className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">
                    Paid
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-2 sm:px-3 font-medium min-w-[200px] text-gray-800 dark:text-white">
                  <div>Heritage Court (Owner Sourcing)</div>
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    <span className="bg-blue-50 dark:bg-blue-900/20 text-[#1F4FE0] dark:text-[#60a5fa] border border-[#1F4FE0]/25 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      Timeshare
                    </span>
                    <span className="bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      Sale
                    </span>
                  </div>
                </td>
                <td className="py-3.5 px-2 sm:px-3 whitespace-nowrap">
                  Flat referral fee
                </td>
                <td className="py-3.5 px-2 sm:px-3 whitespace-nowrap font-semibold">
                  ₹25,000
                </td>
                <td className="py-3.5 px-2 sm:px-3 whitespace-nowrap">
                  <span className="bg-amber-50 dark:bg-amber-900/15 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">
                    Pending Funding Close
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-2 sm:px-3 font-medium text-gray-800 dark:text-white">
                  FRACTO-LEAD-0039 (Investor, in progress)
                </td>
                <td className="py-3.5 px-2 sm:px-3 whitespace-nowrap">
                  0.5% of subscription
                </td>
                <td className="py-3.5 px-2 sm:px-3 whitespace-nowrap font-semibold text-gray-500 dark:text-gray-400">
                  Est. ₹4,200
                </td>
                <td className="py-3.5 px-2 sm:px-3 whitespace-nowrap">
                  <span className="bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/5 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">
                    Not Yet Eligible
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-gray-200 dark:border-white/5 mt-4">
          Commission is calculated and paid by Fracto directly — you do
          not collect or hold any investor or owner funds at any point.
        </div>
      </div> */}

      {/* Trailing override */}
      {/* <div className="bg-white dark:bg-[#132436] p-4 sm:p-6 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm space-y-4">
        <h3 className="font-serif text-lg font-semibold text-[#0B2545] dark:text-white border-b border-gray-300 dark:border-white/5 pb-2">
          Trailing Override — Timeshare &amp; Sale Profit
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          A small override on Timeshare Income and Post-Launch Sale Profit
          generated by assets you sourced, in addition to your one-time sourcing
          fee — paid out only once the asset reaches Managed/exit and those
          distributions actually occur.
        </p>
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[550px] text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b border-gray-150 dark:border-white/10 text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold whitespace-nowrap">
                <th className="py-3 px-2 sm:px-3">Source</th>
                <th className="py-3 px-2 sm:px-3">Basis</th>
                <th className="py-3 px-2 sm:px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 dark:divide-white/5 text-gray-700 dark:text-gray-300">
              <tr>
                <td className="py-3.5 px-2 sm:px-3 font-medium text-gray-800 dark:text-white min-w-[180px]">
                  Heritage Court — Timeshare Override
                </td>
                <td className="py-3.5 px-2 sm:px-3 whitespace-nowrap">
                  0.25% of Timeshare Income, once operating
                </td>
                <td className="py-3.5 px-2 sm:px-3 whitespace-nowrap">
                  <span className="bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/5 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">
                    Not Yet Eligible — asset still in Valuation Review
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-2 sm:px-3 font-medium text-gray-800 dark:text-white min-w-[180px]">
                  Heritage Court — Sale Profit Override
                </td>
                <td className="py-3.5 px-2 sm:px-3 whitespace-nowrap">
                  0.25% of Sale Profit, at exit
                </td>
                <td className="py-3.5 px-2 sm:px-3 whitespace-nowrap">
                  <span className="bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/5 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">
                    Not Yet Eligible — no exit proposed
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-2 sm:px-3 font-medium text-gray-800 dark:text-white min-w-[180px]">
                  Lakeview Commercial — Sale Profit Override
                </td>
                <td className="py-3.5 px-2 sm:px-3 whitespace-nowrap">
                  0.25% of Sale Profit, at exit
                </td>
                <td className="py-3.5 px-2 sm:px-3 whitespace-nowrap">
                  <span className="bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/5 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">
                    Not Yet Eligible — asset still in Preliminary Review
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-gray-550 dark:text-gray-400 leading-relaxed mt-2">
          Lakeview Commercial has no Timeshare override — it isn't tagged
          Timeshare-eligible.
        </p>
      </div> */}

      <CommissionHistoryTable />

      {/* <p
        className="text-[11px] text-gray-550 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white cursor-pointer underline inline-block"
        onClick={() => setShowEmptyPreview(!showEmptyPreview)}
      >
        Preview: what this looks like with no commission yet →
      </p>

      {showEmptyPreview && (
        <div className="bg-white dark:bg-[#132436] p-8 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm flex flex-col items-center justify-center text-center space-y-4 max-w-sm mx-auto">
          <div className="text-3xl">💰</div>
          <h3 className="font-serif text-lg font-semibold text-[#0B2545] dark:text-white">
            No commission earned yet
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Commission appears here once a referred lead converts and completes
            KYC, or a sourced asset closes funding.
          </p>
          <button
            className="flex items-center gap-2 bg-[#1F4FE0] hover:bg-[#153eb2] text-white text-xs md:text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm transition cursor-pointer"
            onClick={() => navigate('/dashboard/submit-lead')}
          >
            Submit a Lead
          </button>
        </div>
      )} */}
    </div>
  );
}
