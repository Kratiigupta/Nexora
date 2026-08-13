import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import type { TeammateRecommendation } from "@/types/dashboard";

interface MentorCardProps {
  mentor: TeammateRecommendation;
  onRequestSession: (username: string) => void;
}

export function MentorCard({ mentor, onRequestSession }: MentorCardProps) {
  return (
    <Card className="hover:shadow-md transition-all h-full flex flex-col group relative overflow-hidden bg-card/50 hover:bg-card/80 border-border/50">
      <CardContent className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
              <AvatarImage src={mentor.avatarUrl || undefined} alt={mentor.fullName} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {getInitials(mentor.fullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold leading-none mb-1">{mentor.fullName}</h3>
              <p className="text-xs text-muted-foreground">@{mentor.username}</p>
            </div>
          </div>
          {mentor.score && (
            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              {mentor.score}% Match
            </Badge>
          )}
        </div>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {mentor.bio || `${mentor.department} student • Year ${mentor.year}`}
          </p>
        </div>

        <div className="mb-6 flex-1">
          <div className="flex flex-wrap gap-1.5">
            {mentor.skills?.slice(0, 4).map((skillName, idx) => (
              <Badge key={idx} variant="outline" className="text-xs bg-background/50">
                {skillName}
              </Badge>
            ))}
            {mentor.skills?.length > 4 && (
              <Badge variant="outline" className="text-xs bg-background/50">
                +{mentor.skills.length - 4} more
              </Badge>
            )}
          </div>
        </div>

        <Button 
          className="w-full shadow-sm group-hover:shadow transition-all bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white" 
          onClick={() => onRequestSession(mentor.username)}
        >
          Request Mentorship
        </Button>
      </CardContent>
    </Card>
  );
}
