"use client";

import { useState } from "react";
import { z } from "zod";
import { Edit2 } from "lucide-react";
import { projectService } from "@/lib/services/project.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { Project } from "@/types/project";

const updateProjectSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200, "Title must be at most 200 characters").optional(),
  description: z.string().optional(),
  status: z.enum(["planning", "in_progress", "completed", "on_hold"]).optional(),
  repoUrl: z.string().url("Invalid repository URL").optional().or(z.literal("")),
  liveUrl: z.string().url("Invalid live URL").optional().or(z.literal("")),
});

interface EditProjectDialogProps {
  project: Project;
  onSuccess: (project: Project) => void;
  trigger?: React.ReactNode;
}

export function EditProjectDialog({ project, onSuccess, trigger }: EditProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description || "",
    status: project.status,
    repoUrl: project.repoUrl || "",
    liveUrl: project.liveUrl || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (field: string, value: string | null) => {
    if (value === null) return;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const validatedData = updateProjectSchema.parse(formData);
      
      const updatedProject = await projectService.updateProject(project.id, validatedData);
      
      toast.success("Project updated successfully");
      onSuccess(updatedProject);
      setOpen(false);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err: z.ZodIssue) => {
          if (err.path[0] !== undefined) newErrors[String(err.path[0])] = err.message;
        });
        setErrors(newErrors);
      } else {
        const e = error as { response?: { data?: { message?: string } } };
        toast.error(e.response?.data?.message || "Failed to update project");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)} className="inline-block">
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Edit2 className="h-4 w-4" />
            Edit Project
          </Button>
        )}
      </div>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title <span className="text-destructive">*</span></Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isLoading}
              rows={3}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
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
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
