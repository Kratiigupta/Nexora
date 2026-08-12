"use client";

import { cn } from "@/lib/utils";
import { GitHubIcon, LinkedInIcon } from "@/components/icons/BrandIcons";
import { Globe, FileText, ExternalLink } from "lucide-react";

/**
 * PortfolioCard — displays portfolio links (GitHub, LinkedIn, Website, Resume).
 * Reusable on profile pages and public profiles.
 */

interface PortfolioLink {
  type: "github" | "linkedin" | "portfolio" | "resume";
  url: string;
}

interface PortfolioCardProps {
  links: PortfolioLink[];
  className?: string;
}

const linkConfig = {
  github: {
    label: "GitHub",
    Icon: GitHubIcon,
    hoverClass: "hover:bg-[#333]/10 dark:hover:bg-[#f5f5f5]/10",
  },
  linkedin: {
    label: "LinkedIn",
    Icon: LinkedInIcon,
    hoverClass: "hover:bg-[#0077b5]/10",
  },
  portfolio: {
    label: "Portfolio",
    Icon: Globe,
    hoverClass: "hover:bg-violet-500/10",
  },
  resume: {
    label: "Resume",
    Icon: FileText,
    hoverClass: "hover:bg-amber-500/10",
  },
};

export function PortfolioCard({ links, className }: PortfolioCardProps) {
  if (links.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {links.map((link) => {
        const config = linkConfig[link.type];
        const Icon = config.Icon;

        return (
          <a
            key={link.type}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border border-border/50 px-3 py-2",
              "text-sm text-muted-foreground transition-all duration-200",
              "hover:text-foreground hover:border-border hover:shadow-sm",
              config.hoverClass
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{config.label}</span>
            <ExternalLink className="h-3 w-3 opacity-40" />
          </a>
        );
      })}
    </div>
  );
}

/** Helper to build PortfolioLink array from profile data */
export function buildPortfolioLinks(profile: {
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  resumeUrl?: string | null;
}): PortfolioLink[] {
  const links: PortfolioLink[] = [];
  if (profile.githubUrl) links.push({ type: "github", url: profile.githubUrl });
  if (profile.linkedinUrl) links.push({ type: "linkedin", url: profile.linkedinUrl });
  if (profile.portfolioUrl) links.push({ type: "portfolio", url: profile.portfolioUrl });
  if (profile.resumeUrl) links.push({ type: "resume", url: profile.resumeUrl });
  return links;
}
