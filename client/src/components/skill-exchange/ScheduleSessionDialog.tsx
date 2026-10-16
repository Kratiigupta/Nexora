import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { skillExchangeService } from "@/lib/services/skillExchange.service";
import { formatDateTimeLocal } from "@/lib/utils";

interface ScheduleSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string | null;
  currentSchedule: string | null;
  onSuccess?: () => void;
}

export function ScheduleSessionDialog({
  open,
  onOpenChange,
  sessionId,
  currentSchedule,
  onSuccess,
}: ScheduleSessionDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [scheduledAt, setScheduledAt] = useState(() => formatDateTimeLocal(currentSchedule));

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setScheduledAt(formatDateTimeLocal(currentSchedule));
    }
  }, [open, currentSchedule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !scheduledAt) return;

    const parsedDate = new Date(scheduledAt);
    if (isNaN(parsedDate.getTime())) {
      toast.error("Please enter a valid date and time");
      return;
    }

    setSubmitting(true);
    try {
      await skillExchangeService.scheduleSession(sessionId, {
        scheduledAt: parsedDate.toISOString(),
      });
      toast.success("Session scheduled successfully!");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Failed to schedule session");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule Session</DialogTitle>
          <DialogDescription>
            Propose or update the time for this mentorship session.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="scheduledAt">Date and Time <span className="text-destructive">*</span></Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={formatDateTimeLocal(new Date())}
              required
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !scheduledAt}>
              {submitting ? "Saving..." : "Save Schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
