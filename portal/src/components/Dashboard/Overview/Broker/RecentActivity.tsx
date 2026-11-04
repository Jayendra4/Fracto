import {
  FiCheckCircle,
  FiFileText,
  FiDollarSign,
  FiClock,
} from 'react-icons/fi';
import { useActivities } from '@/api/activity.api';

// type ActivityType = 'success' | 'pending' | 'money' | 'info';

function ActivityIcon({ type }: { type: string }) {
  const base = 'w-10 h-10 rounded-xl flex items-center justify-center ';

  if (
    type.toLowerCase().includes('money') ||
    type.toLowerCase().includes('payment')
  ) {
    return (
      <div className={`${base} bg-green-500/10 text-green-400`}>
        <FiDollarSign size={18} />
      </div>
    );
  }

  if (
    type.toLowerCase().includes('pending') ||
    type.toLowerCase().includes('review')
  ) {
    return (
      <div className={`${base} bg-yellow-500/10 text-yellow-400`}>
        <FiFileText size={18} />
      </div>
    );
  }

  if (type.toLowerCase().includes('info')) {
    return (
      <div className={`${base} bg-blue-500/10 text-blue-400`}>
        <FiClock size={18} />
      </div>
    );
  }

  return (
    <div className={`${base} bg-green-500/10 text-green-400`}>
      <FiCheckCircle size={18} />
    </div>
  );
}

const timeAgo = (date: string) => {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000
  );
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  return Math.floor(seconds) + ' seconds ago';
};

function ActivityRow({ activity, isLast }: { activity: any; isLast: boolean }) {
  return (
    <div className="relative flex mb-6 last:mb-0">
      <div className="flex flex-col items-center mr-4">
        <ActivityIcon type={activity.type} />
        {!isLast && (
          <div className="w-px h-full min-h-[20px] bg-[var(--fg)]/10 mt-2" />
        )}
      </div>

      <div className="pt-1 flex-1">
        <p className="text-sm lg:text-base font-semibold text-[var(--fg)] leading-snug">
          {activity.label}
        </p>
        <p className="text-[11px] text-[var(--fg)]/40 mt-1 font-medium flex items-center gap-1.5">
          <FiClock size={10} />
          {timeAgo(activity.createdAt)}
        </p>
      </div>
    </div>
  );
}

export default function RecentActivity({
  accountId,
}: {
  accountId: string | number;
}) {
  const { data: activityRes, isLoading } = useActivities({ accountId });

  const activities = activityRes?.success && Array.isArray(activityRes.data?.data)
    ? activityRes.data.data
    : [];

  return (
    <div className="glass-card p-6 rounded-2xl border border-[var(--fg)]/5">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-bold text-[var(--fg)]">Recent Activity</h3>
        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500/60 bg-blue-500/5 px-2 py-1 rounded">
          Live Feed
        </span>
      </div>

      <div className="max-h-[400px] overflow-y-auto  scrollbar-ui pr-2">
        {isLoading ? (
          <div className="py-10 text-center animate-pulse text-[var(--fg)]/40 font-medium text-sm">
            Syncing activity stream...
          </div>
        ) : activities.length === 0 ? (
          <div className="py-10 text-center text-[var(--fg)]/30 text-sm italic font-medium">
            No recent activity to show
          </div>
        ) : (
          activities.map((activity: any, index: number) => (
            <ActivityRow
              key={activity.id || index}
              activity={activity}
              isLast={index === activities.length - 1}
            />
          ))
        )}
      </div>
    </div>
  );
}
