"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { skillExchangeService } from "@/lib/services/skillExchange.service";
import type { SkillExchangeSession } from "@/types/skillExchange";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BookOpen, Calendar, Clock, Star, AlertCircle } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { SkillExchangeStatusBadge } from "@/components/skill-exchange/SkillExchangeStatusBadge";
import { ScheduleSessionDialog } from "@/components/skill-exchange/ScheduleSessionDialog";
import { RateSessionDialog } from "@/components/skill-exchange/RateSessionDialog";

export default function SessionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const { profile } = useAuthStore();

  const [session, setSession] = useState<SkillExchangeSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialogs
  const [showSchedule, setShowSchedule] = useState(false);
  const [showRating, setShowRating] = useState(false);

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  const fetchSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await skillExchangeService.getSessionById(sessionId);
      setSession(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load session details");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: () => Promise<any>, successMessage: string) => {
    try {
      await action();
      toast.success(successMessage);
      fetchSession();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-1/3 mb-6" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[50vh]">
        <AlertCircle className="h-12 w-12 text-destructive mb-4 opacity-50" />
        <h2 className="text-xl font-semibold mb-2">Session Not Found</h2>
        <p className="text-muted-foreground mb-6">{error || "The session you are looking for does not exist."}</p>
        <Button onClick={() => router.push("/skill-exchange")}>Back to Skill Exchange</Button>
      </div>
    );
  }

  const currentUserId = profile?.id || "";
  const isMentor = session.mentorId === currentUserId;
  const isMentee = session.menteeId === currentUserId;

  const otherParticipant = isMentor ? session.mentee : session.mentor;
  const otherRole = isMentor ? "Mentee" : "Mentor";
  const myRole = isMentor ? "Mentor" : "Mentee";

  // Action Flags
  const canAccept = isMentor && session.status === "requested";
  const canReject = isMentor && session.status === "requested";
  const canCancel = session.status !== "completed" && session.status !== "cancelled";
  const canComplete = session.status === "accepted" || session.status === "in_progress";
  const canSchedule = session.status !== "completed" && session.status !== "cancelled";
  const canRate = isMentee && session.status === "completed" && session.rating === null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button variant="ghost" className="pl-0 -ml-2 text-muted-foreground hover:text-foreground" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Session Details
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your mentorship session and schedule.
          </p>
        </div>
        <SkillExchangeStatusBadge status={session.status} className="text-sm px-3 py-1" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-lg">Session Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Skill</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-lg">{session.skill?.name}</span>
                      <Badge variant="outline">{session.skill?.category}</Badge>
                    </div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Schedule</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span className="font-medium">
                        {session.scheduledAt ? new Date(session.scheduledAt).toLocaleString() : "Not scheduled yet"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Description / Message</Label>
                <div className="mt-2 p-4 bg-muted/30 rounded-lg text-sm border border-border/50">
                  {session.description ? (
                    <p className="whitespace-pre-wrap">{session.description}</p>
                  ) : (
                    <p className="text-muted-foreground italic">No description provided.</p>
                  )}
                </div>
              </div>

              {session.status === "completed" && (
                <div className="pt-4 border-t">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Rating & Feedback</Label>
                  <div className="mt-2 p-4 bg-amber-500/5 rounded-lg border border-amber-500/20">
                    {session.rating ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-1 text-amber-500">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`h-5 w-5 ${star <= session.rating! ? "fill-current" : "fill-transparent text-muted-foreground/30"}`} />
                          ))}
                        </div>
                        {session.feedback && (
                          <p className="text-sm italic text-muted-foreground">"{session.feedback}"</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No rating provided yet.</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="bg-muted/30 border-b pb-4">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Participants</CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y">
              {/* Other Participant */}
              <div className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => router.push(`/profile/${otherParticipant?.username}`)}>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={otherParticipant?.avatarUrl || undefined} />
                    <AvatarFallback>{getInitials(otherParticipant?.fullName || "U")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm leading-tight">{otherParticipant?.fullName}</p>
                    <p className="text-xs text-muted-foreground">@{otherParticipant?.username}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px]">{otherRole}</Badge>
              </div>
              
              {/* Current User */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={profile?.avatarUrl || undefined} />
                    <AvatarFallback>{getInitials(profile?.fullName || "U")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm leading-tight">{profile?.fullName} (You)</p>
                    <p className="text-xs text-muted-foreground">@{profile?.username}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px]">{myRole}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-muted/30 border-b pb-4">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-3">
              {canAccept && (
                <Button onClick={() => handleAction(() => skillExchangeService.acceptSession(sessionId), "Request accepted")}>
                  Accept Request
                </Button>
              )}
              {canReject && (
                <Button variant="destructive" onClick={() => handleAction(() => skillExchangeService.rejectSession(sessionId), "Request rejected")}>
                  Reject Request
                </Button>
              )}
              {canSchedule && (
                <Button variant="outline" onClick={() => setShowSchedule(true)}>
                  <Calendar className="mr-2 h-4 w-4" /> Schedule Session
                </Button>
              )}
              {canComplete && (
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAction(() => skillExchangeService.completeSession(sessionId), "Session completed")}>
                  <BookOpen className="mr-2 h-4 w-4" /> Mark Completed
                </Button>
              )}
              {canRate && (
                <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={() => setShowRating(true)}>
                  <Star className="mr-2 h-4 w-4" /> Rate Session
                </Button>
              )}
              {canCancel && !canReject && (
                <Button variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20" onClick={() => handleAction(() => skillExchangeService.cancelSession(sessionId), "Session cancelled")}>
                  Cancel Session
                </Button>
              )}
              {!canAccept && !canReject && !canSchedule && !canComplete && !canRate && !canCancel && (
                <p className="text-sm text-muted-foreground text-center italic py-2">No actions available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ScheduleSessionDialog
        open={showSchedule}
        onOpenChange={setShowSchedule}
        sessionId={sessionId}
        currentSchedule={session.scheduledAt}
        onSuccess={fetchSession}
      />

      <RateSessionDialog
        open={showRating}
        onOpenChange={setShowRating}
        sessionId={sessionId}
        onSuccess={fetchSession}
      />
    </div>
  );
}
