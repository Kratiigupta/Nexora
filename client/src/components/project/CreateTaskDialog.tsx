"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { Plus } from "lucide-react";
import { projectService } from "@/lib/services/project.service";
import { teamService } from "@/lib/services/team.service";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import type { Project, ProjectTask } from "@/types/project";
import type { TeamMember } from "@/types/team";

const createTaskSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200, "Title must be at most 200 characters"),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "in_review", "done"]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  assignedTo: z.string().optional().nullable(),
  dueDate: z.string().optional(),
});

interface CreateTaskDialogProps {
  project: Project;
  onSuccess: (task: ProjectTask) => void;
  trigger?: React.ReactNode;
  initialStatus?: "todo" | "in_progress" | "in_review" | "done";
  taskToEdit?: ProjectTask;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateTaskDialog({ project, onSuccess, trigger, initialStatus = "todo", taskToEdit, open: controlledOpen, onOpenChange }: CreateTaskDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = onOpenChange || setUncontrolledOpen;

  const [isLoading, setIsLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: initialStatus,
    priority: "medium",
    assignedTo: "unassigned",
    dueDate: "",
  });

  useEffect(() => {
    void Promise.resolve().then(() => {
      if (taskToEdit) {
        setFormData({
          title: taskToEdit.title,
          description: taskToEdit.description || "",
          status: taskToEdit.status,
          priority: taskToEdit.priority,
          assignedTo: taskToEdit.assignedTo || "unassigned",
          dueDate: taskToEdit.dueDate ? taskToEdit.dueDate.split("T")[0] : "",
        });
      } else {
        setFormData(prev => ({ ...prev, status: initialStatus }));
      }
    });
  }, [initialStatus, taskToEdit, open]);

  const loadTeamMembers = async (teamId: string) => {
    try {
      const team = await teamService.getTeamById(teamId);
      if (team.members) {
        setTeamMembers(team.members);
      }
    } catch {
      toast.error("Failed to load team members for assignment");
    }
  };

  useEffect(() => {
    if (open && project.teamId && teamMembers.length === 0) {
      void Promise.resolve().then(() => loadTeamMembers(project.teamId!));
    }
  }, [open, project.teamId, teamMembers.length]);

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
      const dataToValidate = {
        ...formData,
        assignedTo: formData.assignedTo === "unassigned" ? null : formData.assignedTo,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
      };

      const validatedData = createTaskSchema.parse(dataToValidate);
      
      let savedTask: ProjectTask;
      if (taskToEdit) {
        savedTask = await projectService.updateTask(project.id, taskToEdit.id, validatedData);
        toast.success("Task updated successfully");
      } else {
        savedTask = await projectService.createTask(project.id, validatedData);
        toast.success("Task created successfully");
      }
      
      onSuccess(savedTask);
      
      if (!taskToEdit) {
        setFormData({
          title: "",
          description: "",
          status: initialStatus,
          priority: "medium",
          assignedTo: "unassigned",
          dueDate: "",
        });
      }
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
        toast.error(e.response?.data?.message || "Failed to create task");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)} className="inline-block">
        {trigger || (
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        )}
      </div>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{taskToEdit ? "Edit Task" : "Create Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g. Design the database schema"
              value={formData.title}
              onChange={handleChange}
              disabled={isLoading}
              autoFocus
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Task details..."
              value={formData.description}
              onChange={handleChange}
              disabled={isLoading}
              rows={3}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(val) => handleSelectChange("status", val)} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(val) => handleSelectChange("priority", val)} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assign To</Label>
              <Select value={formData.assignedTo} onValueChange={(val) => handleSelectChange("assignedTo", val)} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {project.teamId ? (
                    teamMembers.map((member) => (
                      <SelectItem key={member.userId} value={member.userId}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-4 w-4">
                            <AvatarImage src={member.user?.avatarUrl || undefined} />
                            <AvatarFallback className="text-[8px]">{member.user?.fullName.substring(0, 1)}</AvatarFallback>
                          </Avatar>
                          {member.user?.username}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    // Standalone project: only creator can be assigned
                    <SelectItem value={project.createdBy}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={project.creator?.avatarUrl || undefined} />
                          <AvatarFallback className="text-[8px]">{project.creator?.fullName.substring(0, 1)}</AvatarFallback>
                        </Avatar>
                        Myself
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errors.assignedTo && <p className="text-xs text-destructive">{errors.assignedTo}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.dueDate && <p className="text-xs text-destructive">{errors.dueDate}</p>}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : (taskToEdit ? "Save Changes" : "Create Task")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
