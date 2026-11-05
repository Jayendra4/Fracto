import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight } from 'lucide-react';

export function PaymentsTrackingTab() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');

  const handleRetry = () => {
    toast.success('Retry instruction sent to FRACTO-INV-0204 — please re-confirm bank reference');
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Completed') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-450 border border-emerald-500/25">
          Completed
        </span>
      );
    }
    if (status === 'Processing') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/25">
          Processing
        </span>
      );
    }
    if (status === 'Failed') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-455 border border-rose-500/25">
          Failed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700/60">
        {status}
      </span>
    );
  };

  // Subscriptions records from HTML
  const subscriptions = [
    {
      investor: 'FRACTO-INV-0017',
      spv: 'FRACTO-SPV-027',
      amount: 'AED 100,000',
      ref: 'UTR2845512',
      status: 'Completed',
      note: '',
    },
    {
      investor: 'FRACTO-INV-0143',
      spv: 'FRACTO-SPV-027',
      amount: 'AED 480,000',
      ref: 'UTR2845598',
      status: 'Completed',
      note: '',
    },
    {
      investor: 'FRACTO-INV-0092',
      spv: 'FRACTO-SPV-027',
      amount: 'AED 50,000',
      ref: '—',
      status: 'Processing',
      note: '',
    },
    {
      investor: 'FRACTO-INV-0204',
      spv: 'FRACTO-SPV-027',
      amount: 'AED 75,000',
      ref: 'UTR2845631',
      status: 'Failed',
      note: '(bank reference mismatch)',
    },
  ];

  // Commitment fees records from HTML
  const commitmentFees = [
    {
      investor: 'FRACTO-INV-0211',
      asset: 'Heritage Court',
      amount: 'AED 2,500',
      status: 'Completed',
      note: '',
    },
    {
      investor: 'FRACTO-INV-0066',
      asset: 'Marina Bay Residency',
      amount: 'AED 2,500',
      status: 'Refunded',
      note: '(withdrew before allotment)',
    },
  ];

  const filteredSubscriptions = subscriptions.filter((item) => {
    const searchMatch =
      item.investor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.spv.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ref.toLowerCase().includes(searchQuery.toLowerCase());
    const statusMatch = statusFilter === 'All Statuses' || item.status === statusFilter;
    return searchMatch && statusMatch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white font-display">
          Payments Tracking
        </h2>
        <p className="text-slate-400">
          Reconciliation of every money movement against bank confirmations. Status follows the
          canonical Payment Status taxonomy.{' '}
          <span
            onClick={() => navigate('/status-legend')}
            className="text-primary hover:underline cursor-pointer font-semibold ml-1 inline-flex items-center"
          >
            View legend <ArrowRight className="w-3 h-3 ml-0.5" />
          </span>
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <Input
          placeholder="Search by reference or investor ID…"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (e.target.value) {
              toast.success(`Filtering for: ${e.target.value}`, { id: 'search-filter' });
            }
          }}
          className="bg-slate-900/50 border-slate-800 text-slate-200 text-sm focus-visible:ring-primary flex-1"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            toast.success(`Filtered by status: ${e.target.value}`, { id: 'status-filter' });
          }}
          className="bg-slate-900/50 border border-slate-800 text-slate-350 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none min-w-[200px]"
        >
          <option>All Statuses</option>
          <option>Pending</option>
          <option>Processing</option>
          <option>Completed</option>
          <option>Failed</option>
          <option>Refunded</option>
        </select>
      </div>

      {/* Subscriptions Card */}
      <Card className="bg-slate-900/50 border-slate-800/80">
        <CardHeader>
          <CardTitle className="text-lg text-white font-semibold">Subscriptions</CardTitle>
          <CardDescription className="text-slate-400">
            Escrow ledger for SPV fractional purchases
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto border border-slate-850 rounded-xl">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs uppercase bg-slate-850/50 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Investor</th>
                  <th className="px-4 py-3">SPV</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Bank Reference</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredSubscriptions.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/10 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">{sub.investor}</td>
                    <td className="px-4 py-3 text-slate-350">{sub.spv}</td>
                    <td className="px-4 py-3 text-slate-200">{sub.amount}</td>
                    <td className="px-4 py-3 font-mono text-slate-400 text-xs">{sub.ref}</td>
                    <td className="px-4 py-3 text-right space-y-1">
                      <div>{getStatusBadge(sub.status)}</div>
                      {sub.note && (
                        <div className="text-[10px] text-slate-500 font-medium">{sub.note}</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2">
            <Button variant="outline" onClick={handleRetry} className="font-semibold text-xs h-9">
              Retry / Request Re-confirmation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Commitment Fees Card */}
      <Card className="bg-slate-900/50 border-slate-800/80">
        <CardHeader>
          <CardTitle className="text-lg text-white font-semibold">Commitment Fees</CardTitle>
          <CardDescription className="text-slate-400">
            Pre-allotment reserve deposits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border border-slate-850 rounded-xl">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs uppercase bg-slate-850/50 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Investor</th>
                  <th className="px-4 py-3">Asset</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {commitmentFees.map((fee, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/10 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">{fee.investor}</td>
                    <td className="px-4 py-3 text-slate-350">{fee.asset}</td>
                    <td className="px-4 py-3 text-slate-200">{fee.amount}</td>
                    <td className="px-4 py-3 text-right space-y-1">
                      <div>{getStatusBadge(fee.status)}</div>
                      {fee.note && (
                        <div className="text-[10px] text-slate-500 font-medium">{fee.note}</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
