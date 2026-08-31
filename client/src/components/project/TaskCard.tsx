"use client";

import { useState } from "react";
import { Calendar, MoreVertical, Trash2, Edit2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProjectTask } from "@/types/project";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: ProjectTask;
  canManage: boolean;
  onUpdateStatus: (taskId: string, newStatus: string) => Promise<void>;
  onDelete?: (taskId: string) => void;
  onEdit?: (task: ProjectTask) => void;
}

export function TaskCard({ task, canManage, onUpdateStatus, onDelete, onEdit }: TaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string | null) => {
    if (!newStatus || newStatus === task.status) return;
    setIsUpdating(true);
    try {
      await onUpdateStatus(task.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "text-red-500 bg-red-500/10 border-red-500/20";
      case "high": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "medium": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "low": return "text-gray-500 bg-gray-500/10 border-gray-500/20";
      default: return "";
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

  return (
    <Card className={cn(
      "relative group transition-shadow hover:shadow-md cursor-grab active:cursor-grabbing",
      isUpdating ? "opacity-50 pointer-events-none" : ""
    )}>
      <CardContent className="p-3">
        <div className="flex justify-between items-start gap-2 mb-2">
          <Badge variant="outline" className={cn("text-[10px] capitalize h-5 px-1.5", getPriorityColor(task.priority))}>
            {task.priority}
          </Badge>
          
          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger className={cn("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-6 w-6 -mr-1 opacity-0 group-hover:opacity-100")}>
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(task)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {onDelete && (
                  <DropdownMenuItem onClick={() => onDelete(task.id)} variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <h4 className="font-medium text-sm leading-tight mb-1">
          {task.title}
        </h4>
        
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-3 gap-2">
          <div className="flex items-center gap-2">
            {task.assignee ? (
              <Avatar className="h-5 w-5 border" title={task.assignee.fullName}>
                <AvatarImage src={task.assignee.avatarUrl || undefined} />
                <AvatarFallback className="text-[8px] bg-primary/20 text-primary">
                  {task.assignee.fullName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-5 w-5 rounded-full border border-dashed border-muted-foreground/50 flex items-center justify-center bg-muted/30" title="Unassigned">
                <span className="text-[8px] text-muted-foreground">?</span>
              </div>
            )}
            
            {task.dueDate && (
              <div className={cn(
                "flex items-center text-[10px] gap-1",
                isOverdue ? "text-red-500 font-medium" : "text-muted-foreground"
              )}>
                {isOverdue ? <AlertCircle className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
                {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
            )}
          </div>

          <div className="w-[100px]">
            <Select 
              value={task.status} 
              onValueChange={handleStatusChange}
              disabled={!canManage || isUpdating}
            >
              <SelectTrigger className="h-6 text-[10px] border-none shadow-none bg-muted/30 hover:bg-muted/50 focus:ring-0 px-2 py-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo" className="text-xs">To Do</SelectItem>
                <SelectItem value="in_progress" className="text-xs">In Progress</SelectItem>
                <SelectItem value="in_review" className="text-xs">In Review</SelectItem>
                <SelectItem value="done" className="text-xs">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
