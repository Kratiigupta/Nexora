/** Minimal loading — thin progress bar for instant render. */
export default function ProfileLoading() {
  return (
    <div className="w-full">
      <div className="h-0.5 w-full bg-muted overflow-hidden rounded-full">
        <div className="h-full w-1/3 bg-primary rounded-full"
          style={{ animation: "shimmer 1.2s ease-in-out infinite" }}
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
