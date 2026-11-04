import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';

export function GroupSharingTab() {
  const [lakeviewApproved, setLakeviewApproved] = useState(false);
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

  const handleApproveSharing = () => {
    triggerModal({
      title: 'Approve Group Sharing?',
      description: 'This will allow members of Rajasthan Commercial and Udaipur City Group to view the preliminary asset page and pitch deck for Lakeview Commercial.',
      onConfirm: () => {
        setLakeviewApproved(true);
        toast.success('Group sharing request approved — notifications sent to 2 group coordinators');
      }
    });
  };

  const handleRejectSharing = () => {
    triggerModal({
      title: 'Reject Group Sharing Request?',
      description: 'Are you sure you want to reject this group sharing request? The owner will be notified.',
      isDestructive: true,
      onConfirm: () => {
        toast.success('Group sharing request rejected — Owner notified');
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white font-display">Group Sharing Approval</h2>
        <p className="text-slate-400">Requests from investors to share limited previews with groups/clubs.</p>
      </div>

      {/* Pending Queue */}
      {!lakeviewApproved && (
        <Card className="bg-slate-900/50 border-slate-800/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold text-white">Lakeview Commercial, Udaipur</CardTitle>
              <CardDescription className="text-slate-450 mt-1">
                Requested by Young Attitude Group · Groups: Rajasthan Commercial, Udaipur City Group
              </CardDescription>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
              Pending
            </span>
          </CardHeader>
          <CardContent className="pt-2 flex gap-3">
            <Button 
              variant="default"
              onClick={handleApproveSharing}
              className="font-semibold text-xs h-9"
            >
              Approve Sharing
            </Button>
            <Button 
              variant="outline"
              onClick={handleRejectSharing}
              className="font-semibold text-xs h-9"
            >
              Reject
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Approved List */}
      <Card className="bg-slate-900/50 border-slate-800/80">
        <CardHeader>
          <CardTitle className="text-lg text-white font-semibold">Approved</CardTitle>
          <CardDescription className="text-slate-400">Completed group preview authorizations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {lakeviewApproved && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/20 border border-slate-850">
              <span className="text-sm font-semibold text-slate-355 font-semibold text-slate-350">Lakeview Commercial &rarr; Rajasthan Commercial, Udaipur City Group</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-450 border border-emerald-500/25">
                Approved Just Now
              </span>
            </div>
          )}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/20 border border-slate-850">
            <span className="text-sm font-semibold text-slate-350">Heritage Court &rarr; Rajasthan Commercial (Primary Club)</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-450 border border-emerald-500/20">
              Approved, 2 weeks ago
            </span>
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
