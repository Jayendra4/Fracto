import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type Props = {
  onResubmit: () => void;
};

export default function KycRejectedCard({ onResubmit }: Props) {
  return (
    <div className="h-[calc(100vh-115px)] flex items-center justify-center">
      <Card className="max-w-2xl w-full mx-auto py-20">
        <div className="flex flex-col items-center text-center space-y-6">
          <span className="rounded-full border border-red-500/30 bg-red-500/10 px-6 py-2 text-sm font-semibold text-red-600 uppercase">
            Rejected
          </span>

          <h2 className="text-2xl font-semibold text-red-500">
            Your KYC verification has <br /> been Rejected
          </h2>

          <p className="text-sm text-muted-foreground max-w-md">
            Please review your details and resubmit the KYC with correct information.
          </p>

          <Button onClick={onResubmit}>Resubmit KYC</Button>
        </div>
      </Card>
    </div>
  );
}
