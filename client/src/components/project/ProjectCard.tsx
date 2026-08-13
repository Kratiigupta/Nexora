import Link from "next/link";
import { FolderKanban, Users, GitBranch, ExternalLink, ArrowRight } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Project } from "@/types/project";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20";
      case "in_progress":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20";
      case "on_hold":
        return "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/20";
      case "planning":
      default:
        return "bg-muted text-muted-foreground hover:bg-muted/80";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace("_", " ").toUpperCase();
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-md hover:border-primary/30 group/card">
      <CardHeader className="p-5 pb-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex gap-3 items-center min-w-0">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover/card:scale-110 transition-transform">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-lg leading-tight truncate" title={project.title}>
                {project.title}
              </h3>
              <div className="flex items-center text-xs text-muted-foreground mt-1 gap-2 truncate">
                {project.team ? (
                  <span className="flex items-center gap-1 truncate" title={project.team.name}>
                    <Users className="h-3 w-3 shrink-0" />
                    <span className="truncate">{project.team.name}</span>
                  </span>
                ) : (
                  <span>Personal Project</span>
                )}
              </div>
            </div>
          </div>
          <Badge variant="outline" className={`shrink-0 text-[10px] h-5 ${getStatusColor(project.status)}`}>
            {getStatusLabel(project.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-0 flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground line-clamp-2 text-balance flex-1">
          {project.description || "No description provided."}
        </p>
        
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
          <div className="flex gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-medium">Creator</span>
              <div className="flex items-center gap-1.5">
                <Avatar className="h-4 w-4">
                  <AvatarImage src={project.creator?.avatarUrl || undefined} />
                  <AvatarFallback className="text-[8px] bg-primary/20 text-primary">
                    {project.creator?.fullName.substring(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate max-w-[80px]">{project.creator?.username}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] uppercase font-medium">Tasks</span>
            <span className="font-medium text-foreground">{project._count?.tasks || 0}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0 mt-auto flex justify-between gap-2">
        <div className="flex gap-2">
          {project.repoUrl && (
            <a href={project.repoUrl} target="_blank" rel="noreferrer" title="Repository" className={buttonVariants({ variant: "outline", size: "icon", className: "h-8 w-8 rounded-md" })}>
              <GitBranch className="h-4 w-4" />
            </a>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noreferrer" title="Live Preview" className={buttonVariants({ variant: "outline", size: "icon", className: "h-8 w-8 rounded-md" })}>
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
        
        <Link href={`/projects/${project.id}`} className="flex-1 ml-auto">
          <Button variant="secondary" size="sm" className="w-full justify-between group h-8">
            Workspace
            <ArrowRight className="h-3.5 w-3.5 opacity-70 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
