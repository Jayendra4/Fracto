import { Card } from '@/components/ui/card';

export default function KycSubmittedCard() {
  return (
    <div className="h-[calc(100vh-115px)] flex items-center justify-center">
      <Card className="max-w-2xl w-full mx-auto py-20">
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <span
            className="
              rounded-full border border-yellow-500/30
              bg-yellow-500/10 px-6 py-2
              text-sm font-semibold tracking-wide
              text-yellow-600 uppercase
            "
          >
            Pending
          </span>

          {/* Message */}
          <h2 className="text-2xl font-semibold text-yellow-500">
            Your KYC has been <br /> submitted successfully
          </h2>

          <p className="text-sm text-muted-foreground max-w-md">
            Our team is reviewing your documents. This usually takes 24–48 hours.
          </p>
        </div>
      </Card>
    </div>
  );
}
