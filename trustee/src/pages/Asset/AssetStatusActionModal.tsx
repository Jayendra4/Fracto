import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { RwaNewStatus, RwaStatus } from '@/types';

interface KycActionModalProps {
  open: boolean;
  onClose: () => void;
  data: any;
  action: string;
  remark: string;
  setRemark: (remark: string) => void;
  onConfirm: (remark: string) => void;
  loading?: boolean;
}

export function AssetStatusActionModal({
  open,
  onClose,
  data,
  action,
  remark,
  setRemark,
  onConfirm,
  loading,
}: KycActionModalProps) {
  if (!data) return null;

  const isReject = action === 'Rejected' || action === RwaNewStatus.Rejected || action.endsWith('Rejected');
  const disableConfirm = loading || (isReject && !remark.trim());

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md border border-input">
        <DialogHeader>
          <DialogTitle>
            {isReject ? 'Reject Request' : 'Approve Request'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-1 text-sm">
          <div>
            <strong>Asset Name:</strong> {data?.assetTitle}
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <label className="text-sm font-medium">
            Remark {isReject && <span className="text-red-500">*</span>}
          </label>
          <Textarea
            placeholder={isReject ? 'Reason for rejection (required)' : 'Optional remark'}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant={isReject ? 'destructive' : 'default'}
            disabled={disableConfirm}
            onClick={() => onConfirm(remark)}
          >
            {isReject ? 'Reject' : 'Approve'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
