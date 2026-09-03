import api from "@/lib/api";
import type { NotificationItem } from "@/stores/notificationStore";

interface GetNotificationsParams {
  page?: number;
  limit?: number;
  unread_only?: "true" | "false";
}

interface GetNotificationsResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

interface GetNotificationsMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const notificationService = {
  /**
   * GET /api/v1/notifications
   * Fetch paginated notifications for the current user.
   */
  async getNotifications(
    params?: GetNotificationsParams
  ): Promise<{ data: GetNotificationsResponse; meta: GetNotificationsMeta }> {
    const response = await api.get("/notifications", { params });
    return { data: response.data.data, meta: response.data.meta };
  },

  /**
   * PUT /api/v1/notifications/:id/read
   * Mark a single notification as read.
   */
  async markAsRead(id: string): Promise<NotificationItem> {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data.data;
  },

  /**
   * PUT /api/v1/notifications/read-all
   * Mark all notifications as read.
   */
  async markAllAsRead(): Promise<{ updated: number }> {
    const response = await api.put("/notifications/read-all");
    return response.data.data;
  },
};
