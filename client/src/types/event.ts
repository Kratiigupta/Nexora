/**
 * Event types
 */

export interface Event {
  id: string;
  title: string;
  description: string | null;
  type: "hackathon" | "workshop" | "competition" | "meetup" | "webinar";
  organizer: string | null;
  bannerUrl: string | null;
  location: string | null;
  isOnline: boolean;
  registrationUrl: string | null;
  startDate: string;
  endDate: string;
  createdBy: string;
  createdAt: string;
  isBookmarked?: boolean;
  creator?: {
    id: string;
    fullName: string;
    username: string;
    avatarUrl: string | null;
  };
  _count?: {
    bookmarks: number;
  };
}
