import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { skillExchangeService } from "@/lib/services/skillExchange.service";

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
  const [scheduledAt, setScheduledAt] = useState(() => {
    if (currentSchedule) {
      // slice(0,16) formats ISO string to yyyy-MM-ddThh:mm for datetime-local
      return new Date(currentSchedule).toISOString().slice(0, 16);
    }
    return "";
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !scheduledAt) return;

    setSubmitting(true);
    try {
      await skillExchangeService.scheduleSession(sessionId, {
        scheduledAt: new Date(scheduledAt).toISOString(),
      });
      toast.success("Session scheduled successfully!");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to schedule session");
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
              min={new Date().toISOString().slice(0, 16)}
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
