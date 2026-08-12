/**
 * User / Profile types
 */

export type AvailabilityStatus =
  | "available_for_team"
  | "looking_for_project"
  | "hiring"
  | "not_available";

export interface Profile {
  id: string;
  fullName: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  department: string;
  year: number;
  college: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  linkedinUrl: string | null;
  resumeUrl: string | null;
  interests: string[];
  role: "student" | "mentor" | "admin";
  isAvailable: boolean;
  availabilityStatus: AvailabilityStatus;
  usernameChangedAt: string | null;
  createdAt: string;
  updatedAt: string;
  skills?: UserSkill[];
  profileCompletion?: number;
}

export interface UserSkill {
  skillId: string;
  skill: Skill;
  proficiency: "beginner" | "intermediate" | "advanced" | "expert";
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

/** Public profile response — includes stats */
export interface PublicProfile extends Omit<Profile, "usernameChangedAt"> {
  stats: {
    projects: number;
    teams: number;
    connections: number;
  };
}
