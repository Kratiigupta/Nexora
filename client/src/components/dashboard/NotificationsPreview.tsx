"use client";

import { cn } from "@/lib/utils";
import type { NotificationSummary } from "@/types/dashboard";
import { timeAgo } from "@/lib/utils";
import {
  Bell,
  Users,
  MessageSquare,
  ArrowLeftRight,
  Calendar,
  UserPlus,
  Info,
} from "lucide-react";

/**
 * NotificationsPreview — shows recent notifications with type-specific icons.
 */

const typeIcons: Record<string, typeof Bell> = {
  team_invite: Users,
  join_request: UserPlus,
  message: MessageSquare,
  skill_request: ArrowLeftRight,
  event_reminder: Calendar,
  connection_request: UserPlus,
  system: Info,
};

interface NotificationsPreviewProps {
  notifications: NotificationSummary[];
  className?: string;
}

export function NotificationsPreview({
  notifications,
  className,
}: NotificationsPreviewProps) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Bell className="h-8 w-8 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">All caught up!</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          No new notifications
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      {notifications.map((notification) => {
        const Icon = typeIcons[notification.type] || Bell;

        return (
          <div
            key={notification.id}
            className={cn(
              "flex items-start gap-3 rounded-lg p-2.5 transition-colors",
              "hover:bg-muted/50",
              !notification.isRead && "bg-primary/5"
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full shrink-0 mt-0.5",
                !notification.isRead
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm truncate",
                  !notification.isRead ? "font-medium" : "text-muted-foreground"
                )}
              >
                {notification.title}
              </p>
              {notification.body && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {notification.body}
                </p>
              )}
              <p className="text-[10px] text-muted-foreground/70 mt-1">
                {timeAgo(notification.createdAt)}
              </p>
            </div>
            {!notification.isRead && (
              <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
            )}
          </div>
        );
      })}
    </div>
  );
}
