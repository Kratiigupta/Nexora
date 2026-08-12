"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SkillChip } from "./SkillChip";
import { PROFICIENCY_LEVELS } from "@/lib/constants";
import { Plus, Search } from "lucide-react";
import type { Skill } from "@/types/user";

/**
 * SkillsEditor — add/remove skills with search and proficiency selector.
 * Works with the master skill catalog from the backend.
 */

interface SkillEntry {
  skillId: string;
  proficiency: string;
  skill?: Skill;
}

interface SkillsEditorProps {
  skills: SkillEntry[];
  availableSkills: Skill[];
  onChange: (skills: SkillEntry[]) => void;
  maxSkills?: number;
  className?: string;
}

export function SkillsEditor({
  skills,
  availableSkills,
  onChange,
  maxSkills = 30,
  className,
}: SkillsEditorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProficiency, setSelectedProficiency] = useState<string>("intermediate");

  // Filter available skills not yet added
  const filteredSkills = availableSkills.filter(
    (skill) =>
      !skills.some((s) => s.skillId === skill.id) &&
      skill.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addSkill = (skill: Skill) => {
    if (skills.length >= maxSkills) return;
    onChange([
      ...skills,
      { skillId: skill.id, proficiency: selectedProficiency, skill },
    ]);
    setSearchQuery("");
  };

  const removeSkill = (skillId: string) => {
    onChange(skills.filter((s) => s.skillId !== skillId));
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Current skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((entry) => (
            <SkillChip
              key={entry.skillId}
              name={entry.skill?.name || entry.skillId}
              proficiency={entry.proficiency}
              onRemove={() => removeSkill(entry.skillId)}
              size="md"
            />
          ))}
        </div>
      )}

      {/* Add skill */}
      {skills.length < maxSkills && (
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills..."
              className="pl-9"
            />
          </div>
          <Select value={selectedProficiency} onValueChange={(val) => val && setSelectedProficiency(val)}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Proficiency" />
            </SelectTrigger>
            <SelectContent>
              {PROFICIENCY_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  <span className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", level.color)} />
                    {level.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Search results */}
      {searchQuery && filteredSkills.length > 0 && (
        <div className="rounded-lg border border-border/50 bg-card max-h-40 overflow-y-auto">
          {filteredSkills.slice(0, 10).map((skill) => (
            <button
              key={skill.id}
              onClick={() => addSkill(skill)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted/50 transition-colors text-left"
              type="button"
            >
              <span>
                {skill.name}
                <span className="ml-2 text-xs text-muted-foreground">
                  {skill.category}
                </span>
              </span>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}

      {searchQuery && filteredSkills.length === 0 && (
        <p className="text-xs text-muted-foreground px-1">
          No matching skills found.
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        {skills.length}/{maxSkills} skills added
      </p>
    </div>
  );
}
