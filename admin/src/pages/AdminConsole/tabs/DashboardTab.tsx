import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Building, CreditCard, Activity, FileText, CheckCircle2, Clock } from 'lucide-react';

interface DashboardTabProps {
  realKyc?: any[];
  realAssets?: any[];
  activeVotesCount?: number;
}

export function DashboardTab({
  realKyc = [],
  realAssets = [],
  activeVotesCount = 1,
}: DashboardTabProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white font-display">Admin Panel</h2>
        <p className="text-slate-400">
          Central operating console — approvals, club &amp; vote management, SPV initiation, and
          platform-wide oversight.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-slate-900/50 border-slate-800/80 hover:bg-slate-800/40 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Pending KYC
            </span>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-display">3</div>
            <p className="text-[11px] text-slate-400 mt-1">
              1 investor stalled · 2 others in review
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800/80 hover:bg-slate-800/40 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Assets in Review Pipeline
            </span>
            <Building className="h-4 w-4 text-teal-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-display">2</div>
            <p className="text-[11px] text-slate-400 mt-1">Heritage Court · Lakeview Commercial</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800/80 hover:bg-slate-800/40 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Investor Access Requests
            </span>
            <CreditCard className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-display">2</div>
            <p className="text-[11px] text-amber-500 mt-1 font-semibold">Heritage Court, pending</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800/80 hover:bg-slate-800/40 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Active Club Votes
            </span>
            <Activity className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-display">1</div>
            <p className="text-[11px] text-slate-400 mt-1">Closes 28 Jun 2026</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800/80 hover:bg-slate-800/40 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Partner Renewals Due
            </span>
            <FileText className="h-4 w-4 text-rose-450" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-display">1</div>
            <p className="text-[11px] text-amber-500 mt-1 font-semibold">Raj Kumar Associates</p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Pipeline Flowchart */}
      <Card className="bg-slate-900/50 border-slate-800/80">
        <CardHeader>
          <CardTitle className="text-lg text-white">
            Platform Pipeline — Heritage Court, Udaipur
          </CardTitle>
          <CardDescription className="text-slate-400">
            Lifecycle progress overview for Rajasthan Commercial Primary Club listing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/40 border border-slate-850">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <div className="text-sm">
                <span className="font-bold text-white">1</span> Investor submitted &rarr;
                Preliminary Admin Review
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/40 border border-slate-850">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <div className="text-sm">
                <span className="font-bold text-white">2</span> Group Sharing approved &rarr; Shared
                with Rajasthan Commercial Primary Club
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/35">
              <Clock className="h-5 w-5 text-primary animate-pulse shrink-0" />
              <div className="text-sm">
                <span className="font-bold text-primary-light">3</span> Legal/Valuation/DD Review
                (Legal approved w/ condition · Valuation in progress · DD partial) —{' '}
                <span className="font-semibold text-primary-light">you are here</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/20 border border-slate-900 opacity-60">
              <div className="h-5 w-5 rounded-full border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-500 shrink-0">
                4
              </div>
              <div className="text-sm text-slate-450">
                <span className="font-bold">4</span> Club vote closes 28 Jun &rarr; Secondary Club
                formation (if 60% Yes met)
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/20 border border-slate-900 opacity-60">
              <div className="h-5 w-5 rounded-full border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-500 shrink-0">
                5
              </div>
              <div className="text-sm text-slate-455">
                <span className="font-bold">5</span> SPV proposed &rarr; Trustee takes over
                governance
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: Action Center & Decisions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Action Center */}
        <Card className="bg-slate-900/50 border-slate-800/80">
          <CardHeader>
            <CardTitle className="text-lg text-white">Action Center</CardTitle>
            <CardDescription className="text-slate-400">
              Critical tasks requiring administrative sign-off
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/30 border border-slate-850 hover:border-slate-700 transition-colors">
              <span className="text-sm text-slate-300">
                2 investor access requests — Heritage Court
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/investoraccess')}
                className="h-7 text-xs font-bold border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
              >
                Action Needed
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/30 border border-slate-850 hover:border-slate-700 transition-colors">
              <span className="text-sm text-slate-300">Partner renewal — Raj Kumar Associates</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/brokermgmt')}
                className="h-7 text-xs font-bold border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
              >
                Action Needed
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/30 border border-slate-850 hover:border-slate-700 transition-colors">
              <span className="text-sm text-slate-300">DD Summary (partial) — Heritage Court</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/asset-review')}
                className="h-7 text-xs font-bold border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
              >
                Review Needed
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/30 border border-slate-850 hover:border-slate-700 transition-colors">
              <span className="text-sm text-slate-300">HOF-LEAD-0039 stalled in KYC</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/kyc')}
                className="h-7 text-xs font-bold border-rose-500/30 text-rose-455 hover:bg-rose-500/10"
              >
                Flagged by RM
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Decisions */}
        <Card className="bg-slate-900/50 border-slate-800/80">
          <CardHeader>
            <CardTitle className="text-lg text-white">Recent Decisions</CardTitle>
            <CardDescription className="text-slate-400">
              Audit trail of verified administrative closures
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">Approved Group Sharing</p>
                <p className="text-xs text-slate-450 mt-0.5">
                  Heritage Court &rarr; Rajasthan Commercial
                </p>
                <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" /> 2 weeks ago
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">Approved investor access</p>
                <p className="text-xs text-slate-450 mt-0.5">HOF-INV-0098, Heritage Court</p>
                <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" /> 15 Jun 2026
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">Approved KYC</p>
                <p className="text-xs text-slate-450 mt-0.5">Mudit V. Dudhoria</p>
                <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" /> 04 Mar 2025
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
