import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

interface StatusActionModalProps {
  open: boolean;
  onClose: () => void;
  data: any;
  action: 'Approved' | 'Rejected';
  onConfirm: (remark: string) => void;
  setRemark: (remark: string) => void;
  loading?: boolean;
  remark: string;
  requestType: string;
}

export function StatusActionModal({
  open,
  onClose,
  data,
  action,
  onConfirm,
  loading,
  remark,
  setRemark,
  requestType,
}: StatusActionModalProps) {
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md border border-input">
        <DialogHeader>
          <DialogTitle>{action === 'Approved' ? 'Approve' : 'Reject'} Payment Request</DialogTitle>
        </DialogHeader>

        {/* Amount */}
        <div className="text-lg font-semibold">Amount: ₹{data.amount}</div>

        {/* Screenshot */}
        {requestType === 'Deposit' && data.screenshot && (
          <a href={data.screenshot} target="_blank" rel="noopener noreferrer">
            <img
              src={data.screenshot}
              alt="Screenshot"
              className="mt-3 rounded border cursor-pointer hover:opacity-80"
            />
          </a>
        )}

        {/* Remark */}
        <div className="mt-4 space-y-2">
          <label className="text-sm font-medium">Remark</label>
          <Textarea
            placeholder="Enter remark"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={action === 'Rejected' ? 'destructive' : 'default'}
            disabled={loading}
            onClick={() => onConfirm(remark)}
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
