import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, BookOpen, Star, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";
import type { SkillExchangeSession } from "@/types/skillExchange";
import { SkillExchangeStatusBadge } from "./SkillExchangeStatusBadge";

interface SkillExchangeCardProps {
  session: SkillExchangeSession;
  currentUserId: string;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
  onComplete?: (id: string) => void;
  onSchedule?: (id: string) => void;
  onRate?: (id: string) => void;
  onView?: (id: string) => void;
}

export function SkillExchangeCard({
  session,
  currentUserId,
  onAccept,
  onReject,
  onCancel,
  onComplete,
  onSchedule,
  onRate,
  onView,
}: SkillExchangeCardProps) {
  const isMentor = session.mentorId === currentUserId;
  const participant = isMentor ? session.mentee : session.mentor;
  const roleLabel = isMentor ? "Mentee" : "Mentor";

  // Determine actions
  const canAccept = isMentor && session.status === "requested";
  const canReject = isMentor && session.status === "requested";
  const canCancel = session.status !== "completed" && session.status !== "cancelled";
  const canComplete = session.status === "accepted" || session.status === "in_progress";
  const canSchedule = session.status !== "completed" && session.status !== "cancelled";
  const canRate = !isMentor && session.status === "completed" && session.rating === null;

  return (
    <Card className="hover:shadow-md transition-all">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border shadow-sm">
              <AvatarImage src={participant?.avatarUrl || undefined} alt={participant?.fullName} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {getInitials(participant?.fullName || "User")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold leading-none">{participant?.fullName}</h3>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                  {roleLabel}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">@{participant?.username}</p>
            </div>
          </div>
          <SkillExchangeStatusBadge status={session.status} />
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{session.skill?.name}</span>
            <span className="text-muted-foreground text-xs">({session.skill?.category})</span>
          </div>

          {session.scheduledAt && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(session.scheduledAt).toLocaleString()}</span>
            </div>
          )}

          {!session.scheduledAt && session.status !== "completed" && session.status !== "cancelled" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Not scheduled yet</span>
            </div>
          )}

          {session.rating && (
            <div className="flex items-center gap-2 text-sm text-amber-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="font-medium">{session.rating} / 5</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 justify-end">
          {onView && (
            <Button variant="outline" size="sm" onClick={() => onView(session.id)}>
              View Details
            </Button>
          )}

          {canAccept && onAccept && (
            <Button size="sm" onClick={() => onAccept(session.id)}>
              Accept
            </Button>
          )}

          {canRate && onRate && (
            <Button size="sm" onClick={() => onRate(session.id)}>
              Rate Session
            </Button>
          )}

          {(canReject || canCancel || canComplete || canSchedule) && (
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground h-8 w-8 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canSchedule && onSchedule && (
                  <DropdownMenuItem onClick={() => onSchedule(session.id)}>
                    <Calendar className="mr-2 h-4 w-4" /> Schedule
                  </DropdownMenuItem>
                )}
                {canComplete && onComplete && (
                  <DropdownMenuItem onClick={() => onComplete(session.id)}>
                    <BookOpen className="mr-2 h-4 w-4" /> Mark Completed
                  </DropdownMenuItem>
                )}
                {canReject && onReject && (
                  <DropdownMenuItem onClick={() => onReject(session.id)} className="text-destructive">
                    Reject Request
                  </DropdownMenuItem>
                )}
                {canCancel && onCancel && !canReject && (
                  <DropdownMenuItem onClick={() => onCancel(session.id)} className="text-destructive">
                    Cancel Session
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
