import { Skeleton } from "@/components/ui/skeleton";

export default function MessagesLoading() {
  return (
    <div className="flex h-[calc(100vh-10rem)] rounded-xl border border-border/50 overflow-hidden animate-in fade-in duration-300">
      {/* Conversation list sidebar */}
      <div className="w-80 border-r border-border/50 bg-card/80 flex flex-col">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
        <div className="flex-1 overflow-hidden p-2 space-y-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg p-3"
            >
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-10" />
                </div>
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-background">
        <div className="p-4 border-b border-border/50 flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {/* Placeholder messages */}
          <div className="flex justify-start">
            <Skeleton className="h-12 w-48 rounded-2xl rounded-bl-sm" />
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-10 w-36 rounded-2xl rounded-br-sm" />
          </div>
          <div className="flex justify-start">
            <Skeleton className="h-16 w-56 rounded-2xl rounded-bl-sm" />
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-10 w-44 rounded-2xl rounded-br-sm" />
          </div>
        </div>
        <div className="p-4 border-t border-border/50">
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
