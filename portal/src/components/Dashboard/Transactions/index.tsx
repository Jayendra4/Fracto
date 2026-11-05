import { useMyTransactions, type WalletTransaction } from '@/api';
import { useState } from 'react';

interface TableRow {
  id: string;
  deposit: number | null;
  purchase: number | null;
  withdraw: number | null;
  date: string;
  time: string;
  status: string;
  balance: number;
}

function parseTransactions(data: WalletTransaction[]): TableRow[] {
  return data.map((tx) => {
    const amount = Number(tx.amount) || 0;
    const dt = new Date(tx.timestamp);
    const date = dt.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const time = dt.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    let deposit: number | null = null;
    let purchase: number | null = null;
    let withdraw: number | null = null;

    const ctx = tx.context?.toLowerCase();

    if (ctx === 'deposit' && tx.type === 'Credit') {
      deposit = amount;
    } else if (ctx === 'fractionspurchase' && tx.type === 'Debit') {
      purchase = amount;
    } else if (ctx === 'withdraw' && tx.type === 'Debit') {
      withdraw = amount;
    } else if (tx.type === 'Credit') {
      deposit = amount;
    } else {
      withdraw = amount;
    }

    return {
      id: tx.id,
      deposit,
      purchase,
      withdraw,
      date,
      time,
      status: tx.status,
      balance: Number(tx.availableBalance) || 0,
    };
  });
}

function formatCurrency(value: number | null): string {
  if (value === null) return '—';
  return `${value.toLocaleString('en-IN')}`;
}

export default function Transactions() {
  const { data: response } = useMyTransactions();

  const transactions = response?.success ? (response?.data?.data ?? []) : [];

  const rows = parseTransactions(transactions);
  const [downloading, setDownloading] = useState(false);

  console.log(downloading);

  const totals = rows.reduce(
    (acc, row) => ({
      deposit: acc.deposit + (row.deposit ?? 0),
      purchase: acc.purchase + (row.purchase ?? 0),
      withdraw: acc.withdraw + (row.withdraw ?? 0),
    }),
    { deposit: 0, purchase: 0, withdraw: 0 }
  );

  const handleDownloadPDF = () => {
    setDownloading(true);
    const w = window.open('', '_blank');
    if (!w) {
      setDownloading(false);
      return;
    }

    w.document
      .write(`<!DOCTYPE html><html><head><title>Wallet Transactions</title><style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: Arial, sans-serif; padding: 40px; color: #111; background: #fff; }
      h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
      .sub { font-size: 12px; color: #888; margin-bottom: 28px; }
      .cards { display: flex; gap: 16px; margin-bottom: 28px; flex-wrap: wrap; }
      .card { border: 1px solid #e0e0e0; border-radius: 6px; padding: 14px 20px; flex: 1; min-width: 120px; }
      .card-lbl { font-size: 10px; color: #888; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px; }
      .card-val { font-size: 18px; font-weight: 700; }
      .dep { color: #15803d; } .pur { color: #b45309; } .wdr { color: #b91c1c; } .dim { color: #9ca3af; }
      table { width: 100%; border-collapse: collapse; font-size: 13px; }
      th { background: #111827; color: #fff; padding: 10px 14px; text-align: left; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; }
      td { padding: 12px 14px; border-bottom: 1px solid #f0f0f0; }
      .tot td { background: #f9fafb; font-weight: 700; font-size: 11px; }
      .badge { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; background: #dcfce7; color: #15803d; padding: 3px 10px; border-radius: 999px; }
      .dot { width: 5px; height: 5px; background: #15803d; border-radius: 50%; display: inline-block; }
      .foot { margin-top: 16px; font-size: 10px; color: #9ca3af; text-align: right; }
    </style></head><body>
      <h1>Wallet Transactions</h1>
      <p class="sub">Wallet ID: 147 &nbsp;·&nbsp; Generated ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
      <div class="cards">
        <div class="card"><div class="card-lbl">Total Deposits</div><div class="card-val dep">${formatCurrency(totals.deposit)}</div></div>
        <div class="card"><div class="card-lbl">Total Purchases</div><div class="card-val pur">${formatCurrency(totals.purchase)}</div></div>
        <div class="card"><div class="card-lbl">Total Withdrawals</div><div class="card-val dim">${formatCurrency(totals.withdraw)}</div></div>
      </div>
      <table>
        <thead><tr><th>#</th><th>Deposit</th><th>Purchase</th><th>Withdraw</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
        <tbody>
          ${rows
            .map(
              (row, i) => `
            <tr>
              <td class="dim">${String(i + 1).padStart(2, '0')}</td>
              <td class="${row.deposit !== null ? 'dep' : 'dim'}">${formatCurrency(row.deposit)}</td>
              <td class="${row.purchase !== null ? 'pur' : 'dim'}">${formatCurrency(row.purchase)}</td>
              <td class="${row.withdraw !== null ? 'wdr' : 'dim'}">${formatCurrency(row.withdraw)}</td>
              <td>${row.date}</td>
              <td class="dim">${row.time}</td>
              <td><span class="badge"><span class="dot"></span>${row.status}</span></td>
            </tr>
          `
            )
            .join('')}
          <tr class="tot">
            <td>Total</td>
            <td class="dep">${formatCurrency(totals.deposit)}</td>
            <td class="pur">${formatCurrency(totals.purchase)}</td>
            <td class="dim">${formatCurrency(totals.withdraw)}</td>
            <td colspan="3" class="dim">${rows.length} transactions</td>
          </tr>
        </tbody>
      </table>
    </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => {
      w.print();
      w.close();
      setDownloading(false);
    }, 600);
  };

  return (
    <div className="relative z-10 max-w-[1600px] mx-auto w-full flex-col space-y-12  pt-32 md:pt-40 text-[var(--fg)] px-4 lg:px-12 pb-7 font-work">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <h1 className="font-36 font-semibold text-(--fg)] ">Transactions</h1>
        </div>

        <button
          onClick={handleDownloadPDF}
          className={`w-[120px] h-11 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden relative group/btn 
               bg-gradient-to-r from-[#4F46E5] to-[#2563EB] text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 cursor-pointer
          }`}
        >
          {/* <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out" /> */}

          <span className="relative z-10 flex items-center gap-2">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>{' '}
            Export PDF{' '}
            {/* <FaAngleRight className="group-hover/btn:translate-x-1 transition-transform duration-300" /> */}
          </span>
        </button>

        {/* <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-[var(--fg)] text-xs font-semibold rounded-xl
                     hover:bg-gray-700 active:scale-95 transition-all duration-150
                     disabled:opacity-50 disabled:cursor-not-allowed
                     w-full sm:w-auto"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {downloading ? 'Preparing…' : 'Export PDF'}
        </button> */}
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-(--inner-card) rounded-lg border-var(--fg)/10   shadow-sm p-3 sm:p-5">
          <p className="text-[9px] sm:text-[10px] font-semibold text-[var(--fg)] uppercase tracking-widest mb-1">
            Total Deposits
          </p>
          <p className="text-sm sm:text-xl font-semibold text-[var(--fg)] truncate">
            {formatCurrency(totals.deposit)}
          </p>
        </div>
        <div className="bg-(--inner-card) rounded-lg border-var(--fg)/10  shadow-sm p-3 sm:p-5">
          <p className="text-[9px] sm:text-[10px] font-semibold text-[var(--fg)] uppercase tracking-widest mb-1">
            Total Purchases
          </p>
          <p className="text-sm sm:text-xl font-semibold text-[var(--fg)] truncate">
            {formatCurrency(totals.purchase)}
          </p>
        </div>
        <div className="bg-(--inner-card) rounded-lg border-var(--fg)/10  shadow-sm p-3 sm:p-5">
          <p className="text-[9px] sm:text-[10px] font-semibold text-[var(--fg)]  uppercase tracking-widest mb-1">
            Total Withdrawals
          </p>
          <p className="text-sm sm:text-xl font-semibold text-[var(--fg)] truncate">
            {formatCurrency(totals.withdraw)}
          </p>
        </div>
      </div>

      {/* ── Desktop Table (md+) ── */}
      <div className="hidden md:block bg-white rounded-2xl  border-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className=" bg-[#2A5A8D] font-18 text-white border-white/10">
                {[
                  'S.No.',
                  'Deposit',
                  'Purchase',
                  'Withdraw',
                  'Date',
                  'Time',
                  'Status',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-4 text-left font-18 uppercase whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#757575]">
              {rows.map((row, i) => (
                <tr key={row.id} className="bg-[var(--card)]">
                  <td className="px-5 py-4 text-xs text-[var(--fg)] font-mono">
                    {String(i + 1).padStart(2, '0')}
                  </td>
                  <td
                    className={`px-5 py-4 font-semibold ${row.deposit !== null ? 'text-[var(--fg)] ' : 'text-gray-200'}`}
                  >
                    {formatCurrency(row.deposit)}
                  </td>
                  <td
                    className={`px-5 py-4 font-semibold ${row.purchase !== null ? 'text-[var(--fg)] ' : 'text-gray-200'}`}
                  >
                    {formatCurrency(row.purchase)}
                  </td>
                  <td
                    className={`px-5 py-4 font-semibold ${row.withdraw !== null ? 'text-[var(--fg)]' : 'text-gray-200'}`}
                  >
                    {formatCurrency(row.withdraw)}
                  </td>
                  <td className="px-5 py-4 text-[var(--fg)] whitespace-nowrap">
                    {row.date}
                  </td>
                  <td className="px-5 py-4 text-[var(--fg)] font-mono text-xs whitespace-nowrap">
                    {row.time}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold bg-green-50 text-green-700 px-2.5 py-1 rounded-full uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
              {/* Totals row */}
              <tr className="bg-[var(--inner-card)]  text-[var(--fg)]">
                <td className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest">
                  Total
                </td>
                <td className="px-5 py-4 font-semibold text-[var(--fg)] ">
                  {formatCurrency(totals.deposit)}
                </td>
                <td className="px-5 py-4 font-semibold text-[var(--fg)] ">
                  {formatCurrency(totals.purchase)}
                </td>
                <td className="px-5 py-4 font-semibold text-[var(--fg)]">
                  {formatCurrency(totals.withdraw)}
                </td>
                <td
                  colSpan={3}
                  className="px-5 py-4 text-xs text-[var(--fg)] tracking-wide"
                >
                  {rows.length} transactions
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile Cards (< md) ── */}
      <div className="md:hidden space-y-3">
        {rows.map((row, i) => (
          <div
            key={row.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
          >
            {/* Card top row */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono text-gray-300">
                #{String(i + 1).padStart(2, '0')}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold bg-green-50 text-green-700 px-2.5 py-1 rounded-full uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                {row.status}
              </span>
            </div>

            {/* Amount pills */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-green-50 rounded-xl p-2.5">
                <p className="text-[9px] font-semibold text-[var(--fg)] uppercase tracking-wider mb-0.5">
                  Deposit
                </p>
                <p
                  className={`text-sm font-semibold truncate ${row.deposit !== null ? 'text-green-700' : 'text-gray-200'}`}
                >
                  {formatCurrency(row.deposit)}
                </p>
              </div>
              <div className="bg-amber-50 rounded-xl p-2.5">
                <p className="text-[9px] font-semibold text-amber-600 uppercase tracking-wider mb-0.5">
                  Purchase
                </p>
                <p
                  className={`text-sm font-semibold truncate ${row.purchase !== null ? 'text-amber-600' : 'text-gray-200'}`}
                >
                  {formatCurrency(row.purchase)}
                </p>
              </div>
              <div className="bg-red-50 rounded-xl p-2.5">
                <p className="text-[9px] font-semibold text-red-500 uppercase tracking-wider mb-0.5">
                  Withdraw
                </p>
                <p
                  className={`text-sm font-semibold truncate ${row.withdraw !== null ? 'text-red-600' : 'text-gray-200'}`}
                >
                  {formatCurrency(row.withdraw)}
                </p>
              </div>
            </div>

            {/* Date / Time footer */}
            <div className="flex items-center justify-between border-t border-gray-50 pt-3 text-xs text-gray-400">
              <span>{row.date}</span>
              <span className="font-mono">{row.time}</span>
            </div>
          </div>
        ))}

        {/* Mobile totals summary */}
        <div className="bg-gray-900 rounded-2xl p-4 text-[var(--fg)]">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-3">
            Summary &nbsp;·&nbsp; {rows.length} transactions
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">
                Deposits
              </p>
              <p className="text-sm font-semibold text-green-400">
                {formatCurrency(totals.deposit)}
              </p>
            </div>
            <div>
              <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">
                Purchases
              </p>
              <p className="text-sm font-semibold text-amber-400">
                {formatCurrency(totals.purchase)}
              </p>
            </div>
            <div>
              <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">
                Withdrawals
              </p>
              <p className="text-sm font-semibold text-gray-500">
                {formatCurrency(totals.withdraw)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
