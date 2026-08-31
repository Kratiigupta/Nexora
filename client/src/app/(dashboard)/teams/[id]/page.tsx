"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Users, LogOut, UserMinus, ShieldAlert, MoreHorizontal, AlertTriangle, MessageSquare } from "lucide-react";

import { toast } from "sonner";
import { teamService } from "@/lib/services/team.service";
import { InviteMemberDialog } from "@/components/team/InviteMemberDialog";
import { CreateProjectDialog } from "@/components/project/CreateProjectDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Team, TeamMember } from "@/types/team";

export default function TeamDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.id as string;
  
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentUserRole, setCurrentUserRole] = useState<"owner" | "admin" | "member" | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchTeam = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await teamService.getTeamById(teamId);
      setTeam(data);
      
      // Attempt to figure out the current user's ID by checking the profile service
      // Or we can determine it from the getMyTeams if we want to avoid extra calls
      // but since getTeamById doesn't return myRole explicitly (unless added by backend),
      // let's fetch profile to be sure we know who we are.
      import("@/lib/services/profile.service").then(module => {
        module.profileService.getMyProfile().then(profile => {
          setCurrentUserId(profile.id);
          const myMembership = data.members?.find(m => m.userId === profile.id);
          if (myMembership) {
            setCurrentUserRole(myMembership.role);
          }
        }).catch(() => {});
      });

    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Failed to load team details");
    } finally {
      setIsLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    if (teamId) {
      void Promise.resolve().then(() => fetchTeam());
    }
  }, [teamId, fetchTeam]);

  const handleLeaveTeam = async () => {
    setIsProcessing(true);
    try {
      await teamService.leaveTeam(teamId);
      toast.success(`You have left ${team?.name}`);
      router.push("/teams");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Failed to leave team");
      setIsProcessing(false);
      setIsLeaveDialogOpen(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    setIsProcessing(true);
    try {
      await teamService.removeMember(teamId, memberToRemove.userId);
      toast.success(`Removed ${memberToRemove.user?.fullName} from the team`);
      setMemberToRemove(null);
      await fetchTeam(); // Refresh
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Failed to remove member");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6 space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-1/3" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center h-full text-center">
        <ShieldAlert className="h-12 w-12 text-destructive mb-4 opacity-50" />
        <h2 className="text-2xl font-bold mb-2">Team Not Found</h2>
        <p className="text-muted-foreground mb-6 max-w-md">{error || "This team might have been deleted or you don't have access to it."}</p>
        <Button onClick={() => router.push("/teams")}>Back to Teams</Button>
      </div>
    );
  }

  const isOwner = currentUserRole === "owner";
  const isAdmin = currentUserRole === "admin";
  const canInvite = isOwner || isAdmin;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner": return <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] uppercase h-5">Owner</Badge>;
      case "admin": return <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 text-[10px] uppercase h-5">Admin</Badge>;
      default: return <Badge variant="outline" className="text-muted-foreground text-[10px] uppercase h-5">Member</Badge>;
    }
  };

  return (
    <div className="flex-1 p-6 max-w-5xl mx-auto w-full pb-20">
      {/* Header Actions */}
      <div className="mb-6 flex justify-between items-center">
        <Button variant="ghost" className="gap-2 -ml-4" onClick={() => router.push("/teams")}>
          <ArrowLeft className="h-4 w-4" />
          Back to Teams
        </Button>

        <div className="flex gap-2">
          {currentUserRole && (
            <Button
              variant="default"
              className="gap-2"
              onClick={async () => {
                try {
                  const { chatService } = await import("@/lib/services/chat.service");
                  const conv = await chatService.createConversation({ type: "team", teamId });
                  router.push(`/messages?conversation=${conv.id}`);
                } catch (err: unknown) {
                  const e = err as { response?: { data?: { message?: string } } };
                  toast.error(e.response?.data?.message || "Failed to open team chat");
                }
              }}
            >
              <MessageSquare className="h-4 w-4" />
              Open Team Chat
            </Button>
          )}

          {currentUserRole && !isOwner && (
            <Button
              variant="outline"
              className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive gap-2"
              onClick={() => setIsLeaveDialogOpen(true)}
            >
              <LogOut className="h-4 w-4" />
              Leave Team
            </Button>
          )}
        </div>
      </div>

      {/* Team Header */}
      <div className="flex flex-col md:flex-row gap-6 md:items-start mb-10 justify-between">
        <div className="flex flex-col md:flex-row gap-6 md:items-start flex-1">
          <Avatar className="h-24 w-24 border-2 rounded-xl shadow-sm">
            <AvatarImage src={team.avatarUrl || undefined} />
            <AvatarFallback className="rounded-xl text-3xl bg-primary/10 text-primary font-bold">
              {team.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
              <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
              <div className="flex gap-2">
                <Badge variant="secondary" className="capitalize text-xs font-medium">
                  {team.type}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {team.isPublic ? "Public" : "Private"}
                </Badge>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed text-base max-w-3xl">
              {team.description || "No description provided for this team."}
            </p>

            <div className="flex items-center text-sm text-muted-foreground pt-1">
              <Users className="h-4 w-4 mr-2 opacity-70" />
              <span className="font-medium text-foreground mr-1">{team.members?.length || 1}</span> of {team.maxMembers} members
              <span className="mx-3">•</span>
              Created {new Date(team.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 shrink-0 md:items-end">
          <CreateProjectDialog
            defaultTeamId={team.id}
            onSuccess={(p) => {
              router.push(`/projects/${p.id}`);
            }}
          />
          <Button variant="outline" onClick={() => router.push("/projects")} className="w-full">
            View Projects
          </Button>
        </div>
      </div>

      {/* Members Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-semibold tracking-tight">Team Members</h2>
          
          {canInvite && (
            <InviteMemberDialog teamId={team.id} onInviteSuccess={fetchTeam} />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {team.members?.map((member) => {
            const isMe = member.userId === currentUserId;
            // Admins can't remove owners or other admins. Owners can remove anyone but themselves.
            const canRemove = 
              !isMe && 
              (isOwner || (isAdmin && member.role === "member"));

            return (
              <div key={member.userId} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border shadow-sm">
                    <AvatarImage src={member.user?.avatarUrl || undefined} />
                    <AvatarFallback className="bg-primary/5 text-primary">
                      {member.user?.fullName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{member.user?.fullName}</p>
                      {isMe && <Badge variant="outline" className="text-[9px] uppercase px-1.5 h-4 py-0">You</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">@{member.user?.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getRoleBadge(member.role)}
                  
                  {canRemove && (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground shrink-0" />
                        }
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                          onClick={() => setMemberToRemove(member)}
                        >
                          <UserMinus className="h-4 w-4 mr-2" />
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leave Team Confirmation */}
      <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Leave Team
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to leave <strong>{team.name}</strong>? You will lose access to team resources and conversations.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsLeaveDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLeaveTeam} disabled={isProcessing}>
              {isProcessing ? "Leaving..." : "Leave Team"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation */}
      <Dialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{memberToRemove?.user?.fullName}</strong> from the team?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setMemberToRemove(null)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveMember} disabled={isProcessing}>
              {isProcessing ? "Removing..." : "Remove Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
