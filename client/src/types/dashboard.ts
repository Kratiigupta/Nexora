/**
 * Dashboard-specific types
 */

import type { Profile } from "./user";

export interface DashboardStats {
  teams: number;
  projects: number;
  skills: number;
  connections: number;
}

export interface ProjectSummary {
  id: string;
  title: string;
  description: string | null;
  status: "planning" | "in_progress" | "completed" | "on_hold";
  createdAt: string;
  team: { name: string } | null;
}

export interface NotificationSummary {
  id: string;
  type: string;
  title: string;
  body: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface ActivityLogEntry {
  id: string;
  action: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

/** Heatmap data — date string → activity count */
export type HeatmapData = Record<string, number>;

/**
 * Teammate recommendation — AI engine recommendation payload.
 */
export interface TeammateRecommendation {
  id: string;
  fullName: string;
  username: string;
  avatarUrl: string | null;
  department: string;
  year: number;
  bio: string | null;
  skills: string[];
  score: number;
  matchReasons: string[];
}

export interface DashboardData {
  profile: Profile & { profileCompletion: number };
  stats: DashboardStats;
  profileCompletion: number;
  recentProjects: ProjectSummary[];
  notifications: NotificationSummary[];
  activityHeatmap: HeatmapData;
  recentActivity: ActivityLogEntry[];
}
