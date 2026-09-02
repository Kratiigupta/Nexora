import api from "@/lib/api";
import type { Event } from "@/types/event";

interface GetEventsParams {
  page?: number;
  limit?: number;
  type?: string;
  search?: string;
  upcoming?: string; // "true" or "false"
}

interface GetEventsResponse {
  events: Event[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export const eventService = {
  /**
   * GET /api/v1/events
   * Fetch paginated list of events.
   */
  async getEvents(params?: GetEventsParams): Promise<GetEventsResponse> {
    const response = await api.get("/events", { params });
    return response.data.data;
  },

  /**
   * GET /api/v1/events/:id
   * Fetch a specific event by ID.
   */
  async getEventById(id: string): Promise<Event> {
    const response = await api.get(`/events/${id}`);
    return response.data.data;
  },

  /**
   * POST /api/v1/events/:id/bookmark
   * Bookmark an event.
   */
  async bookmarkEvent(id: string): Promise<{ bookmarked: boolean }> {
    const response = await api.post(`/events/${id}/bookmark`);
    return response.data.data;
  },

  /**
   * DELETE /api/v1/events/:id/bookmark
   * Remove a bookmark from an event.
   */
  async removeBookmark(id: string): Promise<{ bookmarked: boolean }> {
    const response = await api.delete(`/events/${id}/bookmark`);
    return response.data.data;
  },
};
