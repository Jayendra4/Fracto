import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';

export function TimeshareTab() {
  const [distributionProposed, setDistributionProposed] = useState(false);
  const [kpiSubText, setKpiSubText] = useState('Sora Heights — Q1 FY26-27');
  const [modalOpen, setModalOpen] = useState(false);

  const handleCreateDistribution = () => {
    setModalOpen(true);
  };

  const handleConfirmDistribution = () => {
    setDistributionProposed(true);
    setKpiSubText('Sora Heights — Q1 proposed');
    toast.success('Timeshare income distribution proposed to Trustee');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white font-display">Timeshare Income</h2>
        <p className="text-slate-400">Short-stay/usage-based revenue — a distinct profit stream from ordinary rental distributions, tracked separately per asset.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-slate-900/50 border-slate-800/80">
          <CardHeader className="pb-2">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Timeshare-Eligible Assets</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-display">3</div>
            <p className="text-[11px] text-slate-400 mt-1">Heritage Court · Marina Bay · Sora Heights</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800/80">
          <CardHeader className="pb-2">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Currently Collecting</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-display">1</div>
            <p className="text-[11px] text-slate-400 mt-1">Sora Heights — operating</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800/80">
          <CardHeader className="pb-2">
            <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Net Distributable (Pending)</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-display">
              {distributionProposed ? '₹0' : '₹1,84,200'}
            </div>
            <p className="text-[11px] text-amber-500 font-semibold mt-1">
              {kpiSubText}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sora Heights Table Card */}
      <Card className="bg-slate-900/50 border-slate-800/80">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg text-white font-semibold flex items-center">
            Sora Heights, Jaipur — HOF-SPV-014
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-450 border border-emerald-500/25">
              Collecting
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto border border-slate-850 rounded-xl">
            <table className="w-full text-sm text-left text-slate-355">
              <thead className="text-xs uppercase bg-slate-850/50 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Period</th>
                  <th className="px-4 py-3">Nights Booked</th>
                  <th className="px-4 py-3">Gross Booking Revenue</th>
                  <th className="px-4 py-3">Platform Fee (12%)</th>
                  <th className="px-4 py-3">Net Distributable</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                <tr className="hover:bg-slate-800/10 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-200">Q4 FY25-26</td>
                  <td className="px-4 py-3">142</td>
                  <td className="px-4 py-3">₹2,38,000</td>
                  <td className="px-4 py-3">₹28,560</td>
                  <td className="px-4 py-3 font-bold text-white">₹2,09,440</td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-450 border border-emerald-500/25">
                      Distributed
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/10 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-200">Q1 FY26-27</td>
                  <td className="px-4 py-3">96</td>
                  <td className="px-4 py-3">₹2,09,318</td>
                  <td className="px-4 py-3">₹25,118</td>
                  <td className="px-4 py-3 font-bold text-white">₹1,84,200</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                      distributionProposed 
                        ? 'bg-amber-500/10 text-amber-450 border border-amber-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                    }`}>
                      {distributionProposed ? 'Pending Trustee Approval' : 'Pending — Awaiting Trustee Release'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pt-2">
            <Button
              variant="default"
              onClick={handleCreateDistribution}
              disabled={distributionProposed}
              className="font-semibold text-xs h-9 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Distribution from Timeshare Income
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Not Yet Collecting Card */}
      <Card className="bg-slate-900/50 border-slate-800/80">
        <CardHeader>
          <CardTitle className="text-lg text-white font-semibold">Not Yet Collecting</CardTitle>
          <CardDescription className="text-slate-400">
            These assets are tagged Timeshare-eligible but haven't reached Managed/Post-Launch stage — income collection begins once operating.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/20 border border-slate-850">
            <span className="text-sm font-semibold text-slate-300">Heritage Court, Udaipur</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700/60">
              Pipeline — pre-vote
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/20 border border-slate-850">
            <span className="text-sm font-semibold text-slate-300">Marina Bay Residency, Dubai</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
              Subscription Open
            </span>
          </div>
        </CardContent>
      </Card>

      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Timeshare Distribution?"
        description="This will propose a distribution of ₹1,84,200 to all Sora Heights (HOF-SPV-014) fractional owners based on their unit share. The proposal will be routed to the Trustee bank for smart contract release."
        onConfirm={handleConfirmDistribution}
      />
    </div>
  );
}
