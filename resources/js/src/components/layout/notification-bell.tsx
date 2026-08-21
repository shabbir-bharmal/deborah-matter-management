import { Bell, CalendarClock, FileCheck2, Flag, FolderOpen } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '~/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '~/components/ui/dropdown-menu';
import { ARIA_LABELS, COMMON } from '~/constants/menuData';
import { getNotifications } from '~/data/selectors';
import { useNotificationsStore, useUnreadCount } from '~/hooks/use-notifications-store';
import { cn } from '~/lib/utils';
import type { AppNotification, NotificationKind } from '~/types';

const kindIcons: Record<NotificationKind, typeof Bell> = {
    interview: CalendarClock,
    evidence: FolderOpen,
    milestone: Flag,
    report: FileCheck2,
};

function relativeDate(iso: string): string {
    const target = new Date(iso);
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    const dayDiff = Math.round((startOfTarget.getTime() - startOfToday.getTime()) / 86_400_000);
    if (dayDiff === 0) {
        return 'Today';
    }
    if (dayDiff === 1) {
        return 'Tomorrow';
    }
    if (dayDiff === -1) {
        return 'Yesterday';
    }
    if (dayDiff < 0) {
        return `${Math.abs(dayDiff)} days ago`;
    }
    return `In ${dayDiff} days`;
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<AppNotification[] | null>(null);
    const readIds = useNotificationsStore((state) => state.readIds);
    const markAllRead = useNotificationsStore((state) => state.markAllRead);
    const ids = notifications?.map((notification) => notification.id) ?? [];
    const unreadCount = useUnreadCount(ids);

    useEffect(() => {
        let cancelled = false;
        getNotifications().then((result) => {
            if (!cancelled) {
                setNotifications(result);
            }
        });
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ''}`}>
                    <Bell className="size-4" />
                    {unreadCount > 0 && (
                        <span className="bg-destructive absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-[10px] leading-none font-semibold text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-2 py-1.5">
                    <DropdownMenuLabel className="p-0">{COMMON.notifications}</DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => markAllRead(ids)}>
                            {COMMON.markAllRead}
                        </Button>
                    )}
                </div>
                <DropdownMenuSeparator />
                {!notifications && <p className="text-muted-foreground px-2 py-4 text-center text-sm">Loading…</p>}
                {notifications && notifications.length === 0 && (
                    <p className="text-muted-foreground px-2 py-4 text-center text-sm">You're all caught up.</p>
                )}
                <div className="max-h-80 overflow-y-auto">
                    {notifications?.map((notification) => {
                        const Icon = kindIcons[notification.kind];
                        const isUnread = !readIds[notification.id];
                        return (
                            <a
                                key={notification.id}
                                href={notification.href}
                                onClick={() => markAllRead([notification.id])}
                                className={cn(
                                    'hover:bg-accent focus-visible:bg-accent flex items-start gap-3 rounded-md px-2 py-2.5 transition-colors outline-none',
                                    isUnread && 'bg-muted/50',
                                )}
                            >
                                <span className="bg-card mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border">
                                    <Icon className="text-muted-foreground size-4" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="flex items-center gap-2">
                                        <span className={cn('truncate text-sm', isUnread ? 'font-medium' : 'text-muted-foreground')}>
                                            {notification.title}
                                        </span>
                                        {isUnread && (
                                            <span className="bg-primary size-1.5 shrink-0 rounded-full" aria-label={ARIA_LABELS.unreadBadge} />
                                        )}
                                    </span>
                                    <span className="text-muted-foreground block truncate text-xs">{notification.description}</span>
                                    <span className="text-muted-foreground block text-xs">{relativeDate(notification.date)}</span>
                                </span>
                            </a>
                        );
                    })}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
