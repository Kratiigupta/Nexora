"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SkillExchangeList } from "@/components/skill-exchange/SkillExchangeList";
import { MentorCard } from "@/components/skill-exchange/MentorCard";
import { CreateSkillExchangeDialog } from "@/components/skill-exchange/CreateSkillExchangeDialog";
import { ScheduleSessionDialog } from "@/components/skill-exchange/ScheduleSessionDialog";
import { RateSessionDialog } from "@/components/skill-exchange/RateSessionDialog";
import { skillExchangeService } from "@/lib/services/skillExchange.service";
import { profileService } from "@/lib/services/profile.service";
import { useAuthStore } from "@/stores/authStore";
import type { SkillExchangeSession } from "@/types/skillExchange";
import type { TeammateRecommendation } from "@/types/dashboard";
import { toast } from "sonner";
import { ArrowLeftRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SkillExchangePage() {
  const { profile } = useAuthStore();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("discover");
  
  // Data
  const [mentors, setMentors] = useState<TeammateRecommendation[]>([]);
  const [sessions, setSessions] = useState<SkillExchangeSession[]>([]);
  
  // Loading states
  const [loadingMentors, setLoadingMentors] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // Dialogs
  const [requestMentor, setRequestMentor] = useState<string | null>(null);
  const [scheduleSessionId, setScheduleSessionId] = useState<string | null>(null);
  const [scheduleSessionCurrent, setScheduleSessionCurrent] = useState<string | null>(null);
  const [rateSessionId, setRateSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === "discover") {
      fetchMentors();
    } else {
      fetchSessions();
    }
  }, [activeTab]);

  const fetchMentors = async () => {
    setLoadingMentors(true);
    try {
      const data = await profileService.getRecommendedTeammates();
      setMentors(data);
    } catch (error) {
      toast.error("Failed to load mentors");
    } finally {
      setLoadingMentors(false);
    }
  };

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const data = await skillExchangeService.getSessions(1, 100);
      setSessions(data.data);
    } catch (error) {
      toast.error("Failed to load sessions");
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleAction = async (action: () => Promise<any>, successMessage: string) => {
    try {
      await action();
      toast.success(successMessage);
      fetchSessions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Action failed");
    }
  };

  const currentUserId = profile?.id || "";

  // Filter sessions
  const incomingRequests = sessions.filter(s => s.mentorId === currentUserId && s.status === "requested");
  const myRequests = sessions.filter(s => s.menteeId === currentUserId && s.status === "requested");
  const activeSessions = sessions.filter(s => s.status === "accepted" || s.status === "in_progress");
  const completedSessions = sessions.filter(s => s.status === "completed" || s.status === "cancelled");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ArrowLeftRight className="h-8 w-8 text-primary" />
            Skill Exchange
          </h1>
          <p className="text-muted-foreground mt-1">
            Connect with peers, learn new skills, and share your expertise.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full max-w-3xl flex overflow-x-auto h-auto py-1 px-1 no-scrollbar justify-start sm:justify-start">
          <TabsTrigger value="discover" className="flex-1 whitespace-nowrap">Discover Mentors</TabsTrigger>
          <TabsTrigger value="incoming" className="flex-1 whitespace-nowrap">
            Incoming Requests {incomingRequests.length > 0 && <span className="ml-2 bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs">{incomingRequests.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="outgoing" className="flex-1 whitespace-nowrap">My Requests</TabsTrigger>
          <TabsTrigger value="active" className="flex-1 whitespace-nowrap">Active Sessions</TabsTrigger>
          <TabsTrigger value="history" className="flex-1 whitespace-nowrap">History</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="discover" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            {loadingMentors ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 rounded-xl border bg-card/50 animate-pulse" />
                ))}
              </div>
            ) : mentors.length === 0 ? (
              <div className="text-center p-12 border rounded-xl bg-card/50 border-dashed">
                <p className="text-muted-foreground">No mentors found right now. Check back later!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mentors.map((mentor) => (
                  <MentorCard
                    key={mentor.id}
                    mentor={mentor}
                    onRequestSession={setRequestMentor}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="incoming" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            <SkillExchangeList
              sessions={incomingRequests}
              currentUserId={currentUserId}
              loading={loadingSessions}
              emptyMessage="You have no incoming mentorship requests."
              onAccept={(id) => handleAction(() => skillExchangeService.acceptSession(id), "Request accepted!")}
              onReject={(id) => handleAction(() => skillExchangeService.rejectSession(id), "Request rejected.")}
              onView={(id) => router.push(`/skill-exchange/${id}`)}
            />
          </TabsContent>

          <TabsContent value="outgoing" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            <SkillExchangeList
              sessions={myRequests}
              currentUserId={currentUserId}
              loading={loadingSessions}
              emptyMessage="You haven't requested any mentorship sessions yet."
              onCancel={(id) => handleAction(() => skillExchangeService.cancelSession(id), "Request cancelled.")}
              onView={(id) => router.push(`/skill-exchange/${id}`)}
            />
          </TabsContent>

          <TabsContent value="active" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            <SkillExchangeList
              sessions={activeSessions}
              currentUserId={currentUserId}
              loading={loadingSessions}
              emptyMessage="You have no active mentorship sessions."
              onCancel={(id) => handleAction(() => skillExchangeService.cancelSession(id), "Session cancelled.")}
              onComplete={(id) => handleAction(() => skillExchangeService.completeSession(id), "Session marked as completed!")}
              onSchedule={(id) => {
                const session = activeSessions.find(s => s.id === id);
                setScheduleSessionCurrent(session?.scheduledAt || null);
                setScheduleSessionId(id);
              }}
              onView={(id) => router.push(`/skill-exchange/${id}`)}
            />
          </TabsContent>

          <TabsContent value="history" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            <SkillExchangeList
              sessions={completedSessions}
              currentUserId={currentUserId}
              loading={loadingSessions}
              emptyMessage="No completed or cancelled sessions yet."
              onRate={(id) => setRateSessionId(id)}
              onView={(id) => router.push(`/skill-exchange/${id}`)}
            />
          </TabsContent>
        </div>
      </Tabs>

      <CreateSkillExchangeDialog
        open={!!requestMentor}
        onOpenChange={(open) => !open && setRequestMentor(null)}
        mentorUsername={requestMentor}
        onSuccess={() => setActiveTab("outgoing")}
      />

      <ScheduleSessionDialog
        open={!!scheduleSessionId}
        onOpenChange={(open) => !open && setScheduleSessionId(null)}
        sessionId={scheduleSessionId}
        currentSchedule={scheduleSessionCurrent}
        onSuccess={fetchSessions}
      />

      <RateSessionDialog
        open={!!rateSessionId}
        onOpenChange={(open) => !open && setRateSessionId(null)}
        sessionId={rateSessionId}
        onSuccess={fetchSessions}
      />
    </div>
  );
}
