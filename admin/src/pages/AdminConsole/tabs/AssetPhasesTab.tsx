import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AssetPhasesTabProps {
  realAssets?: any[];
}

export function AssetPhasesTab({ realAssets = [] }: AssetPhasesTabProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white font-display">
          Asset Phases Overview
        </h2>
        <p className="text-slate-400">
          Every asset, grouped by where it sits in the fractionalization lifecycle.
        </p>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 items-start">
        {/* Phase 1: Filling Basic Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-lg">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              i. Filling Basic Details
            </span>
            <span className="text-xs font-bold bg-slate-800 text-slate-450 px-2 py-0.5 rounded-full">
              1
            </span>
          </div>

          <div
            onClick={() => {
              toast.success('Opening Lakeview Commercial');
              navigate('/cms');
            }}
            className="group cursor-pointer p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-800/30 hover:border-primary/50 transition-all"
          >
            <div className="flex items-start gap-2.5">
              <Building className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                  Lakeview Commercial
                </h4>
                <p className="text-xs text-slate-450 mt-1">
                  Udaipur · Preliminary Review · Owner completing Full Asset Details
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Phase 2: Due Diligence */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-lg">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              ii. Due Diligence
            </span>
            <span className="text-xs font-bold bg-slate-800 text-slate-450 px-2 py-0.5 rounded-full">
              1
            </span>
          </div>

          <div
            onClick={() => navigate('/asset-review')}
            className="group cursor-pointer p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-800/30 hover:border-teal-500/50 transition-all"
          >
            <div className="flex items-start gap-2.5">
              <Building className="h-4 w-4 text-teal-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
                  Heritage Court
                </h4>
                <p className="text-xs text-slate-450 mt-1">
                  Udaipur · Legal Approved (w/ condition) · Valuation in progress · DD 80%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Phase 3: Gathering Funds */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-lg">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              iii. Gathering Funds
            </span>
            <span className="text-xs font-bold bg-slate-800 text-slate-450 px-2 py-0.5 rounded-full">
              1
            </span>
          </div>

          <div
            onClick={() => navigate('/spv-managememt')}
            className="group cursor-pointer p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-800/30 hover:border-indigo-500/50 transition-all"
          >
            <div className="flex items-start gap-2.5">
              <Building className="h-4 w-4 text-indigo-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Marina Bay Residency
                </h4>
                <p className="text-xs text-slate-450 mt-1">
                  Dubai · HOF-SPV-027 · 68% subscribed · Closes 30 Jun 2026
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Phase 4: Fractionalised & Selling */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-lg">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              iv. Fractionalised &amp; Selling
            </span>
            <span className="text-xs font-bold bg-slate-800 text-slate-450 px-2 py-0.5 rounded-full">
              2
            </span>
          </div>

          <div
            onClick={() => navigate('/govt-asset-management')}
            className="group cursor-pointer p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-800/30 hover:border-emerald-500/50 transition-all"
          >
            <div className="flex items-start gap-2.5">
              <Building className="h-4 w-4 text-emerald-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Sora Heights
                </h4>
                <p className="text-xs text-slate-450 mt-1">
                  Jaipur · HOF-SPV-014 · Managed · 11 shareholders
                </p>
              </div>
            </div>
          </div>

          <div
            onClick={() => navigate('/govt-asset-management')}
            className="group cursor-pointer p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-800/30 hover:border-emerald-500/50 transition-all"
          >
            <div className="flex items-start gap-2.5">
              <Building className="h-4 w-4 text-emerald-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Crescent Business Park
                </h4>
                <p className="text-xs text-slate-450 mt-1">
                  Gurugram · HOF-SPV-021 · Managed · 9 shareholders
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phase Definitions */}
      <Card className="bg-slate-900/50 border-slate-800/80">
        <CardHeader>
          <CardTitle className="text-lg text-white">Phase Definitions</CardTitle>
          <CardDescription className="text-slate-400">
            Platform operational definitions for fractional asset lifecycle stages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-350">
              <thead className="text-xs uppercase bg-slate-850/50 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Phase</th>
                  <th className="px-4 py-3">Definition &amp; Operational Gates</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                <tr className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">i. Filling Basic Details</td>
                  <td className="px-4 py-3">
                    Draft → Preliminary Review → Full Asset Details in progress
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">ii. Due Diligence</td>
                  <td className="px-4 py-3">
                    Legal Review, Valuation, DD — all three tracks until cleared
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">
                    iii. Gathering Funds (SPV Formation)
                  </td>
                  <td className="px-4 py-3">
                    Secondary Club formed → SPV incorporated → Subscription open
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">
                    iv. Fractionalised &amp; Selling
                  </td>
                  <td className="px-4 py-3">
                    Funding complete → Managed, generating distributions, governance active
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
