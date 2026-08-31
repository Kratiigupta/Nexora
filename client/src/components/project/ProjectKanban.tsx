"use client";

import { useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskCard } from "./TaskCard";
import { CreateTaskDialog } from "./CreateTaskDialog";
import type { Project, ProjectTask } from "@/types/project";


interface ProjectKanbanProps {
  project: Project;
  canManage: boolean;
  onTaskCreated: (task: ProjectTask) => void;
  onTaskUpdated: (taskId: string, newStatus: string) => Promise<void>;
  onTaskDeleted: (taskId: string) => void;
  onTaskEdit: (task: ProjectTask) => void;
}

const KANBAN_COLUMNS = [
  { id: "todo", title: "To Do", color: "bg-slate-500" },
  { id: "in_progress", title: "In Progress", color: "bg-blue-500" },
  { id: "in_review", title: "In Review", color: "bg-purple-500" },
  { id: "done", title: "Done", color: "bg-green-500" },
] as const;

export function ProjectKanban({
  project,
  canManage,
  onTaskCreated,
  onTaskUpdated,
  onTaskDeleted,
  onTaskEdit,
}: ProjectKanbanProps) {
  
  const tasksByColumn = useMemo(() => {
    const grouped: Record<string, ProjectTask[]> = {
      todo: [],
      in_progress: [],
      in_review: [],
      done: [],
    };
    
    project.tasks?.forEach((task) => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });
    
    return grouped;
  }, [project.tasks]);

  return (
    <div className="h-full flex-1 w-full overflow-hidden">
      <div className="h-full w-full pb-4 overflow-x-auto whitespace-nowrap">
        <div className="flex gap-4 h-full min-h-[500px] p-1 inline-flex">
          {KANBAN_COLUMNS.map((column) => (
            <div key={column.id} className="w-[300px] flex flex-col h-full bg-muted/30 rounded-xl overflow-hidden shrink-0">
              <div className="p-3 border-b flex items-center justify-between bg-card shrink-0">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${column.color}`} />
                  <h3 className="font-semibold text-sm">{column.title}</h3>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {tasksByColumn[column.id].length}
                  </span>
                </div>
                
                {canManage && (
                  <CreateTaskDialog 
                    project={project} 
                    onSuccess={onTaskCreated} 
                    initialStatus={column.id as "todo" | "in_progress" | "in_review" | "done"}
                    trigger={
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Plus className="h-4 w-4" />
                      </Button>
                    }
                  />
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <div className="p-3 flex flex-col gap-3 min-h-[150px]">
                  {tasksByColumn[column.id].length === 0 ? (
                    <div className="h-full flex-1 flex flex-col items-center justify-center text-center p-4 py-8 border-2 border-dashed border-muted rounded-lg opacity-50">
                      <p className="text-xs text-muted-foreground">No tasks here</p>
                    </div>
                  ) : (
                    tasksByColumn[column.id].map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        canManage={canManage}
                        onUpdateStatus={onTaskUpdated}
                        onDelete={canManage ? onTaskDeleted : undefined}
                        onEdit={canManage ? onTaskEdit : undefined}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
