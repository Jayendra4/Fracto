import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

export function InvestorPhasesTab() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Investor Phases</h2>
        <p className="text-slate-400">Where each investor sits between KYC and active participation.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Phase 1: KYC Phase */}
        <Card className="bg-slate-900/50 border-slate-800/80">
          <CardHeader>
            <CardTitle className="text-lg text-white">i. KYC Phase</CardTitle>
            <CardDescription className="text-slate-400">Onboarding status of current platform leads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-350">
                <thead className="text-xs uppercase bg-slate-850/50 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Investor</th>
                    <th className="px-4 py-3">Step</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  <tr className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">Mudit V. Dudhoria</td>
                    <td className="px-4 py-3 text-xs text-slate-400">Complete</td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-450 border border-emerald-500/25">
                        Approved
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">FRACTO-LEAD-0042</td>
                    <td className="px-4 py-3 text-xs text-slate-400">Complete</td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-450 border border-emerald-500/25">
                        Approved
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">FRACTO-LEAD-0039</td>
                    <td className="px-4 py-3 text-xs text-slate-400">7 of 14 — Bank Details</td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/25">
                        Stalled
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Phase 2: Needs a Nudge */}
        <Card className="bg-slate-900/50 border-slate-800/80">
          <CardHeader>
            <CardTitle className="text-lg text-white">ii. Needs a Nudge</CardTitle>
            <CardDescription className="text-slate-400">Investors stalled mid-KYC for more than 3 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              Investors stalled mid-KYC for more than 3 days — flagged by RM, actionable by Admin.
            </p>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white">FRACTO-LEAD-0039</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Stalled 6 days at Bank Details · RM: Riya Sharma already notified
                  </p>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/25">
                  Stalled
                </span>
              </div>
              <Button 
                variant="default"
                onClick={() => toast.success('Nudge sent directly from Admin — email + in-app notification')}
                className="w-full font-semibold text-xs h-9 mt-2"
              >
                Send Admin Nudge
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
