"use client";

import { useState, useEffect } from "react";
import { UserPlus, Star, ChevronDown, ChevronUp } from "lucide-react";
import { profileService } from "@/lib/services/profile.service";
import { teamService } from "@/lib/services/team.service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { toast } from "sonner";
import type { TeammateRecommendation } from "@/types/dashboard";

interface InviteMemberDialogProps {
  teamId: string;
  trigger?: React.ReactNode;
  onInviteSuccess?: () => void;
}

export function InviteMemberDialog({ teamId, trigger, onInviteSuccess }: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<TeammateRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [invitingIds, setInvitingIds] = useState<Set<string>>(new Set());
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (open && recommendations.length === 0) {
      loadRecommendations();
    }
  }, [open]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      const data = await profileService.getRecommendedTeammates();
      setRecommendations(data);
    } catch (error) {
      toast.error("Failed to load recommendations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (userId: string, name: string) => {
    setInvitingIds((prev) => new Set(prev).add(userId));
    try {
      await teamService.inviteToTeam(teamId, userId);
      toast.success(`Invitation sent to ${name}`);
      setInvitedIds((prev) => new Set(prev).add(userId));
      if (onInviteSuccess) onInviteSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to invite ${name}`);
    } finally {
      setInvitingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)} className="inline-block">
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Invite Members
          </Button>
        )}
      </div>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Invite Members</DialogTitle>
          <DialogDescription>
            Discover and invite recommended students to join your team.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center space-y-4">
              <UserPlus className="h-12 w-12 opacity-20" />
              <p>No recommendations available right now. Tell us more about your skills in your profile!</p>
            </div>
          ) : (
            <div className="h-full overflow-y-auto pr-4">
              <div className="space-y-4">
                {recommendations.map((user) => {
                  const isInviting = invitingIds.has(user.id);
                  const isInvited = invitedIds.has(user.id);
                  const isExpanded = expandedId === user.id;

                  return (
                    <div key={user.id} className="bg-card border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md">
                      <div className="p-4 flex gap-4">
                        <Avatar className="h-12 w-12 border">
                          <AvatarImage src={user.avatarUrl || undefined} />
                          <AvatarFallback className="bg-primary/5 text-primary">
                            {user.fullName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <div className="truncate">
                              <h4 className="font-semibold truncate">{user.fullName}</h4>
                              <p className="text-xs text-muted-foreground truncate">
                                @{user.username} • {user.department} • Year {user.year}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 bg-green-500/10 text-green-600 px-2 py-1 rounded-full text-xs font-medium shrink-0">
                              <Star className="h-3 w-3 fill-current" />
                              {Math.round(user.score * 100)}% Match
                            </div>
                          </div>
                          
                          <div className="mt-3 flex flex-wrap gap-1.5 h-[22px] overflow-hidden relative">
                            {user.skills.map(skill => (
                              <Badge key={skill} variant="secondary" className="text-[10px] h-[22px] px-2 font-normal">
                                {skill}
                              </Badge>
                            ))}
                            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none" />
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 shrink-0">
                          <Button 
                            size="sm" 
                            disabled={isInviting || isInvited}
                            onClick={() => handleInvite(user.id, user.fullName)}
                            className="w-[90px]"
                          >
                            {isInvited ? "Invited" : isInviting ? "..." : "Invite"}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-xs text-muted-foreground"
                            onClick={() => setExpandedId(isExpanded ? null : user.id)}
                          >
                            {isExpanded ? "Less" : "More"}
                            {isExpanded ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                          </Button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-2 bg-muted/30 border-t text-sm animate-in slide-in-from-top-2">
                          <h5 className="font-medium text-xs uppercase tracking-wider text-muted-foreground mb-2">Match Reasons</h5>
                          <ul className="space-y-1.5">
                            {user.matchReasons.map((reason, idx) => (
                              <li key={idx} className="flex gap-2 text-muted-foreground text-xs items-start">
                                <span className="text-primary/50 mt-0.5">•</span>
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                          
                          {user.bio && (
                            <div className="mt-3 text-xs text-muted-foreground">
                              <span className="font-medium">Bio: </span>
                              {user.bio}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
