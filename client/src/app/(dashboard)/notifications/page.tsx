"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Users,
  MessageSquare,
  ArrowLeftRight,
  Calendar,
  UserPlus,
  Info,
  Loader2,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { notificationService } from "@/lib/services/notification.service";
import { useNotificationStore, type NotificationItem } from "@/stores/notificationStore";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, timeAgo } from "@/lib/utils";

const typeIcons: Record<string, typeof Bell> = {
  team_invite: Users,
  join_request: UserPlus,
  message: MessageSquare,
  skill_request: ArrowLeftRight,
  event_reminder: Calendar,
  connection_request: UserPlus,
  system: Info,
};

function getNotificationHref(notification: NotificationItem): string | null {
  if (!notification.referenceType || !notification.referenceId) return null;

  const routes: Record<string, string> = {
    team: "/teams",
    project: "/projects",
    skill_exchange: "/skill-exchange",
    event: "/events",
    message: "/messages",
  };

  const base = routes[notification.referenceType];
  if (base) {
    return `${base}/${notification.referenceId}`;
  }
  return null;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { setNotifications, markAsRead, markAllAsRead } = useNotificationStore();

  const [notifications, setLocalNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [markingIds, setMarkingIds] = useState<Set<string>>(new Set());

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, meta } = await notificationService.getNotifications({
        page,
        limit: 20,
        unread_only: showUnreadOnly ? "true" : undefined,
      });
      setLocalNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      setTotalPages(meta.totalPages);

      // Sync to zustand store for the bell badge
      if (page === 1 && !showUnreadOnly) {
        setNotifications(data.notifications);
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Failed to load notifications.");
    } finally {
      setIsLoading(false);
    }
  }, [page, showUnreadOnly, setNotifications]);

  useEffect(() => {
    void Promise.resolve().then(() => fetchNotifications());
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notification: NotificationItem) => {
    if (notification.isRead) return;

    setMarkingIds((prev) => new Set(prev).add(notification.id));
    try {
      await notificationService.markAsRead(notification.id);
      markAsRead(notification.id);
      setLocalNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      toast.error("Failed to mark notification as read");
    } finally {
      setMarkingIds((prev) => {
        const next = new Set(prev);
        next.delete(notification.id);
        return next;
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    setMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
      markAllAsRead();
      setLocalNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    } finally {
      setMarkingAll(false);
    }
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    // Mark as read
    if (!notification.isRead) {
      handleMarkAsRead(notification);
    }

    // Navigate if there's a reference link
    const href = getNotificationHref(notification);
    if (href) {
      router.push(href);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground mt-1">
            Stay updated with your latest activity and alerts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showUnreadOnly ? "default" : "outline"}
            size="sm"
            className="gap-2 text-xs"
            onClick={() => {
              setShowUnreadOnly(!showUnreadOnly);
              setPage(1);
            }}
          >
            <Filter className="h-3.5 w-3.5" />
            {showUnreadOnly ? "Show All" : "Unread Only"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-xs"
            onClick={handleMarkAllAsRead}
            disabled={markingAll || unreadCount === 0}
          >
            {markingAll ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCheck className="h-3.5 w-3.5" />
            )}
            Mark all read{unreadCount > 0 && ` (${unreadCount})`}
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center justify-between">
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={fetchNotifications}>
            Retry
          </Button>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-4 rounded-xl border bg-card"
            >
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card/50 border rounded-xl border-dashed">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Bell className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">
            {showUnreadOnly ? "No unread notifications" : "No notifications yet"}
          </h3>
          <p className="text-muted-foreground mt-2 max-w-md">
            {showUnreadOnly
              ? "You've read all your notifications. Switch to show all to see your history."
              : "When you get team invites, messages, or other updates, they'll appear here."}
          </p>
          {showUnreadOnly && (
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => {
                setShowUnreadOnly(false);
                setPage(1);
              }}
            >
              Show all notifications
            </Button>
          )}
        </div>
      ) : (
        /* Notification list */
        <div className="space-y-2">
          {notifications.map((notification) => {
            const Icon = typeIcons[notification.type] || Bell;
            const isMarking = markingIds.has(notification.id);

            return (
              <div
                key={notification.id}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-xl border bg-card transition-all hover:shadow-sm cursor-pointer group",
                  !notification.isRead && "bg-primary/[0.03] border-primary/20"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full shrink-0 mt-0.5 transition-colors",
                    !notification.isRead
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm leading-snug",
                      !notification.isRead
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {notification.title}
                  </p>
                  {notification.body && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notification.body}
                    </p>
                  )}
                  <p className="text-[11px] text-muted-foreground/70 mt-1.5">
                    {timeAgo(notification.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!notification.isRead && (
                    <>
                      <div className="h-2.5 w-2.5 rounded-full bg-primary shrink-0" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification);
                        }}
                        disabled={isMarking}
                      >
                        {isMarking ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "Mark read"
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
