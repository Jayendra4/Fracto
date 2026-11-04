import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BackButton } from '@/components/common/BackButton';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { InterestedMemberList } from './InterestedMemberList';

export function InterestedMember() {
  return (
    <div className="w-full p-6 pb-20 space-y-6 animate-fade-in">
      <div className="flex items-center gap-5 mb-4">
        <BackButton />
        <h2 className="text-2xl font-bold">Interested Members</h2>
      </div>

      <Tabs defaultValue="basicDetails" className="w-full space-y-4">
        <TabsContent value="basicDetails" className="space-y-6">
          <Card className="shadow-sm border-slate-800 bg-slate-900/50">
            <CardHeader className="pb-4 border-b border-slate-800/50">
              <CardTitle className="text-lg flex gap-3 font-medium text-slate-200">
                Interested Members{' '}
              </CardTitle>{' '}
            </CardHeader>
            <CardContent className="p-0">
              <InterestedMemberList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
