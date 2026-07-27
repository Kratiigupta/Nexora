import { Profile } from "./user";

/**
 * Project and Task types
 */

export interface Project {
  id: string;
  teamId: string | null;
  title: string;
  description: string | null;
  status: "planning" | "in_progress" | "completed" | "on_hold";
  repoUrl: string | null;
  liveUrl: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: Profile;
  tasks?: ProjectTask[];
}

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "in_review" | "done";
  priority: "low" | "medium" | "high" | "critical";
  assignedTo: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  assignee?: Profile;
}
