import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BackButton } from '@/components/common/BackButton';
import { ImmediateSaleList } from './ImmediateSaleList';

export function ImmediateSalePage() {
  return (
    <div className="w-full p-6 pb-20 space-y-6 animate-fade-in">
      <div className="flex items-center gap-5 mb-4">
        <BackButton />
        <h2 className="text-2xl font-bold">Immediate Sale List</h2>
      </div>

      <Card className="shadow-sm border-slate-800 bg-slate-900/50">
        <CardHeader className="pb-4 border-b border-slate-800/50">
          <CardTitle className="text-lg font-medium text-slate-200">Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ImmediateSaleList />
        </CardContent>
      </Card>
    </div>
  );
}
