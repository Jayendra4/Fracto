import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/redux';
import { useGetAllNotificationsQuery } from '@/store/api/notificationApi';

export function NotificationBell() {
    const navigate = useNavigate();
    const { data } = useGetAllNotificationsQuery({ skip: 0, take: 10 });
    const hasUnreadFromQuery = data?.data?.some((n) => !n.viewed) ?? false;
    const hasUnreadRedux = useAppSelector((state) => state.notification.hasUnread);
    const hasUnread = hasUnreadRedux || hasUnreadFromQuery;

    return (
        <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9"
            onClick={() => navigate('/notifications')}
        >
            <Bell className="h-5 w-5" />
            {hasUnread && (
                <span className="absolute top-1.5 right-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-white" />
                </span>
            )}
            <span className="sr-only">Notifications</span>
        </Button>
    );
}
