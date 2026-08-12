"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

/**
 * InterestsEditor — add/remove interest tags with text input.
 * Tags are simple strings, stored as a string array on the profile.
 */

interface InterestsEditorProps {
  interests: string[];
  onChange: (interests: string[]) => void;
  maxInterests?: number;
  className?: string;
}

export function InterestsEditor({
  interests,
  onChange,
  maxInterests = 20,
  className,
}: InterestsEditorProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addInterest = (value: string) => {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return;
    if (trimmed.length > 50) return;
    if (interests.includes(trimmed)) return;
    if (interests.length >= maxInterests) return;

    onChange([...interests, trimmed]);
    setInputValue("");
  };

  const removeInterest = (interest: string) => {
    onChange(interests.filter((i) => i !== interest));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addInterest(inputValue);
    }
    if (e.key === "Backspace" && !inputValue && interests.length > 0) {
      removeInterest(interests[interests.length - 1]);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "flex flex-wrap gap-1.5 rounded-lg border border-input bg-background p-2 min-h-[42px]",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background"
        )}
        onClick={() => inputRef.current?.focus()}
        role="group"
        aria-label="Interests"
      >
        {interests.map((interest) => (
          <span
            key={interest}
            className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium"
          >
            {interest}
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeInterest(interest);
              }}
              className="rounded-full p-0.5 hover:bg-destructive/20 hover:text-destructive transition-colors"
              aria-label={`Remove ${interest}`}
              type="button"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (inputValue) addInterest(inputValue);
          }}
          placeholder={interests.length === 0 ? "Type an interest and press Enter" : "Add more..."}
          className="flex-1 min-w-[120px] border-0 p-0 h-7 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent shadow-none"
          disabled={interests.length >= maxInterests}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {interests.length}/{maxInterests} interests · Press Enter or comma to add
      </p>
    </div>
  );
}
