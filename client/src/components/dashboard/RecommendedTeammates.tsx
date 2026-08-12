"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import type { TeammateRecommendation } from "@/types/dashboard";
import { Sparkles } from "lucide-react";

/**
 * RecommendedTeammates — displays teammate suggestions.
 *
 * ⚠️ PHASE 4 INTEGRATION POINT:
 * Currently uses mock data passed via props. In Phase 4, this component
 * will receive recommendations from the AI recommendation engine.
 * The component interface (TeammateRecommendation[]) is designed to be
 * a drop-in replacement — only the data source changes.
 */

interface RecommendedTeammatesProps {
  teammates: TeammateRecommendation[];
  className?: string;
}

/**
 * Generate mock teammate recommendations.
 * Isolated function — replace with API call in Phase 4.
 */
export function getMockTeammates(): TeammateRecommendation[] {
  return [
    {
      id: "mock-1",
      fullName: "Arjun Sharma",
      username: "arjunsharma",
      avatarUrl: null,
      department: "Computer Science",
      bio: "Full-stack developer passionate about AI and web technologies",
      skills: ["React", "Node.js", "Python", "TensorFlow"],
      matchScore: 92,
    },
    {
      id: "mock-2",
      fullName: "Priya Patel",
      username: "priyapatel",
      avatarUrl: null,
      department: "Information Technology",
      bio: "UI/UX designer with experience in mobile app development",
      skills: ["Figma", "React Native", "TypeScript"],
      matchScore: 87,
    },
    {
      id: "mock-3",
      fullName: "Rahul Verma",
      username: "rahulverma",
      avatarUrl: null,
      department: "Data Science",
      bio: "ML enthusiast working on NLP and computer vision projects",
      skills: ["Python", "PyTorch", "Docker", "AWS"],
      matchScore: 81,
    },
    {
      id: "mock-4",
      fullName: "Sneha Reddy",
      username: "snehareddy",
      avatarUrl: null,
      department: "Computer Science",
      bio: "Backend developer experienced in microservices architecture",
      skills: ["Go", "Kubernetes", "PostgreSQL", "gRPC"],
      matchScore: 76,
    },
  ];
}

export function RecommendedTeammates({
  teammates,
  className,
}: RecommendedTeammatesProps) {
  if (teammates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Sparkles className="h-8 w-8 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">
          No recommendations yet
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Complete your profile to get matched
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {teammates.map((teammate) => (
        <div
          key={teammate.id}
          className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-muted/50 transition-colors cursor-pointer"
        >
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage
              src={teammate.avatarUrl || undefined}
              alt={teammate.fullName}
            />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {getInitials(teammate.fullName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">{teammate.fullName}</p>
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 shrink-0 bg-primary/10 text-primary border-0"
              >
                {teammate.matchScore}% match
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {teammate.department}
            </p>
            <div className="flex flex-wrap gap-1 mt-1">
              {teammate.skills.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
