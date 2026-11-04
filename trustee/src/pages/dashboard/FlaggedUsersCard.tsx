import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

type FlaggedUser = {
  id: number;
  email: string;
  userId: string;
  reason: string;
  severity: 'High' | 'Medium';
};

const flaggedUsers: FlaggedUser[] = [
  {
    id: 1,
    email: 'johnad123@gmail.com',
    userId: 'USR-4521',
    reason: 'Multiple failed payment attempts',
    severity: 'High',
  },
  {
    id: 2,
    email: 'johnad123@gmail.com',
    userId: 'USR-4521',
    reason: 'Multiple failed payment attempts',
    severity: 'Medium',
  },
];

const severityStyles = {
  High: 'bg-red-500/15 text-red-400',
  Medium: 'bg-yellow-500/15 text-yellow-400',
};
export function FlaggedUsersCard() {
  return (
    <Card>
      {/* Header */}
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center justify-between">
          <CardTitle className="text-xl font-semibold text-white">Flagged Users</CardTitle>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="space-y-4">
        {flaggedUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-start justify-between p-2 rounded-xl bg-black/70"
          >
            {/* Left */}
            <div className="flex items-start gap-4 ">
              <div className="flex items-center justify-center rounded-full h-9 w-9 bg-red-500/15">
                <User className="w-5 h-5 text-red-400" />
              </div>

              <div>
                <p className="text-sm font-medium text-white">{user.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">ID. {user.userId}</p>
                <p className="mt-2 text-xs text-gray-400">{user.reason}</p>
              </div>
            </div>

            {/* Severity */}
            <span
              className={`h-fit rounded-md px-3 py-1 text-sm font-medium ${severityStyles[user.severity]}`}
            >
              {user.severity}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-end">
          <Button
            size="sm"
            className="h-8 px-4 text-black bg-yellow-400 rounded-md hover:bg-yellow-500 "
          >
            See All Flagged Users
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
