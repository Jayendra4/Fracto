import { type JSX } from 'react';
import { toast } from 'react-toastify';

const mattersRegister = [
  {
    spv: 'FRACTO-SPV-014',
    matter: 'Property Manager Renewal',
    raised: '08 Jun 2026',
    status: 'Vote Open' as const,
  },
  {
    spv: 'FRACTO-SPV-014',
    matter: 'Annual Capex Reserve Approval',
    raised: '02 Mar 2026',
    status: 'Passed' as const,
  },
  {
    spv: 'FRACTO-SPV-021',
    matter: 'Lease Renewal Approval — Anchor Tenant',
    raised: '14 Jan 2026',
    status: 'Passed' as const,
  },
];

const minutesArchive = [
  'FRACTO-SPV-014 — AGM Minutes, Mar 2026',
  'FRACTO-SPV-014 — Capex Reserve Vote Minutes, Mar 2026',
  'FRACTO-SPV-021 — Lease Renewal Vote Minutes, Jan 2026',
];

const distributionHistory = [
  {
    date: '12 Jun 2026',
    spv: 'FRACTO-SPV-014',
    gross: '₹48,500',
    tds: '₹6,500',
    net: '₹42,000',
  },
  {
    date: '15 Mar 2026',
    spv: 'FRACTO-SPV-021',
    gross: '₹1,15,000',
    tds: '₹15,000',
    net: '₹1,00,000',
  },
  {
    date: '10 Dec 2025',
    spv: 'FRACTO-SPV-014',
    gross: '₹50,800',
    tds: '₹6,600',
    net: '₹44,200',
  },
];

function StatusPill({ status }: { status: 'Vote Open' | 'Passed' }) {
  const isPassed = status === 'Passed';
  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
        isPassed
          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
          : 'bg-[#F5A623]/10 text-[#F5A623]'
      }`}
    >
      {status}
    </span>
  );
}

export default function GovernanceTab(): JSX.Element {
  return (
    <div className="space-y-6">
      <div className="pagehead">
        <h1 className="font-serif font-24 md:font-30 font-semibold text-[#0B2545] dark:text-white">
          Governance
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-14 mt-1">
          Reserved matters, meeting records, and distribution history across
          your SPVs.
        </p>
      </div>

      <div className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm overflow-x-auto">
        <h3 className="font-semibold font-14 md:font-16 text-[#0B2545] dark:text-white mb-4">
          Reserved Matters Register
        </h3>
        <table className="w-full text-left font-12">
          <thead>
            <tr className="text-[var(--fg)]/60 uppercase font-12 tracking-wide border-b border-[#E3E7EE] dark:border-white/10">
              <th className="py-2 pr-4 font-medium">SPV</th>
              <th className="py-2 pr-4 font-medium">Matter</th>
              <th className="py-2 pr-4 font-medium">Raised</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 pr-4 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {mattersRegister.map((m, idx) => (
              <tr
                key={idx}
                className="border-b border-[#E3E7EE] dark:border-white/10 last:border-0"
              >
                <td className="py-3 pr-4 text-[#0B2545] dark:text-white font-medium whitespace-nowrap">
                  {m.spv}
                </td>
                <td className="py-3 pr-4 text-gray-500 dark:text-gray-300">
                  {m.matter}
                </td>
                <td className="py-3 pr-4 text-gray-500 dark:text-gray-300 whitespace-nowrap">
                  {m.raised}
                </td>
                <td className="py-3 pr-4">
                  <StatusPill status={m.status} />
                </td>
                <td className="py-3 pr-4">
                  <button
                    onClick={() => toast.info(`Opening ${m.matter}`)}
                    className="text-[#1F4FE0] dark:text-[#60a5fa] font-medium cursor-pointer hover:underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm">
        <h3 className="font-semibold font-14 md:font-16 text-[#0B2545] dark:text-white mb-4">
          Meeting Minutes Archive
        </h3>
        <div className="space-y-1">
          {minutesArchive.map((doc) => (
            <div
              key={doc}
              className="flex items-center justify-between py-2.5 border-b border-[#E3E7EE] dark:border-white/10 last:border-0 font-12"
            >
              <span className="text-gray-600 dark:text-gray-300">{doc}</span>
              <button
                onClick={() => toast.info(`Downloading ${doc}`)}
                className="text-[#1F4FE0] dark:text-[#60a5fa] font-medium cursor-pointer hover:underline"
              >
                Download
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm overflow-x-auto">
        <h3 className="font-semibold font-14 md:font-16 text-[#0B2545] dark:text-white mb-4">
          Distribution History
        </h3>
        <table className="w-full text-left font-12">
          <thead>
            <tr className="text-[var(--fg)]/60 uppercase font-12 tracking-wide border-b border-[#E3E7EE] dark:border-white/10">
              <th className="py-2 pr-4 font-medium">Date</th>
              <th className="py-2 pr-4 font-medium">SPV</th>
              <th className="py-2 pr-4 font-medium">Gross Amount</th>
              <th className="py-2 pr-4 font-medium">TDS Deducted</th>
              <th className="py-2 pr-4 font-medium">Net Credited</th>
            </tr>
          </thead>
          <tbody>
            {distributionHistory.map((d, idx) => (
              <tr
                key={idx}
                className="border-b border-[#E3E7EE] dark:border-white/10 last:border-0"
              >
                <td className="py-3 pr-4 text-gray-500 dark:text-gray-300 whitespace-nowrap">
                  {d.date}
                </td>
                <td className="py-3 pr-4 text-[#0B2545] dark:text-white font-medium whitespace-nowrap">
                  {d.spv}
                </td>
                <td className="py-3 pr-4 text-gray-500 dark:text-gray-300">
                  {d.gross}
                </td>
                <td className="py-3 pr-4 text-gray-500 dark:text-gray-300">
                  {d.tds}
                </td>
                <td className="py-3 pr-4 text-[#0B2545] dark:text-white font-medium">
                  {d.net}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
