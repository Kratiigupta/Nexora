"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { FolderKanban, Users } from "lucide-react";
import { projectService } from "@/lib/services/project.service";
import { teamService } from "@/lib/services/team.service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { Project } from "@/types/project";
import type { Team } from "@/types/team";

const createProjectSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200, "Title must be at most 200 characters"),
  description: z.string().optional(),
  status: z.enum(["planning", "in_progress", "completed", "on_hold"]),
  repoUrl: z.string().url("Invalid repository URL").optional().or(z.literal("")),
  liveUrl: z.string().url("Invalid live URL").optional().or(z.literal("")),
  teamId: z.string().optional(),
});

interface CreateProjectDialogProps {
  onSuccess?: (project: Project) => void;
  trigger?: React.ReactNode;
  defaultTeamId?: string;
}

export function CreateProjectDialog({ onSuccess, trigger, defaultTeamId }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [teams, setTeams] = useState<Team[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "planning",
    repoUrl: "",
    liveUrl: "",
    teamId: defaultTeamId || "personal", // "personal" is a special value indicating no team
  });

  const loadTeams = async () => {
    setIsLoadingTeams(true);
    try {
      const myTeams = await teamService.getMyTeams();
      // Filter for teams where user has permission to create projects (in backend: any active member can)
      setTeams(myTeams);
    } catch {
      toast.error("Failed to load your teams");
    } finally {
      setIsLoadingTeams(false);
    }
  };

  useEffect(() => {
    if (open && teams.length === 0) {
      void Promise.resolve().then(() => loadTeams());
    }
  }, [open, teams.length]);

  useEffect(() => {
    if (defaultTeamId) {
      void Promise.resolve().then(() => setFormData(prev => ({ ...prev, teamId: defaultTeamId })));
    }
  }, [defaultTeamId]);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (field: string, value: string | null) => {
    if (value) {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      // Prepare data
      const dataToValidate = {
        ...formData,
        teamId: formData.teamId === "personal" ? undefined : formData.teamId,
      };

      const validatedData = createProjectSchema.parse(dataToValidate);
      
      const newProject = await projectService.createProject(validatedData);
      
      toast.success(`Project "${newProject.title}" created successfully`);
      if (onSuccess) onSuccess(newProject);
      
      // Reset and close
      setFormData({
        title: "",
        description: "",
        status: "planning",
        repoUrl: "",
        liveUrl: "",
        teamId: defaultTeamId || "personal",
      });
      setOpen(false);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err: z.ZodIssue) => {
          if (err.path[0]) newErrors[err.path[0].toString()] = err.message;
        });
        setErrors(newErrors);
      } else {
        const e = error as { response?: { data?: { message?: string } } };
        toast.error(e.response?.data?.message || "Failed to create project");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)} className="inline-block">
        {trigger || (
          <Button className="gap-2">
            <FolderKanban className="h-4 w-4" />
            Create Project
          </Button>
        )}
      </div>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create a New Project</DialogTitle>
          <DialogDescription>
            Start a new standalone project or create one for your team.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title <span className="text-destructive">*</span></Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g. NextGen Platform"
              value={formData.title}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="teamId">Workspace / Team</Label>
            <Select 
              value={formData.teamId} 
              onValueChange={(val) => handleSelectChange("teamId", val)} 
              disabled={isLoading || isLoadingTeams || !!defaultTeamId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select workspace" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal Project</SelectItem>
                {teams.length > 0 && (
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    My Teams
                  </div>
                )}
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 opacity-70" />
                      {team.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.teamId && <p className="text-xs text-destructive">{errors.teamId}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="What is this project about?"
              value={formData.description}
              onChange={handleChange}
              disabled={isLoading}
              rows={3}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Initial Status</Label>
            <Select value={formData.status} onValueChange={(val) => handleSelectChange("status", val)} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-xs text-destructive">{errors.status}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="repoUrl">Repository URL</Label>
              <Input
                id="repoUrl"
                name="repoUrl"
                placeholder="https://github.com/..."
                value={formData.repoUrl}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.repoUrl && <p className="text-xs text-destructive">{errors.repoUrl}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="liveUrl">Live URL</Label>
              <Input
                id="liveUrl"
                name="liveUrl"
                placeholder="https://..."
                value={formData.liveUrl}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.liveUrl && <p className="text-xs text-destructive">{errors.liveUrl}</p>}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
