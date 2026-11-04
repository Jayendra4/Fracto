import { type JSX } from 'react';
import { toast } from 'react-toastify';

export default function ReportsTab(): JSX.Element {
  const reports = [
    {
      id: 1,
      name: 'Crescent Q1 2026 Asset Report',
      type: 'PDF Report',
      date: '15 May 2026',
      size: '2.4 MB',
    },
    {
      id: 2,
      name: 'Sora Heights FY25 Tax Statement',
      type: 'Tax Statement',
      date: '30 Apr 2026',
      size: '1.8 MB',
    },
    {
      id: 3,
      name: 'Heritage Court Valuation Dossier',
      type: 'Valuation Dossier',
      date: '10 Apr 2026',
      size: '4.1 MB',
    },
    {
      id: 4,
      name: 'HOF-SPV-014 Trust Deed (Executed)',
      type: 'Legal Document',
      date: '12 Mar 2026',
      size: '3.6 MB',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="pagehead">
        <h1 className="font-serif font-24 md:font-30 font-semibold text-[#0B2545] dark:text-white">
          Reports &amp; Statements
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-14 mt-1">
          Download monthly distribution summaries, tax certificates, and legal
          SPV deeds.
        </p>
      </div>

      <div className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold font-14 md:font-16 text-[#0B2545] dark:text-white">
            Available Downloads
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="border border-[#E3E7EE] dark:border-white/10 p-4 rounded-xl flex items-center justify-between hover:border-gray-300 dark:hover:border-white/20 transition"
            >
              <div>
                <h4 className="font-semibold font-14 text-[#0B2545] dark:text-white">
                  {rep.name}
                </h4>
                <p className="font-12 text-gray-400 mt-1">
                  {rep.type} · {rep.size} · Uploaded {rep.date}
                </p>
              </div>
              <button
                onClick={() => toast.info(`Downloading: ${rep.name}`)}
                className="bg-[#1F4FE0]/10 hover:bg-[#1F4FE0]/20 text-[#1F4FE0] dark:text-[#60a5fa] px-3.5 py-2 rounded-lg font-12 font-bold transition cursor-pointer"
              >
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
