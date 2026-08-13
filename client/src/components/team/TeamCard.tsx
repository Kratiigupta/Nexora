import Link from "next/link";

import { Users, Lock, Globe, ArrowRight } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TEAM_TYPES } from "@/lib/constants";
import type { Team } from "@/types/team";

interface TeamCardProps {
  team: Team;
}

export function TeamCard({ team }: TeamCardProps) {
  const teamType = TEAM_TYPES.find((t) => t.value === team.type)?.label || team.type;
  
  // Try to determine member count from relations if populated
  const memberCount = team.members ? team.members.length : 1; 

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-primary text-primary-foreground";
      case "admin":
        return "bg-blue-500 text-white";
      case "member":
      default:
        return "bg-muted text-muted-foreground hover:bg-muted/80";
    }
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-md hover:border-primary/20">
      <CardHeader className="p-5 pb-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex gap-3 items-center">
            <Avatar className="h-10 w-10 border rounded-md">
              <AvatarImage src={team.avatarUrl || undefined} alt={team.name} />
              <AvatarFallback className="rounded-md bg-primary/10 text-primary font-semibold">
                {team.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg leading-tight line-clamp-1" title={team.name}>
                {team.name}
              </h3>
              <div className="flex items-center text-xs text-muted-foreground mt-1 gap-2">
                <span className="flex items-center gap-1">
                  {team.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                  {team.isPublic ? "Public" : "Private"}
                </span>
                <span>•</span>
                <span className="capitalize">{teamType}</span>
              </div>
            </div>
          </div>
          {team.myRole && (
            <Badge variant="secondary" className={`capitalize shrink-0 ${getRoleBadgeColor(team.myRole)}`}>
              {team.myRole}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-0 flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3 text-balance">
          {team.description || "No description provided."}
        </p>
        
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>
              {memberCount} / {team.maxMembers} members
            </span>
          </div>
          {team.createdAt && (
            <span>Created {new Date(team.createdAt).toLocaleDateString()}</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0 mt-auto border-t">
        <Link href={`/teams/${team.id}`} className="w-full mt-4">
          <Button variant="ghost" className="w-full justify-between group">
            View Details
            <ArrowRight className="h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
