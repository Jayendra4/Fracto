import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

const SpvOverviewCard = () => {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-white">SPV Overview</CardTitle>

          <Button
            size="sm"
            className="h-8 px-4 text-black bg-yellow-400 rounded-md hover:bg-yellow-500"
          >
            See All
          </Button>
        </div>
      </CardHeader>

      {/* Body */}
      <CardContent>
        <div className="space-y-4 rounded-xl bg-black/70">
          {/* Top Row */}
          <div className="flex items-start justify-between p-2">
            <div>
              <h3 className="text-lg font-semibold text-white">RE Fractional SPV LLC</h3>
              <p className="mt-1 text-sm text-gray-400">ID:- 65788001</p>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 border rounded-lg border-green-500/40 bg-green-500/10">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">Compliant</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 p-2 mt-4">
            <div className="p-4 border rounded-lg border-white/10 bg-white/5">
              <p className="text-xs text-gray-400">Total Value</p>
              <p className="mt-1 text-lg font-semibold text-white">$26</p>
            </div>

            <div className="p-4 border rounded-lg border-white/10 bg-white/5">
              <p className="text-xs text-gray-400">Associated Asset</p>
              <p className="mt-1 text-lg font-semibold text-white">12</p>
            </div>

            <div className="p-4 border rounded-lg border-white/10 bg-white/5">
              <p className="text-xs text-gray-400">Jurisdiction</p>
              <p className="mt-2 text-sm font-semibold text-white">Delaware US</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpvOverviewCard;
