"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import type { TeammateRecommendation } from "@/types/dashboard";
import { profileService } from "@/lib/services/profile.service";
import { Sparkles, AlertCircle, RefreshCw } from "lucide-react";

interface RecommendedTeammatesProps {
  className?: string;
}

export function RecommendedTeammates({ className }: RecommendedTeammatesProps) {
  const [teammates, setTeammates] = useState<TeammateRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await profileService.getRecommendedTeammates();
      setTeammates(data);
    } catch (err) {
      console.error("Failed to load recommendations:", err);
      setError("Failed to load recommendations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2.5">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-6 text-center space-y-3", className)}>
        <AlertCircle className="h-6 w-6 text-destructive/80" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchRecommendations} className="h-8 text-xs">
          <RefreshCw className="mr-2 h-3 w-3" /> Retry
        </Button>
      </div>
    );
  }

  if (teammates.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-8 text-center", className)}>
        <Sparkles className="h-8 w-8 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">No recommendations yet</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Complete your profile to get matched</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {teammates.map((teammate) => (
        <div
          key={teammate.id}
          className="flex items-start gap-3 rounded-lg p-2.5 hover:bg-muted/50 transition-colors cursor-pointer"
        >
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={teammate.avatarUrl || undefined} alt={teammate.fullName} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {getInitials(teammate.fullName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">{teammate.fullName}</p>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0 bg-primary/10 text-primary border-0">
                {teammate.score} pts
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground truncate">{teammate.department}</p>

            {teammate.matchReasons && teammate.matchReasons.length > 0 && (
              <p className="text-[10px] text-primary/70 font-medium mt-0.5 truncate">
                {teammate.matchReasons.join(" • ")}
              </p>
            )}

            <div className="flex flex-wrap gap-1 mt-1.5">
              {teammate.skills.slice(0, 3).map((skill) => (
                <span key={skill} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {skill}
                </span>
              ))}
              {teammate.skills.length > 3 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  +{teammate.skills.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
