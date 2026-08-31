"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { FolderKanban, Users, GitBranch, ExternalLink, Trash2, ArrowLeft, MessageSquare } from "lucide-react";
import Link from "next/link";
import { projectService } from "@/lib/services/project.service";
import type { Project, ProjectTask } from "@/types/project";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";

import { ProjectKanban } from "@/components/project/ProjectKanban";
import { EditProjectDialog } from "@/components/project/EditProjectDialog";
import { CreateTaskDialog } from "@/components/project/CreateTaskDialog";

export default function ProjectWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { profile: user } = useAuthStore();
  
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [taskToEdit, setTaskToEdit] = useState<ProjectTask | undefined>(undefined);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const loadProject = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await projectService.getProjectById(resolvedParams.id);
      setProject(data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Failed to load project workspace");
    } finally {
      setIsLoading(false);
    }
  }, [resolvedParams.id]);

  useEffect(() => {
    void Promise.resolve().then(() => loadProject());
  }, [loadProject]);

  const handleDeleteProject = async () => {
    if (!project) return;
    if (!confirm("Are you sure you want to delete this project? This cannot be undone.")) return;
    
    setIsDeleting(true);
    try {
      await projectService.deleteProject(project.id);
      toast.success("Project deleted successfully");
      router.push("/projects");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Failed to delete project");
      setIsDeleting(false);
    }
  };

  const handleTaskCreatedOrUpdated = (updatedTask: ProjectTask) => {
    if (!project) return;
    
    setProject(prev => {
      if (!prev) return prev;
      
      const tasks = prev.tasks || [];
      const existingTaskIndex = tasks.findIndex(t => t.id === updatedTask.id);
      
      if (existingTaskIndex >= 0) {
        // Update
        const newTasks = [...tasks];
        newTasks[existingTaskIndex] = updatedTask;
        return { ...prev, tasks: newTasks };
      } else {
        // Create
        return { ...prev, tasks: [updatedTask, ...tasks] };
      }
    });
  };

  const handleTaskStatusUpdated = async (taskId: string, newStatus: string) => {
    if (!project) return;
    try {
      const updatedTask = await projectService.updateTask(project.id, taskId, { status: newStatus as ProjectTask["status"] });
      handleTaskCreatedOrUpdated(updatedTask);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Failed to update task status");
      throw err; // Let the card handle loading state rollback if necessary
    }
  };

  const handleTaskDeleted = async (taskId: string) => {
    if (!project) return;
    if (!confirm("Delete this task?")) return;
    
    try {
      await projectService.deleteTask(project.id, taskId);
      setProject(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: (prev.tasks || []).filter(t => t.id !== taskId)
        };
      });
      toast.success("Task deleted");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Failed to delete task");
    }
  };

  const openTaskEditDialog = (task: ProjectTask) => {
    setTaskToEdit(task);
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 w-full h-full">
        <div className="flex gap-4 items-center">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex-1 p-8 max-w-3xl mx-auto w-full">
        <div className="bg-destructive/10 text-destructive border-destructive/20 border p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">Cannot Access Workspace</h3>
          <p>
            {error || "Project not found"}
          </p>
          <div className="mt-4">
            <Link href="/projects" className={buttonVariants({ variant: "outline" })}>
              Back to Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authorization flags based on frontend data (backend enforces truth)
  const isCreator = project.createdBy === user?.id;
  // A simplistic check since we don't have the current user's team role in `project` response.
  // The backend correctly restricts actions. For UI, we'll allow anyone who can see it to interact,
  // except for Edit/Delete project which we might restrict to creator just for UI cleanliness, 
  // though team admins can also delete (but we don't know who is an admin from the project data).
  // We'll show edit/delete to the creator or if it's a team project, we'll just show it and let backend block if not admin.
  const canManageProject = isCreator || !!project.teamId; 
  const canManageTasks = true; // Anyone who can view the project can manage tasks in our model

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "in_progress": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "on_hold": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] w-full">
      <div className="border-b bg-card">
        <div className="p-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex gap-4 items-start">
            <Link href="/projects" className="mt-1 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="bg-primary/10 p-2.5 rounded-lg text-primary shrink-0 hidden sm:block">
              <FolderKanban className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold leading-tight">{project.title}</h1>
                <Badge variant="outline" className={`ml-2 text-xs uppercase ${getStatusColor(project.status)}`}>
                  {project.status.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm max-w-2xl">
                {project.description || "No description provided."}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                {project.team ? (
                  <div className="flex items-center gap-1.5" title="Team Workspace">
                    <Users className="h-4 w-4" />
                    <span>{project.team.name}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5" title="Personal Workspace">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={project.creator?.avatarUrl || undefined} />
                      <AvatarFallback className="text-[8px] bg-primary/20 text-primary">{project.creator?.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>Personal</span>
                  </div>
                )}
                
                {(project.repoUrl || project.liveUrl) && (
                  <div className="flex items-center gap-3 border-l pl-4 border-border">
                    {project.repoUrl && (
                      <a href={project.repoUrl} target="_blank" rel="noreferrer" className="hover:text-foreground flex items-center gap-1">
                        <GitBranch className="h-4 w-4" /> Repo
                      </a>
                    )}
                    {project.liveUrl && (
                      <a href={project.liveUrl} target="_blank" rel="noreferrer" className="hover:text-foreground flex items-center gap-1">
                        <ExternalLink className="h-4 w-4" /> Live
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={async () => {
                try {
                  const { chatService } = await import("@/lib/services/chat.service");
                  const conv = await chatService.createConversation({ type: "project", projectId: project.id });
                  router.push(`/messages?conversation=${conv.id}`);
                } catch (err: unknown) {
                  const e = err as { response?: { data?: { message?: string } } };
                  toast.error(e.response?.data?.message || "Failed to open project chat");
                }
              }}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Chat</span>
            </Button>

            {canManageProject && (
              <>
                <EditProjectDialog project={project} onSuccess={(p) => setProject(prev => prev ? {...prev, ...p} : null)} />
                <Button variant="destructive" size="sm" onClick={handleDeleteProject} disabled={isDeleting} className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-8 overflow-hidden flex flex-col min-h-0 bg-muted/10">
        <ProjectKanban
          project={project}
          canManage={canManageTasks}
          onTaskCreated={handleTaskCreatedOrUpdated}
          onTaskUpdated={handleTaskStatusUpdated}
          onTaskDeleted={handleTaskDeleted}
          onTaskEdit={openTaskEditDialog}
        />
      </div>

      {/* Hidden dialog for editing tasks triggered from cards */}
      {isEditDialogOpen && taskToEdit && (
        <CreateTaskDialog
          project={project}
          taskToEdit={taskToEdit}
          onSuccess={(t) => {
            handleTaskCreatedOrUpdated(t);
            setIsEditDialogOpen(false);
          }}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </div>
  );
}
