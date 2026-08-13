import { Badge } from "@/components/ui/badge";
import { SkillExchangeStatus } from "@/types/skillExchange";
import { cn } from "@/lib/utils";

interface SkillExchangeStatusBadgeProps {
  status: SkillExchangeStatus;
  className?: string;
}

export function SkillExchangeStatusBadge({ status, className }: SkillExchangeStatusBadgeProps) {
  const statusConfig: Record<SkillExchangeStatus, { label: string; className: string }> = {
    requested: { label: "Requested", className: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20" },
    accepted: { label: "Accepted", className: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20" },
    in_progress: { label: "In Progress", className: "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20" },
    completed: { label: "Completed", className: "bg-green-500/10 text-green-500 hover:bg-green-500/20" },
    cancelled: { label: "Cancelled", className: "bg-red-500/10 text-red-500 hover:bg-red-500/20" },
  };

  const config = statusConfig[status] || { label: status, className: "bg-gray-500/10 text-gray-500" };

  return (
    <Badge variant="outline" className={cn("font-medium border-0", config.className, className)}>
      {config.label}
    </Badge>
  );
}
