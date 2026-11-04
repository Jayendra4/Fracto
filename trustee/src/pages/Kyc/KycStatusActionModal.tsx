import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { KycStatus } from '@/store/api/kycApi';

interface EntityDocument {
  id: number;
  url: string;
  isVerified: boolean;
  remark: string | null;
}

interface KycStatusActionModalProps {
  open: boolean;
  onClose: () => void;
  data: {
    entityDocument: EntityDocument[];
  } | null;
  action: KycStatus;
  onConfirm: (remark: string) => void;
  remark: string;
  setRemark: (remark: string) => void;
  loading?: boolean;
}

export function KycStatusActionModal({
  open,
  onClose,
  data,
  action,
  onConfirm,
  remark,
  setRemark,
  loading,
}: KycStatusActionModalProps) {
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl border border-input">
        <DialogHeader>
          <DialogTitle>
            {action === KycStatus.Approved ? 'Approve' : 'Reject'} KYC Request
          </DialogTitle>
        </DialogHeader>

        {/* Documents */}
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-3">Uploaded Documents</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.entityDocument.map((doc) => (
              <a
                key={doc.id}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative rounded-lg border overflow-hidden"
              >
                <img
                  src={doc.url}
                  alt="KYC Document"
                  className="h-56 w-full object-cover transition-transform group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
              </a>
            ))}
          </div>
        </div>

        {/* Remark */}
        <div className="mt-6 space-y-2">
          <label className="text-sm font-medium">
            Remark {action === KycStatus.Rejected && '(Required)'}
          </label>
          <Textarea
            placeholder="Enter verification remark"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-8">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>

          <Button
            variant={action === KycStatus.Rejected ? 'destructive' : 'default'}
            disabled={loading}
            onClick={() => onConfirm(remark)}
          >
            {action === KycStatus.Approved ? 'Approve KYC' : 'Reject KYC'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
