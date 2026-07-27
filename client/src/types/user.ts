/**
 * User / Profile types
 */

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
  role: "student" | "mentor" | "admin";
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  skills?: UserSkill[];
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
