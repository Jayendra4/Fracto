import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { KycStatus } from '@/store/api/kycApi';

interface KycActionModalProps {
  open: boolean;
  onClose: () => void;
  data: any;
  action: KycStatus;
  remark: string;
  setRemark: (remark: string) => void;
  onConfirm: (remark: string) => void;
  loading?: boolean;
}

export function KycActionModal({
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

  const isReject = action === KycStatus.Rejected;
  const disableConfirm = loading || (isReject && !remark.trim());

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md border border-input">
        <DialogHeader>
          <DialogTitle>
            {action === KycStatus.Approved ? 'Approve KYC Request' : 'Reject KYC Request'}
          </DialogTitle>
        </DialogHeader>

        {/* KYC Info */}
        <div className="space-y-1 text-sm">
          <div>
            <strong>User:</strong> {data?.firstname} {data?.lastname}
          </div>
        </div>

        {/* Remark */}
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

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant={isReject ? 'destructive' : 'default'}
            disabled={disableConfirm}
            onClick={() => onConfirm(remark)}
          >
            {action === KycStatus.Approved ? 'Approve' : 'Reject'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
