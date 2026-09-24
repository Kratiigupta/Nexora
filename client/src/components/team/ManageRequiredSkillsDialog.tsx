"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { teamService } from "@/lib/services/team.service";
import { Plus, Search, X, Settings2, Loader2 } from "lucide-react";
import type { TeamRequiredSkill } from "@/types/team";

interface ManageRequiredSkillsDialogProps {
  teamId: string;
  currentSkills: TeamRequiredSkill[];
  onSuccess: () => void;
  canEdit: boolean;
}

export function ManageRequiredSkillsDialog({ teamId, currentSkills, onSuccess, canEdit }: ManageRequiredSkillsDialogProps) {
  const [open, setOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [catalog, setCatalog] = useState<{ id: string; name: string; category: string }[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkillIds, setSelectedSkillIds] = useState<Set<string>>(new Set());

  const fetchCatalog = async () => {
    setIsLoadingSkills(true);
    try {
      const skills = await teamService.getAllSkills();
      setCatalog(skills);
    } catch (err: unknown) {
      void err;
      toast.error("Failed to load skills catalog");
    } finally {
      setIsLoadingSkills(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setSelectedSkillIds(new Set(currentSkills.map(s => s.skillId)));
      setSearchQuery("");
      if (catalog.length === 0) {
        void fetchCatalog();
      }
    }
  };



  const handleSave = async () => {
    setIsProcessing(true);
    try {
      await teamService.updateRequiredSkills(teamId, Array.from(selectedSkillIds));
      toast.success("Required skills updated");
      setOpen(false);
      onSuccess();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Failed to update required skills");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleSkill = (skillId: string) => {
    setSelectedSkillIds(prev => {
      const next = new Set(prev);
      if (next.has(skillId)) {
        next.delete(skillId);
      } else {
        if (next.size >= 20) {
          toast.error("Maximum 20 required skills allowed");
          return prev;
        }
        next.add(skillId);
      }
      return next;
    });
  };

  if (!canEdit) return null;

  const filteredCatalog = catalog.filter(
    (s) => s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCount = selectedSkillIds.size;

  return (
    <>
      <Button variant="outline" size="sm" className="gap-2" onClick={() => handleOpenChange(true)}>
        <Settings2 className="h-4 w-4" />
        Edit Skills
      </Button>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Required Skills</DialogTitle>
          <DialogDescription>
            Select the skills required or preferred for members joining this team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills..."
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {Array.from(selectedSkillIds).map(id => {
              const skill = catalog.find(s => s.id === id) || currentSkills.find(s => s.skillId === id)?.skill;
              if (!skill) return null;
              return (
                <div key={id} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-medium">
                  {skill.name}
                  <button type="button" onClick={() => toggleSkill(id)} className="hover:bg-primary/20 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="border rounded-md p-2 h-48 overflow-y-auto bg-muted/30">
            {isLoadingSkills ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : filteredCatalog.length > 0 ? (
              <div className="space-y-1">
                {filteredCatalog.map(skill => {
                  const isSelected = selectedSkillIds.has(skill.id);
                  return (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => toggleSkill(skill.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors text-left ${
                        isSelected ? "bg-primary/5 font-medium" : "hover:bg-muted"
                      }`}
                    >
                      <span>
                        {skill.name}
                        <span className="ml-2 text-xs text-muted-foreground">{skill.category}</span>
                      </span>
                      {isSelected ? (
                        <X className="h-4 w-4 text-destructive" />
                      ) : (
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-10">No skills found</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground text-right">{selectedCount}/20 selected</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isProcessing}>
            {isProcessing ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
