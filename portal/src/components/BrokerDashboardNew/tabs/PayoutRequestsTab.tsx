// import { useState } from 'react';
// import { FiSearch } from 'react-icons/fi';
import CommissionSummaryCards from './CommissionSummaryCards';

export default function PayoutRequestsTab() {
  // const [showModal, setShowModal] = useState(false);
  // const [showEmptyPreview, setShowEmptyPreview] = useState(false);
  // const [searchQuery, setSearchQuery] = useState('');
  // const [payouts, setPayouts] = useState([
  //   { date: '10 Jun 2026', amount: '₹18,500', status: 'Paid' },
  //   { date: '02 Mar 2026', amount: '₹22,000', status: 'Paid' },
  // ]);
  // const [availablePayout, setAvailablePayout] = useState(38200);

  // const handleRequestPayout = () => {
  //   setShowModal(true);
  // };

  // const handleConfirmPayout = () => {
  //   setShowModal(false);
  //   const newPayout = {
  //     date: new Date().toLocaleDateString('en-GB', {
  //       day: '2-digit',
  //       month: 'short',
  //       year: 'numeric',
  //     }),
  //     amount: `₹${availablePayout.toLocaleString()}`,
  //     status: 'Awaiting Admin Review',
  //   };
  //   setPayouts([newPayout, ...payouts]);
  //   setAvailablePayout(0);
  // };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-serif font-semibold text-[#0B2545] dark:text-white">
          Payout Requests
        </h1>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Request and track payout of eligible commission.
        </p>
      </div>

      <CommissionSummaryCards />

      {/* Eligible box */}
      {/* <div className="bg-white dark:bg-[#132436] p-6 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-base md:text-lg text-[#0B2545] dark:text-white">
            Available for Payout:{' '}
            <span className="text-[#1F4FE0] dark:text-[#60a5fa] font-bold">
              ₹{availablePayout.toLocaleString()}
            </span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-1.5 max-w-xl">
            This is one-time commission only. Trailing Override amounts
            (Timeshare/Sale Profit) aren't included — see Commission Ledger;
            they become payable once the sourced asset reaches Managed/exit.
          </p>
        </div>
        <div className="shrink-0">
          {availablePayout > 0 ? (
            <button
              className="flex items-center justify-center bg-[#1F4FE0] hover:bg-[#153eb2] text-white text-xs md:text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm transition cursor-pointer w-full md:w-auto"
              onClick={handleRequestPayout}
            >
              Request Payout
            </button>
          ) : (
            <button
              className="flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-450 dark:text-gray-500 text-xs md:text-sm font-semibold px-5 py-2.5 rounded-lg border border-gray-250 dark:border-white/10 cursor-not-allowed w-full md:w-auto"
              disabled
            >
              No Eligible Commission
            </button>
          )}
        </div>
      </div> */}

      {/* Search History */}
      {/* <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
          <FiSearch />
        </span>
        <input
          type="text"
          placeholder="Search payout history…"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
          className="w-full bg-gray-55 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg py-2 pl-9 pr-3 text-xs md:text-sm font-normal text-gray-850 dark:text-white focus:outline-none focus:border-[#1F4FE0] focus:ring-1 focus:ring-[#1F4FE0]"
        />
      </div> */}

      {/* History table */}
      {/* <div className="bg-white dark:bg-[#132436] p-6 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm space-y-4">
        <h3 className="font-serif text-lg font-semibold text-[#0B2545] dark:text-white border-b border-gray-300 dark:border-white/5 pb-2">
          Payout History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b border-gray-150 dark:border-white/10 text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-2">Date Requested</th>
                <th className="py-3 px-2">Amount</th>
                <th className="py-3 px-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 dark:divide-white/5 text-gray-700 dark:text-gray-300">
              {payouts.map((p, idx) => (
                <tr key={idx}>
                  <td className="py-3.5 px-2 font-medium">{p.date}</td>
                  <td className="py-3.5 px-2 font-semibold">{p.amount}</td>
                  <td className="py-3.5 px-2 text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        p.status === 'Paid'
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30'
                          : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/30'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p
        className="text-[11px] text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white cursor-pointer underline inline-block"
        onClick={() => setShowEmptyPreview(!showEmptyPreview)}
      >
        Preview: what this looks like with no payout history yet →
      </p>

      {showEmptyPreview && (
        <div className="bg-white dark:bg-[#132436] p-8 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm flex flex-col items-center justify-center text-center space-y-4 max-w-sm mx-auto">
          <div className="text-3xl">🏦</div>
          <h3 className="font-serif text-lg font-semibold text-[#0B2545] dark:text-white">
            No payouts requested yet
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Once you have eligible commission, request a payout here — it's
            credited to your verified bank account.
          </p>
        </div>
      )} */}

      {/* CONFIRM MODAL */}
      {/* {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#132436] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-2xl space-y-6 p-6">
            <div>
              <h3 className="font-semibold text-lg text-[#0B2545] dark:text-white mb-2">
                Request Payout of ₹38,200?
              </h3>
              <p className="text-sm text-gray-550 dark:text-gray-450 leading-relaxed">
                This will submit a payout request for your full eligible
                commission balance to your verified payout bank account.
                Processing typically takes 3-5 business days.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-150 dark:border-white/5">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-white dark:bg-white/5 border border-gray-250 dark:border-white/10 hover:bg-gray-55 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs md:text-sm font-semibold rounded-lg shadow-sm transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPayout}
                className="px-4 py-2 bg-[#1F4FE0] hover:bg-[#153eb2] text-white text-xs md:text-sm font-semibold rounded-lg shadow-md transition cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}
