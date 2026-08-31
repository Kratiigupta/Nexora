import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { skillExchangeService } from "@/lib/services/skillExchange.service";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RateSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string | null;
  onSuccess?: () => void;
}

export function RateSessionDialog({
  open,
  onOpenChange,
  sessionId,
  onSuccess,
}: RateSessionDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) return;
    if (rating === 0) {
      toast.error("Please provide a rating from 1 to 5");
      return;
    }

    setSubmitting(true);
    try {
      await skillExchangeService.rateSession(sessionId, {
        rating,
        feedback: feedback || undefined,
      });
      toast.success("Rating submitted successfully!");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rate Session</DialogTitle>
          <DialogDescription>
            How was your mentorship session? Your feedback helps mentors improve.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-3">
            <Label>Rating <span className="text-destructive">*</span></Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none transition-colors"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <Star
                    className={cn(
                      "h-8 w-8 transition-colors",
                      (hoverRating || rating) >= star
                        ? "fill-amber-500 text-amber-500"
                        : "text-muted-foreground fill-transparent"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">Feedback (Optional)</Label>
            <Textarea
              id="feedback"
              placeholder="What did you learn? Was the mentor helpful?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="resize-none"
              rows={3}
              maxLength={1000}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || rating === 0}>
              {submitting ? "Submitting..." : "Submit Rating"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
