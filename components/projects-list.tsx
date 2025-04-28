import { format } from "date-fns";
import type { Project } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface ProjectsListProps {
  projects: Project[];
  onDeleteProject?: (projectId: string) => void;
}

export function ProjectsList({ projects, onDeleteProject }: ProjectsListProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground font-mono">
        No projects yet. Add your first project!
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {projects.map((project) => (
        <li
          key={project.id}
          className="flex justify-between items-center group cursor-pointer"
        >
          <p className="font-mono">{project.name}</p>
          <div className="flex items-center">
            <p className="font-mono opacity-50 group-hover:hidden">
              {format(project.dueDate, "d MMM")} - {project.remainingHours}h/
              {project.totalHours}h
            </p>
            {onDeleteProject && (
              <Button
                className="text-destructive hidden group-hover:block text-base !m-0 !p-0 h-[24px] bg-transparent"
                variant="link"
                title="Delete project"
                onClick={() => onDeleteProject(project.id)}
              >
                Delete
              </Button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
