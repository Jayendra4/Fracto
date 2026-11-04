import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface PayoutReviewModalProps {
  open: boolean;
  onClose: () => void;
  data: any;
  action: 'Approved' | 'Rejected';
  onConfirm: (remarks: string) => void;
  loading?: boolean;
  remarks: string;
  setRemarks: (remarks: string) => void;
}

export function PayoutReviewModal({
  open,
  onClose,
  data,
  action,
  onConfirm,
  loading,
  remarks,
  setRemarks,
}: PayoutReviewModalProps) {
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md border border-slate-800 bg-[#020817] text-slate-100">
        <DialogHeader>
          <DialogTitle>{action === 'Approved' ? 'Approve' : 'Reject'} Payout Request</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
            <span className="text-sm text-slate-400">Amount Requested</span>
            <span className="text-lg font-bold text-blue-400">₹{data.amount}</span>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Remarks</label>
            <Textarea
              placeholder="Enter remarks..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="bg-slate-900 border-slate-700 text-slate-200 min-h-[100px]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="border-slate-700 hover:bg-slate-800 text-slate-300"
          >
            Cancel
          </Button>
          <Button
            variant={action === 'Rejected' ? 'destructive' : 'default'}
            disabled={loading}
            onClick={() => onConfirm(remarks)}
            className={action === 'Approved' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Confirm {action}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
