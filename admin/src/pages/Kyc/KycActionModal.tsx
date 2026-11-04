import { ErrorBanner } from '@/components/common/ErrorBanner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { KycStatus, useUpdateKycStatusMutation } from '@/store/api/kycApi';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface KycActionModalProps {
  open: boolean;
  onClose: () => void;
  data: any;
  action: KycStatus;
  remark: string;
  setRemark: (remark: string) => void;
}

export function KycActionModal({
  open,
  onClose,
  data,
  action,
  remark,
  setRemark,
}: KycActionModalProps) {
  const navigate = useNavigate();

  const isReject = action === KycStatus.Rejected;
  const disableConfirm = isReject && !remark.trim();
  const [updateStatus, { isLoading: isUpdating, isError, error }] = useUpdateKycStatusMutation();

  const handleConfirm = async (remark: string) => {
    if (!data || !action) return;

    try {
      await updateStatus({
        id: data.kyc?.id || data?.id,
        action: action,
        rejectionReason: remark,
      }).unwrap();

      toast.success(
        `KYC request ${action === KycStatus.Approved ? 'approved' : 'rejected'} successfully!`
      );
      onClose();
      navigate(-1);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update status');
    }
  };

  if (!data) return null;

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
        {error && (
          <ErrorBanner
            type="error"
            title="Failed to Update Kyc Status"
            message={(error as any)?.data?.message || 'Something Went Wrong'}
          />
        )}
        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Button disabled={isUpdating} variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant={isReject ? 'destructive' : 'default'}
            disabled={disableConfirm || isUpdating}
            onClick={() => handleConfirm(remark)}
          >
            {action === KycStatus.Approved ? 'Approve' : 'Reject'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
