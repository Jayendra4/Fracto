import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';

export function ExitMgmtTab() {
  // Exit statistics states
  const [activeExitVotes, setActiveExitVotes] = useState(1);
  const [completedSales, setCompletedSales] = useState(0);

  // Crescent Business Park SPV state
  const [crescentStage, setCrescentStage] = useState<'Voting' | 'BuyerSale' | 'Completed'>('Voting');
  const [crescentStatusText, setCrescentStatusText] = useState(
    'Updated valuation: ₹14.8Cr (vs. original ₹12.5Cr acquisition). Vote requires 60% Yes to proceed to buyer/sale process. 5 of 9 shareholders voted · Closes 30 Jun 2026.'
  );

  // Record Sale completion inputs
  const [finalSalePrice, setFinalSalePrice] = useState('₹14,80,00,000');
  const [closingDate, setClosingDate] = useState('2026-07-15');

  // Sora Heights SPV state
  const [soraStage, setSoraStage] = useState<'Managed' | 'Initiated'>('Managed');

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

  const handleSendReminder = () => {
    toast.success('Reminder sent to 4 non-voting shareholders — HOF-SPV-021');
  };

  const handleCloseVote = () => {
    triggerModal({
      title: 'Close Vote & Tally?',
      description: 'Are you sure you want to close the vote and tally result for Crescent Business Park?',
      onConfirm: () => {
        setCrescentStage('BuyerSale');
        setCrescentStatusText('Vote passed at 71% Yes. Buyer process underway — sale can be recorded once closing is finalized.');
        toast.success('Vote closed — 60% Yes met for Crescent Business Park — moved to Buyer / Sale Process');
      }
    });
  };

  const handleRecordSale = (e: React.FormEvent) => {
    e.preventDefault();
    triggerModal({
      title: 'Record Sale & Distribute?',
      description: 'Are you sure you want to record the sale and distribute profits?',
      onConfirm: () => {
        setCrescentStage('Completed');
        setCrescentStatusText(`Sold for ${finalSalePrice} · Post-Launch Sale Profit distribution created and sent to Trustee for release. SPV proceeding to closure.`);
        setActiveExitVotes(0);
        setCompletedSales(1);
        toast.success('Sale recorded for Crescent Business Park — Post-Launch Sale Profit distribution created, SPV moves toward closure');
      }
    });
  };

  const handleInitiateSoraExit = () => {
    triggerModal({
      title: 'Initiate Exit Process?',
      description: 'Are you sure you want to initiate the exit/sale process for Sora Heights?',
      onConfirm: () => {
        setSoraStage('Initiated');
        setActiveExitVotes(prev => prev + 1);
        toast.success('Exit process initiated for Sora Heights — Valuation Update stage');
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white font-display">Post-Launch / Exit Management</h2>
        <p className="text-slate-400">The Club sells the property — a one-time capital-gain profit distinct from Rental and Timeshare income.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-slate-900/50 border-slate-800/80">
          <CardHeader className="pb-2">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Managed Assets Eligible for Exit</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-display">2</div>
            <p className="text-[11px] text-slate-400 mt-1">Sora Heights · Crescent Business Park</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800/80">
          <CardHeader className="pb-2">
            <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Active Exit Votes</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-display">{activeExitVotes}</div>
            <p className="text-[11px] text-amber-500 font-semibold mt-1">
              {activeExitVotes > 0 ? 'Crescent Business Park, closes 30 Jun' : 'No active exit votes'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800/80">
          <CardHeader className="pb-2">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Completed Sales</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-display">{completedSales}</div>
            <p className="text-[11px] text-slate-400 mt-1">Lifetime</p>
          </CardContent>
        </Card>
      </div>

      {/* Crescent Business Park SPV Card */}
      <Card className="bg-slate-900/50 border-slate-800/80">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-lg text-white font-semibold">
              Crescent Business Park, Gurugram — HOF-SPV-021
              <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                crescentStage === 'Completed' 
                  ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/25'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
              }`}>
                {crescentStage === 'Voting' && 'Exit In Progress'}
                {crescentStage === 'BuyerSale' && 'Buyer / Sale Process'}
                {crescentStage === 'Completed' && 'Sale Complete'}
              </span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          {/* Timeline Steps */}
          <div className="grid grid-cols-2 md:grid-cols-9 gap-4 text-center p-4 rounded-xl bg-slate-950/40 border border-slate-850">
            <div className="space-y-1">
              <div className="h-1.5 w-full rounded-full bg-primary" />
              <p className="text-[11px] text-slate-200 font-semibold">Exit Proposal</p>
              <p className="text-[10px] text-slate-500">02 Jun</p>
            </div>
            <div className="space-y-1">
              <div className="h-1.5 w-full rounded-full bg-primary" />
              <p className="text-[11px] text-slate-200 font-semibold">Valuation Update</p>
              <p className="text-[10px] text-slate-500">12 Jun</p>
            </div>
            <div className="space-y-1">
              <div className={`h-1.5 w-full rounded-full ${crescentStage !== 'Voting' ? 'bg-primary' : 'bg-primary animate-pulse'}`} />
              <p className={`text-[11px] font-semibold ${crescentStage === 'Voting' ? 'text-white font-bold' : 'text-slate-200'}`}>Shareholder Vote</p>
              <p className="text-[10px] text-slate-500">{crescentStage === 'Voting' ? 'Open' : 'Passed 71%'}</p>
            </div>
            <div className="space-y-1">
              <div className={`h-1.5 w-full rounded-full ${crescentStage !== 'Voting' ? 'bg-primary' : 'bg-slate-800'}`} />
              <p className={`text-[11px] font-semibold ${crescentStage === 'BuyerSale' ? 'text-white font-bold' : crescentStage === 'Completed' ? 'text-slate-200' : 'text-slate-500'}`}>Buyer / Sale Process</p>
            </div>
            <div className="space-y-1">
              <div className={`h-1.5 w-full rounded-full ${crescentStage === 'Completed' ? 'bg-primary' : 'bg-slate-800'}`} />
              <p className={`text-[11px] font-semibold ${crescentStage === 'Completed' ? 'text-slate-200' : 'text-slate-500'}`}>Legal Doc</p>
            </div>
            <div className="space-y-1">
              <div className={`h-1.5 w-full rounded-full ${crescentStage === 'Completed' ? 'bg-primary' : 'bg-slate-800'}`} />
              <p className={`text-[11px] font-semibold ${crescentStage === 'Completed' ? 'text-slate-200' : 'text-slate-500'}`}>Asset Sale</p>
            </div>
            <div className="space-y-1">
              <div className={`h-1.5 w-full rounded-full ${crescentStage === 'Completed' ? 'bg-primary' : 'bg-slate-800'}`} />
              <p className={`text-[11px] font-semibold ${crescentStage === 'Completed' ? 'text-slate-200' : 'text-slate-500'}`}>Tax / Liabilities</p>
            </div>
            <div className="space-y-1">
              <div className={`h-1.5 w-full rounded-full ${crescentStage === 'Completed' ? 'bg-primary' : 'bg-slate-800'}`} />
              <p className={`text-[11px] font-semibold ${crescentStage === 'Completed' ? 'text-slate-200' : 'text-slate-500'}`}>Distribution</p>
            </div>
            <div className="space-y-1">
              <div className={`h-1.5 w-full rounded-full ${crescentStage === 'Completed' ? 'bg-primary' : 'bg-slate-800'}`} />
              <p className={`text-[11px] font-semibold ${crescentStage === 'Completed' ? 'text-slate-200' : 'text-slate-500'}`}>SPV Closure</p>
            </div>
          </div>

          <p className="text-xs text-slate-350">{crescentStatusText}</p>

          {crescentStage === 'Voting' && (
            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={handleSendReminder}
                className="font-semibold text-xs h-9"
              >
                Send Reminder to Non-Voters
              </Button>
              <Button 
                variant="default" 
                onClick={handleCloseVote}
                className="font-semibold text-xs h-9"
              >
                Close Vote &amp; Tally Result
              </Button>
            </div>
          )}

          {crescentStage === 'BuyerSale' && (
            <form onSubmit={handleRecordSale} className="border-t border-slate-800/85 pt-4 space-y-4">
              <h3 className="text-sm font-bold text-white">Record Sale Completion</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="sale-price" className="text-xs text-slate-355 font-semibold">Final Sale Price</Label>
                  <Input 
                    id="sale-price" 
                    value={finalSalePrice} 
                    onChange={e => setFinalSalePrice(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-slate-200 text-sm focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="closing-date" className="text-xs text-slate-355 font-semibold">Closing Date</Label>
                  <Input 
                    id="closing-date" 
                    type="date"
                    value={closingDate} 
                    onChange={e => setClosingDate(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-slate-200 text-sm focus-visible:ring-primary"
                  />
                </div>
              </div>
              <Button type="submit" variant="default" className="font-semibold text-xs h-9">
                Record Sale &amp; Distribute Profit
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Sora Heights SPV Card */}
      <Card className="bg-slate-900/50 border-slate-800/80">
        <CardHeader>
          <CardTitle className="text-lg text-white font-semibold">
            Sora Heights, Jaipur — HOF-SPV-014
            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${
              soraStage === 'Initiated' 
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                : 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/25'
            }`}>
              {soraStage === 'Managed' ? 'Managed — no exit proposed' : 'Exit In Progress'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          {soraStage === 'Initiated' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-9 gap-4 text-center p-4 rounded-xl bg-slate-950/40 border border-slate-850">
                <div className="space-y-1">
                  <div className="h-1.5 w-full rounded-full bg-primary" />
                  <p className="text-[11px] text-slate-200 font-semibold">Exit Proposal</p>
                  <p className="text-[10px] text-slate-500">Today</p>
                </div>
                <div className="space-y-1">
                  <div className="h-1.5 w-full rounded-full bg-primary animate-pulse" />
                  <p className="text-[11px] text-white font-bold">Valuation Update</p>
                  <p className="text-[10px] text-slate-550">In progress</p>
                </div>
                <div className="space-y-1">
                  <div className="h-1.5 w-full rounded-full bg-slate-800" />
                  <p className="text-[11px] text-slate-500">Shareholder Vote</p>
                </div>
                <div className="space-y-1">
                  <div className="h-1.5 w-full rounded-full bg-slate-800" />
                  <p className="text-[11px] text-slate-500">Buyer / Sale Process</p>
                </div>
                <div className="space-y-1">
                  <div className="h-1.5 w-full rounded-full bg-slate-800" />
                  <p className="text-[11px] text-slate-500">Legal Doc</p>
                </div>
                <div className="space-y-1">
                  <div className="h-1.5 w-full rounded-full bg-slate-800" />
                  <p className="text-[11px] text-slate-500">Asset Sale</p>
                </div>
                <div className="space-y-1">
                  <div className="h-1.5 w-full rounded-full bg-slate-800" />
                  <p className="text-[11px] text-slate-500">Tax / Liabilities</p>
                </div>
                <div className="space-y-1">
                  <div className="h-1.5 w-full rounded-full bg-slate-800" />
                  <p className="text-[11px] text-slate-500">Distribution</p>
                </div>
                <div className="space-y-1">
                  <div className="h-1.5 w-full rounded-full bg-slate-800" />
                  <p className="text-[11px] text-slate-500">SPV Closure</p>
                </div>
              </div>
              <p className="text-xs text-slate-350">
                Independent valuation requested — shareholder vote opens once complete.
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-350">
                Any shareholder above the minimum threshold can initiate an exit — it requires a shareholder vote before proceeding to sale.
              </p>
              <Button 
                variant="default" 
                onClick={handleInitiateSoraExit}
                className="font-semibold text-xs h-9"
              >
                Initiate Exit / Sale Process
              </Button>
            </>
          )}
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
