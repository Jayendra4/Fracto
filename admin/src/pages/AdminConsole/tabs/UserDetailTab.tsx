import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface UserDetailTabProps {
  selectedUserDetail: any;
  handleUserStatusUpdate: (userId: string | number, newStatus: string) => void;
}

export function UserDetailTab({ selectedUserDetail, handleUserStatusUpdate }: UserDetailTabProps) {
  const navigate = useNavigate();
  const [localStatus, setLocalStatus] = useState(selectedUserDetail.status || 'Active');

  const toggleUserSuspend = () => {
    const nextStatus = localStatus === 'Suspended' ? 'Active' : 'Suspended';
    handleUserStatusUpdate(selectedUserDetail.id, nextStatus);
    setLocalStatus(nextStatus);
    toast.success(`User status updated to ${nextStatus}`);
  };

  const deactivateLead = () => {
    handleUserStatusUpdate(selectedUserDetail.id, 'Deactivated');
    setLocalStatus('Deactivated');
    toast.success('Lead deactivated');
  };

  const isInvestor = selectedUserDetail.name === 'Mudit V. Dudhoria';
  const isLead = selectedUserDetail.type === 'Investor (Onboarding)';

  const getStatusBadge = (status: string) => {
    if (status === 'KYC Approved' || status === 'Approved' || status === 'Active') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-455 border border-emerald-500/25">
          {status}
        </span>
      );
    }
    if (status === 'Renewal Under Review' || status === 'KYC Pending') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-455 border border-rose-500/25">
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div
        onClick={() => navigate('/user-management')}
        className="cursor-pointer text-xs text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1.5 font-semibold"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to User Management
      </div>

      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white font-display">
          {selectedUserDetail.name}
        </h2>
        <p className="text-slate-400">{selectedUserDetail.type}</p>
      </div>

      {/* Detail Card */}
      <Card className="bg-slate-900/50 border-slate-800/80">
        <CardContent className="pt-6 space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-300">
              <tbody className="divide-y divide-slate-800/50">
                <tr>
                  <td className="py-3 font-semibold text-slate-400">Status</td>
                  <td className="py-3 text-right">{getStatusBadge(localStatus)}</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-slate-400">Assigned RM</td>
                  <td className="py-3 text-right text-slate-200">
                    {selectedUserDetail.assignedRm || '—'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-800/60">
            {localStatus === 'Suspended' ? (
              <Button
                variant="outline"
                onClick={toggleUserSuspend}
                className="font-semibold text-xs h-9"
              >
                Reactivate User
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={toggleUserSuspend}
                className="font-semibold text-xs h-9"
              >
                Suspend User
              </Button>
            )}

            {isLead && localStatus !== 'Deactivated' && (
              <Button
                variant="outline"
                onClick={deactivateLead}
                className="font-semibold text-xs h-9"
              >
                Deactivate Lead
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Holdings Card - display only for investor Mudit V. Dudhoria */}
      {isInvestor && (
        <Card className="bg-slate-900/50 border-slate-800/80">
          <CardHeader>
            <CardTitle className="text-lg text-white">Holdings</CardTitle>
            <CardDescription className="text-slate-400">
              Investor holdings reference log
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-350">
                <thead className="text-xs uppercase bg-slate-850/50 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Asset</th>
                    <th className="px-4 py-3">SPV</th>
                    <th className="px-4 py-3">Units</th>
                    <th className="px-4 py-3">Invested</th>
                    <th className="px-4 py-3">Profit Types</th>
                    <th className="px-4 py-3 text-right">Distributions to Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  <tr className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">Sora Heights, Jaipur</td>
                    <td className="px-4 py-3 text-slate-350">HOF-SPV-014</td>
                    <td className="px-4 py-3 text-slate-350">1,500</td>
                    <td className="px-4 py-3 text-slate-200">₹15.0L</td>
                    <td className="px-4 py-3 space-x-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-450 border border-emerald-500/25">
                        Rental
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary border border-primary/25">
                        Timeshare
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                        Sale
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-white">₹86,200</td>
                  </tr>
                  <tr className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">Crescent Business Park</td>
                    <td className="px-4 py-3 text-slate-350">HOF-SPV-021</td>
                    <td className="px-4 py-3 text-slate-350">1,250</td>
                    <td className="px-4 py-3 text-slate-200">₹12.5L</td>
                    <td className="px-4 py-3 space-x-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-450 border border-emerald-500/25">
                        Rental
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                        Sale
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-white">₹1,00,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-500">
              Mirrors this investor's own My Holdings view — for support &amp; compliance reference
              only, not editable here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
