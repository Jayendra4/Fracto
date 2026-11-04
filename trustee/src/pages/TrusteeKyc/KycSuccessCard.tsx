import { Card } from '@/components/ui/card';

export default function KycSuccessCard() {
  return (
    <div className="h-[calc(100vh-115px)] flex items-center justify-center">
      <Card className="max-w-2xl w-full mx-auto py-20">
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          {/* Icon */}
          <img src="/images/check.svg" alt="" />

          {/* Message */}
          <h2 className="text-2xl font-semibold text-green-500">
            Your KYC verification has <br /> been Approved
          </h2>
        </div>
      </Card>
    </div>
  );
}
