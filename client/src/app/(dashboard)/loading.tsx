/**
 * Fallback loading state for the (dashboard) route group.
 * Intentionally minimal — renders in <1ms so route transitions feel instant.
 * Heavy skeleton UIs add perceived latency; a thin progress bar is better UX.
 */
export default function DashboardGroupLoading() {
  return (
    <div className="w-full">
      {/* Thin animated progress bar at the top */}
      <div className="h-0.5 w-full bg-muted overflow-hidden rounded-full">
        <div className="h-full w-1/3 bg-primary rounded-full animate-[shimmer_1s_ease-in-out_infinite]" 
          style={{
            animation: "shimmer 1.2s ease-in-out infinite",
          }}
        />
      </div>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}
