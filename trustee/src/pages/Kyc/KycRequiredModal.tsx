import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';

interface KycRequiredModalProps {
  open: boolean;
  onClose: () => void;
}

export function KycRequiredModal({ open, onClose }: KycRequiredModalProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md border border-input">
        <DialogHeader>
          <DialogTitle>Complete KYC First</DialogTitle>
        </DialogHeader>

        {/* Message */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Your account KYC is not completed yet.</p>
          <p>To perform any actions on the platform, please complete your KYC verification.</p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Button
            onClick={() => {
              onClose();
              navigate('/trustee/kyc');
            }}
          >
            Complete KYC
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
