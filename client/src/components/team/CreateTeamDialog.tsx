"use client";

import { useState } from "react";
import { z } from "zod";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { TEAM_TYPES } from "@/lib/constants";
import { Users } from "lucide-react";
import type { Team } from "@/types/team";

const createTeamSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be at most 100 characters"),
  description: z.string().optional(),
  type: z.enum(["project", "hackathon", "startup", "research", "competition"]),
  maxMembers: z.number().int().min(2).max(50),
  isPublic: z.boolean(),
});

interface CreateTeamDialogProps {
  onSuccess: (team: Team) => void;
  trigger?: React.ReactNode;
}

export function CreateTeamDialog({ onSuccess, trigger }: CreateTeamDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "project",
    maxMembers: 5,
    isPublic: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === "maxMembers" ? parseInt(value) || value : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (value: string | null) => {
    if (value) {
      setFormData((prev) => ({ ...prev, type: value }));
      if (errors.type) setErrors((prev) => ({ ...prev, type: "" }));
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isPublic: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const validatedData = createTeamSchema.parse({
        ...formData,
        maxMembers: Number(formData.maxMembers)
      });
      
      const newTeam = await teamService.createTeam(validatedData);
      
      toast.success(`Team "${newTeam.name}" created successfully`);
      onSuccess(newTeam);
      
      // Reset and close
      setFormData({
        name: "",
        description: "",
        type: "project",
        maxMembers: 5,
        isPublic: true,
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
        toast.error(e.response?.data?.message || "Failed to create team");
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
            <Users className="h-4 w-4" />
            Create Team
          </Button>
        )}
      </div>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a New Team</DialogTitle>
          <DialogDescription>
            Form a team to collaborate on projects, hackathons, or startups.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Team Name <span className="text-destructive">*</span></Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Innovators"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="What is this team about?"
              value={formData.description}
              onChange={handleChange}
              disabled={isLoading}
              rows={3}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Team Type</Label>
              <Select value={formData.type} onValueChange={handleSelectChange} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {TEAM_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxMembers">Max Members</Label>
              <Input
                id="maxMembers"
                name="maxMembers"
                type="number"
                min={2}
                max={50}
                value={formData.maxMembers}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.maxMembers && <p className="text-xs text-destructive">{errors.maxMembers}</p>}
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={handleCheckboxChange}
              disabled={isLoading}
            />
            <Label htmlFor="isPublic" className="font-normal">
              Make team public (anyone can discover it)
            </Label>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
