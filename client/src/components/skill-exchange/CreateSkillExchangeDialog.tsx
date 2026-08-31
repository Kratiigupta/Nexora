import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { profileService } from "@/lib/services/profile.service";
import { skillExchangeService } from "@/lib/services/skillExchange.service";
import type { PublicProfile } from "@/types/user";

interface CreateSkillExchangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentorUsername: string | null;
  onSuccess?: () => void;
}

export function CreateSkillExchangeDialog({
  open,
  onOpenChange,
  mentorUsername,
  onSuccess,
}: CreateSkillExchangeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  
  const [skillId, setSkillId] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  const loadProfile = useCallback(async (username: string) => {
    setLoading(true);
    try {
      const data = await profileService.getPublicProfile(username);
      setProfile(data);
      // Auto-select first skill if available
      if (data.skills && data.skills.length > 0) {
        setSkillId(data.skills[0].skillId);
      }
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Failed to load mentor profile");
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }, [onOpenChange]);

  useEffect(() => {
    if (open && mentorUsername) {
      void Promise.resolve().then(() => loadProfile(mentorUsername));
    } else {
      void Promise.resolve().then(() => {
        setProfile(null);
        setSkillId("");
        setDescription("");
        setScheduledAt("");
      });
    }
  }, [open, mentorUsername, loadProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!skillId) {
      toast.error("Please select a skill to learn");
      return;
    }

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        mentorId: profile.id,
        skillId,
      };

      if (description) payload.description = description;
      if (scheduledAt) {
        const dateObj = new Date(scheduledAt);
        payload.scheduledAt = dateObj.toISOString();
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await skillExchangeService.createSession(payload as any);
      toast.success("Mentorship request sent successfully!");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      const e = error as { response?: { data?: { error?: { message?: string }, message?: string } } };
      toast.error(e.response?.data?.error?.message || e.response?.data?.message || "Failed to send request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Mentorship</DialogTitle>
          <DialogDescription>
            {profile ? `Ask ${profile.fullName} to mentor you in a specific skill.` : "Loading mentor details..."}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-6 flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : profile ? (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="skill">Skill to Learn <span className="text-destructive">*</span></Label>
              <Select value={skillId} onValueChange={(val: string | null) => setSkillId(val || "")} required>
                <SelectTrigger id="skill">
                  <SelectValue placeholder="Select a skill" />
                </SelectTrigger>
                <SelectContent>
                  {profile.skills?.map((s) => (
                    <SelectItem key={s.skillId} value={s.skillId}>
                      {s.skill.name} ({s.proficiency})
                    </SelectItem>
                  ))}
                  {(!profile.skills || profile.skills.length === 0) && (
                    <SelectItem value="none" disabled>
                      No skills listed
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Message (Optional)</Label>
              <Textarea
                id="description"
                placeholder="What would you like to learn or focus on?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none"
                rows={3}
                maxLength={1000}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Proposed Time (Optional)</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || !skillId}>
                {submitting ? "Sending..." : "Send Request"}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
