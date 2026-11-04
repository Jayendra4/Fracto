import { Bell } from 'lucide-react';

type Props = {
  title: string;
  body: string;
};

export default function NotificationToast({ title, body }: Props) {
  console.log('Notification hitt');
  return (
    <div className="flex gap-3 p-4 w-[320px] rounded-xl bg-white shadow-lg border">
      <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
        <Bell className="h-5 w-5 text-yellow-600" />
      </div>

      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-600 mt-1">{body}</p>
      </div>
    </div>
  );
}
