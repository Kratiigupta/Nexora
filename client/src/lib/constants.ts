/**
 * App-wide constants
 */

export const APP_NAME = "Nexora";
export const APP_DESCRIPTION =
  "A Smart Student Collaboration, Team Formation & Skill Exchange Platform";

/**
 * Navigation items for the sidebar
 */
export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Discover", href: "/discover/students", icon: "Search" },
  { label: "Teams", href: "/teams", icon: "Users" },
  { label: "Projects", href: "/projects", icon: "FolderKanban" },
  { label: "Messages", href: "/messages", icon: "MessageSquare" },
  { label: "Skill Exchange", href: "/skill-exchange", icon: "ArrowLeftRight" },
  { label: "Events", href: "/events", icon: "Calendar" },
] as const;

/**
 * Skill categories for the master catalog
 */
export const SKILL_CATEGORIES = [
  "Frontend",
  "Backend",
  "Full Stack",
  "Mobile",
  "AI / ML",
  "Data Science",
  "DevOps",
  "Cloud",
  "Cybersecurity",
  "Blockchain",
  "UI / UX Design",
  "Database",
  "Game Dev",
  "IoT",
  "Other",
] as const;

/**
 * Team types
 */
export const TEAM_TYPES = [
  { value: "project", label: "Project" },
  { value: "hackathon", label: "Hackathon" },
  { value: "startup", label: "Startup" },
  { value: "research", label: "Research" },
  { value: "competition", label: "Competition" },
] as const;

/**
 * Proficiency levels
 */
export const PROFICIENCY_LEVELS = [
  { value: "beginner", label: "Beginner", color: "bg-green-500" },
  { value: "intermediate", label: "Intermediate", color: "bg-blue-500" },
  { value: "advanced", label: "Advanced", color: "bg-purple-500" },
  { value: "expert", label: "Expert", color: "bg-orange-500" },
] as const;

/**
 * Pagination defaults
 */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
