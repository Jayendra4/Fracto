import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';

interface InvestorRecord {
  id: string;
  ndaDate: string;
  status: 'Pending' | 'Approved';
}

export function InvestorAccessTab() {
  const [investors, setInvestors] = useState<InvestorRecord[]>([
    { id: 'HOF-INV-0211', ndaDate: '19 Jun 2026', status: 'Pending' },
    { id: 'HOF-INV-0187', ndaDate: '20 Jun 2026', status: 'Pending' },
    { id: 'HOF-INV-0098', ndaDate: '15 Jun 2026', status: 'Approved' }
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleApproveClick = (id: string) => {
    setSelectedId(id);
    setModalOpen(true);
  };

  const handleConfirmApprove = () => {
    if (selectedId) {
      setInvestors(prev => prev.map(inv => inv.id === selectedId ? { ...inv, status: 'Approved' } : inv));
      toast.success(`Investor ${selectedId} approved for Heritage Court access`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white font-display">Investor Access Approval</h2>
        <p className="text-slate-400 font-medium">Approve individual investors moving from NDA-Accepted View to Approved Investor View.</p>
      </div>

      <Card className="bg-slate-900/50 border-slate-800/80">
        <CardHeader>
          <CardTitle className="text-lg text-white font-semibold">Heritage Court, Udaipur</CardTitle>
          <CardDescription className="text-slate-400">NDA clearing registry for secondary club access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border border-slate-850 rounded-xl">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs uppercase bg-slate-850/50 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Investor (Identified)</th>
                  <th className="px-4 py-3">NDA Accepted</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {investors.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">{inv.id}</td>
                    <td className="px-4 py-3 text-slate-355 text-xs">{inv.ndaDate}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${
                        inv.status === 'Approved' 
                          ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/25' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {inv.status === 'Pending' ? (
                        <Button 
                          variant="outline"
                          onClick={() => handleApproveClick(inv.id)}
                          className="font-semibold text-xs h-8 px-3"
                        >
                          Approve
                        </Button>
                      ) : (
                        <span className="text-slate-500 text-xs font-semibold pr-3">&mdash;</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Approve Investor Access?"
        description={selectedId ? `Approve investor access for ${selectedId}?\n\nThis moves them from NDA-Accepted View to Approved Investor View for Heritage Court.` : ''}
        onConfirm={handleConfirmApprove}
      />
    </div>
  );
}
