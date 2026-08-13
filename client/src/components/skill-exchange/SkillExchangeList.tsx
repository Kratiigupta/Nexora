import { SkillExchangeCard } from "./SkillExchangeCard";
import type { SkillExchangeSession } from "@/types/skillExchange";
import { Skeleton } from "@/components/ui/skeleton";

interface SkillExchangeListProps {
  sessions: SkillExchangeSession[];
  currentUserId: string;
  loading?: boolean;
  emptyMessage?: string;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
  onComplete?: (id: string) => void;
  onSchedule?: (id: string) => void;
  onRate?: (id: string) => void;
  onView?: (id: string) => void;
}

export function SkillExchangeList({
  sessions,
  currentUserId,
  loading = false,
  emptyMessage = "No sessions found.",
  ...actions
}: SkillExchangeListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-4 w-40 mb-6" />
            <div className="flex justify-end">
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-card/50 border-dashed">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sessions.map((session) => (
        <SkillExchangeCard
          key={session.id}
          session={session}
          currentUserId={currentUserId}
          {...actions}
        />
      ))}
    </div>
  );
}
