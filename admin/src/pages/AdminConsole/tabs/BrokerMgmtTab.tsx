import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { ArrowLeft } from 'lucide-react';

interface BrokerRecord {
  name: string;
  leads: number;
  assets: number;
  status: 'Renewal Under Review' | 'Active' | 'Suspended';
}

export function BrokerMgmtTab() {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  
  // Confirmation Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  } | null>(null);

  const triggerModal = (config: typeof modalConfig) => {
    setModalConfig(config);
    setModalOpen(true);
  };
  
  const [brokers, setBrokers] = useState<BrokerRecord[]>([
    { name: 'Raj Kumar Associates', leads: 27, assets: 2, status: 'Renewal Under Review' },
    { name: 'Jaipur Realty Partners', leads: 9, assets: 1, status: 'Active' }
  ]);

  const filteredBrokers = brokers.filter(b => {
    const searchMatch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
    const statusMatch = statusFilter === 'All Statuses' || 
                        (statusFilter === 'Active' && b.status === 'Active') ||
                        (statusFilter === 'Renewal Due' && b.status === 'Renewal Under Review') ||
                        (statusFilter === 'Suspended' && b.status === 'Suspended');
    return searchMatch && statusMatch;
  });

  const getStatusBadge = (status: string) => {
    if (status === 'Active') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-450 border border-emerald-500/25">
          Active
        </span>
      );
    }
    if (status === 'Renewal Under Review') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
          Renewal Under Review
        </span>
      );
    }
    if (status === 'Suspended') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-455 border border-rose-500/25">
          Suspended
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700/60">
        {status}
      </span>
    );
  };

  const handleApproveRenewal = () => {
    triggerModal({
      title: 'Approve Partner Renewal?',
      description: 'Approve annual renewal for Raj Kumar Associates?',
      onConfirm: () => {
        setBrokers(prev => prev.map(b => b.name === 'Raj Kumar Associates' ? { ...b, status: 'Active' } : b));
        toast.success('Partner renewal approved');
      }
    });
  };

  const handleSuspendPartner = () => {
    triggerModal({
      title: 'Suspend Partner?',
      description: 'Suspend Raj Kumar Associates? This will freeze their commission payouts and lead tracking capabilities.',
      isDestructive: true,
      onConfirm: () => {
        setBrokers(prev => prev.map(b => b.name === 'Raj Kumar Associates' ? { ...b, status: 'Suspended' } : b));
        toast.success('Raj Kumar Associates has been suspended');
      }
    });
  };

  const rkaStatus = brokers.find(b => b.name === 'Raj Kumar Associates')?.status || 'Renewal Under Review';

  if (view === 'detail') {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Back Link */}
        <div 
          onClick={() => setView('list')}
          className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer font-semibold inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Partner Management
        </div>

        {/* Header */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <h2 className="text-3xl font-bold tracking-tight text-white font-display">Raj Kumar Associates</h2>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${
              rkaStatus === 'Active' 
                ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/25' 
                : rkaStatus === 'Suspended'
                ? 'bg-rose-500/10 text-rose-455 border border-rose-500/25'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
            }`}>
              {rkaStatus === 'Active' 
                ? 'Active' 
                : rkaStatus === 'Suspended' 
                ? 'Suspended' 
                : 'Annual Renewal Under Review'}
            </span>
          </div>
          <p className="text-slate-400 mt-1">Channel Partner since Mar 2025.</p>
        </div>

        {/* KPI Grid */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card className="bg-slate-900/50 border-slate-800/80">
            <CardHeader className="pb-1.5">
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Leads Submitted</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white font-display">27</div>
              <p className="text-[11px] text-slate-450 mt-1">14 investor · 9 asset · 4 owner</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800/80">
            <CardHeader className="pb-1.5">
              <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Converted Leads</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white font-display">11</div>
              <p className="text-[11px] text-emerald-455 font-semibold mt-1">41% conversion</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800/80">
            <CardHeader className="pb-1.5">
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Assets Sourced</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white font-display">2</div>
              <p className="text-[11px] text-slate-450 mt-1">Lakeview · Heritage Court</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800/80">
            <CardHeader className="pb-1.5">
              <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Lifetime Commission</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white font-display">₹2.4L</div>
              <p className="text-[11px] text-amber-500 font-semibold mt-1">₹38,200 pending payout</p>
            </CardContent>
          </Card>
        </div>

        {/* Columns Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Compliance & KYC Card */}
          <Card className="bg-slate-900/50 border-slate-800/80">
            <CardHeader>
              <CardTitle className="text-base text-white font-semibold">Compliance &amp; KYC</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto border border-slate-850 rounded-xl">
                <table className="w-full text-sm text-left text-slate-300">
                  <tbody className="divide-y divide-slate-800/50">
                    <tr className="hover:bg-slate-800/10 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-300">PAN / GST / RERA</td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-450 border border-emerald-500/25">
                          Verified
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/10 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-300">Channel Partner Agreement</td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                          Re-signed, pending countersign
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/10 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-300">Conduct &amp; Compliance Declaration</td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-450 border border-emerald-500/25">
                          Signed
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/10 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-300">Payout Bank Account</td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-450 border border-emerald-500/25">
                          Verified
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Recent Leads Card */}
          <Card className="bg-slate-900/50 border-slate-800/80">
            <CardHeader>
              <CardTitle className="text-base text-white font-semibold">Recent Leads</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/20 border border-slate-850 hover:bg-slate-800/10 transition-colors">
                <span className="text-sm font-semibold text-slate-300">HOF-LEAD-0042 (Investor &rarr; Converted)</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-450 border border-emerald-500/25">Paid</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/20 border border-slate-850 hover:bg-slate-800/10 transition-colors">
                <span className="text-sm font-semibold text-slate-300">Lakeview Commercial (Asset Sourced)</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">Qualified</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/20 border border-slate-850 hover:bg-slate-800/10 transition-colors">
                <span className="text-sm font-semibold text-slate-300">HOF-LEAD-0039 (Investor &rarr; Stalled)</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-500/10 text-rose-455 border border-rose-500/25">Qualified &mdash; Stalled</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/20 border border-slate-850 hover:bg-slate-800/10 transition-colors">
                <span className="text-sm font-semibold text-slate-300">Heritage Court (Owner Sourcing)</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary border border-primary/25">Commission Eligible</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Decision Card */}
        <Card className="bg-slate-900/50 border-slate-800/80">
          <CardHeader>
            <CardTitle className="text-base text-white font-semibold">Decision</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button onClick={handleApproveRenewal} className="font-semibold text-xs h-9">
              Approve Renewal
            </Button>
            <Button onClick={handleSuspendPartner} variant="outline" className="font-semibold text-xs h-9">
              Suspend Partner
            </Button>
          </CardContent>
        </Card>

        {modalConfig && (
          <ConfirmationModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={modalConfig.title}
            description={modalConfig.description}
            onConfirm={modalConfig.onConfirm}
            isDestructive={modalConfig.isDestructive}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white font-display">Partner Management</h2>
        <p className="text-slate-400">Channel Partner onboarding, renewals, and commission oversight.</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <Input 
          placeholder="Search partners…" 
          value={searchQuery}
          onChange={e => {
            setSearchQuery(e.target.value);
            if (e.target.value) {
              toast.success(`Filtering for: ${e.target.value}`, { id: 'broker-filter' });
            }
          }}
          className="bg-slate-900/50 border-slate-800 text-slate-200 text-sm focus-visible:ring-primary flex-1"
        />
        <select 
          value={statusFilter}
          onChange={e => {
            setStatusFilter(e.target.value);
            toast.success(`Filtered by status: ${e.target.value}`, { id: 'broker-status-filter' });
          }}
          className="bg-slate-900/50 border border-slate-800 text-slate-350 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none min-w-[200px]"
        >
          <option>All Statuses</option>
          <option>Active</option>
          <option>Renewal Due</option>
          <option>Suspended</option>
        </select>
      </div>

      {/* Brokers Card List */}
      <Card className="bg-slate-900/50 border-slate-800/80">
        <CardContent className="pt-6">
          <div className="overflow-x-auto border border-slate-850 rounded-xl">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs uppercase bg-slate-855/50 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Partner</th>
                  <th className="px-4 py-3">Leads Submitted</th>
                  <th className="px-4 py-3">Assets Sourced</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredBrokers.map((b, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/10 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">{b.name}</td>
                    <td className="px-4 py-3 text-slate-350">{b.leads}</td>
                    <td className="px-4 py-3 text-slate-350">{b.assets}</td>
                    <td className="px-4 py-3">{getStatusBadge(b.status)}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {b.name === 'Raj Kumar Associates' ? (
                        <span 
                          onClick={() => setView('detail')}
                          className="text-primary hover:underline cursor-pointer text-xs"
                        >
                          View
                        </span>
                      ) : (
                        <span 
                          onClick={() => toast.success(`Opening ${b.name} detail`)}
                          className="text-primary hover:underline cursor-pointer text-xs"
                        >
                          View
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredBrokers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-slate-500 text-sm">
                      No matching partners found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {modalConfig && (
        <ConfirmationModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={modalConfig.title}
          description={modalConfig.description}
          onConfirm={modalConfig.onConfirm}
          isDestructive={modalConfig.isDestructive}
        />
      )}
    </div>
  );
}
