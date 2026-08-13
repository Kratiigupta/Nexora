"use client";

import { useEffect, useState } from "react";
import { Plus, Users, Inbox, Check, X } from "lucide-react";

import { toast } from "sonner";
import { teamService } from "@/lib/services/team.service";
import { TeamCard } from "@/components/team/TeamCard";
import { CreateTeamDialog } from "@/components/team/CreateTeamDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Team, TeamInvitation } from "@/types/team";

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [isLoadingInvites, setIsLoadingInvites] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingInvites, setProcessingInvites] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    setIsLoadingTeams(true);
    setIsLoadingInvites(true);
    setError(null);
    try {
      const [teamsData, invitesData] = await Promise.all([
        teamService.getMyTeams(),
        teamService.getMyInvitations()
      ]);
      setTeams(teamsData);
      setInvitations(invitesData);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load teams data.");
    } finally {
      setIsLoadingTeams(false);
      setIsLoadingInvites(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRespondToInvite = async (teamId: string, requestId: string, status: "accepted" | "rejected") => {
    setProcessingInvites(prev => new Set(prev).add(requestId));
    try {
      await teamService.respondToInvite(teamId, requestId, status);
      toast.success(`Invitation ${status}`);
      setInvitations(prev => prev.filter(inv => inv.requestId !== requestId));
      if (status === "accepted") {
        const teamsData = await teamService.getMyTeams();
        setTeams(teamsData);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to ${status} invitation`);
    } finally {
      setProcessingInvites(prev => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  const handleTeamCreated = (newTeam: Team) => {
    setTeams(prev => [newTeam, ...prev]);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Teams</h2>
          <p className="text-muted-foreground mt-1">
            Manage your teams and collaborate on projects.
          </p>
        </div>
        <CreateTeamDialog onSuccess={handleTeamCreated} />
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center justify-between">
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={fetchData}>Retry</Button>
        </div>
      )}

      {/* Invitations Section */}
      {!isLoadingInvites && invitations.length > 0 && (
        <div className="space-y-4 mb-8">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Inbox className="h-5 w-5 text-primary" />
            Pending Invitations ({invitations.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {invitations.map((inv) => {
              const isProcessing = processingInvites.has(inv.requestId);
              return (
                <Card key={inv.requestId} className="overflow-hidden border-primary/30 shadow-sm bg-primary/5">
                  <CardContent className="p-4 flex flex-col h-full">
                    <div className="flex gap-3 items-start mb-2">
                      <Avatar className="h-10 w-10 border bg-background">
                        <AvatarImage src={inv.teamAvatarUrl || undefined} />
                        <AvatarFallback className="text-primary font-bold">
                          {inv.teamName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-lg line-clamp-1">{inv.teamName}</h4>
                        <p className="text-xs text-muted-foreground capitalize">{inv.teamType}</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 my-2 flex-1">
                      <span className="font-medium text-foreground">@{inv.inviter.username}</span> invited you
                      {inv.message ? `: "${inv.message}"` : " to join this team."}
                    </p>
                    
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-2 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleRespondToInvite(inv.teamId, inv.requestId, "rejected")}
                          disabled={isProcessing}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          className="h-8 px-3 gap-1"
                          onClick={() => handleRespondToInvite(inv.teamId, inv.requestId, "accepted")}
                          disabled={isProcessing}
                        >
                          <Check className="h-4 w-4" /> Accept
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* My Teams Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          My Teams
        </h3>
        
        {isLoadingTeams ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border bg-card text-card-foreground shadow space-y-4 p-5 h-[200px]">
                <div className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
                <div className="space-y-2 pt-4">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : teams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-card/50 border rounded-xl border-dashed">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Users className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">You haven't joined any teams yet</h3>
            <p className="text-muted-foreground mt-2 max-w-md mb-6">
              Create your own team to collaborate on projects and hackathons, or wait for an invitation from others.
            </p>
            <CreateTeamDialog onSuccess={handleTeamCreated} />
          </div>
        )}
      </div>
    </div>
  );
}
