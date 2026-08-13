import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MessageSquare, Users, FolderKanban } from "lucide-react";
import { profileService } from "@/lib/services/profile.service";
import { teamService } from "@/lib/services/team.service";
import { projectService } from "@/lib/services/project.service";
import { chatService } from "@/lib/services/chat.service";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import type { Team } from "@/types/team";
import type { Project } from "@/types/project";
import type { TeammateRecommendation } from "@/types/dashboard";
import type { CreateConversationPayload } from "@/types/chat";

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (conversationId: string) => void;
}

export function NewConversationDialog({ open, onOpenChange, onSuccess }: NewConversationDialogProps) {
  const { profile } = useAuthStore();
  const [tab, setTab] = useState<"direct" | "team" | "project">("direct");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const [users, setUsers] = useState<TeammateRecommendation[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (!open) return;
    
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (tab === "direct" && users.length === 0) {
          const recommended = await profileService.getRecommendedTeammates();
          // Exclude self just in case
          setUsers(recommended.filter((u) => u.id !== profile?.id));
        } else if (tab === "team" && teams.length === 0) {
          const myTeams = await teamService.getMyTeams();
          setTeams(myTeams);
        } else if (tab === "project" && projects.length === 0) {
          const myProjects = await projectService.getMyProjects();
          setProjects(myProjects);
        }
      } catch (error) {
        toast.error(`Failed to load ${tab}s`);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [open, tab, users.length, teams.length, projects.length, profile?.id]);

  const handleCreate = async (id: string, type: "direct" | "team" | "project") => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const payload: CreateConversationPayload = { type };
      if (type === "direct") payload.participantId = id;
      else if (type === "team") payload.teamId = id;
      else if (type === "project") payload.projectId = id;

      const conversation = await chatService.createConversation(payload);
      onSuccess(conversation.id);
      onOpenChange(false);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to start conversation");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "direct" | "team" | "project")} className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="direct">
              <MessageSquare className="h-4 w-4 mr-2" />
              Direct
            </TabsTrigger>
            <TabsTrigger value="team">
              <Users className="h-4 w-4 mr-2" />
              Team
            </TabsTrigger>
            <TabsTrigger value="project">
              <FolderKanban className="h-4 w-4 mr-2" />
              Project
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 min-h-[300px] max-h-[400px] overflow-y-auto pr-2">
            {isLoading && (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {!isLoading && tab === "direct" && (
              <div className="space-y-2">
                {users.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No recommended users found.</p>
                ) : (
                  users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border">
                          <AvatarImage src={user.avatarUrl || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {user.fullName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{user.fullName}</p>
                          <p className="text-xs text-muted-foreground">Match: {Math.round(user.score * 100)}%</p>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => handleCreate(user.id, "direct")} disabled={isCreating}>
                        Message
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}

            {!isLoading && tab === "team" && (
              <div className="space-y-2">
                {teams.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">You are not part of any teams.</p>
                ) : (
                  teams.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border">
                          <AvatarImage src={t.avatarUrl || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {t.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.members?.length || 1} members</p>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => handleCreate(t.id, "team")} disabled={isCreating}>
                        Group Chat
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}

            {!isLoading && tab === "project" && (
              <div className="space-y-2">
                {projects.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">You do not have access to any projects.</p>
                ) : (
                  projects.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <FolderKanban className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{p.title}</p>
                          <p className="text-xs text-muted-foreground capitalize">{p.status.replace("_", " ")}</p>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => handleCreate(p.id, "project")} disabled={isCreating}>
                        Project Chat
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
