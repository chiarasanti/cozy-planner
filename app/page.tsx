"use client";

import { useState, useEffect } from "react";
import { format, isWeekend, isBefore, isToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ProjectsList } from "@/components/projects-list";
import { TaskCompletion } from "@/components/task-completion";
import { calculateDailyTasks } from "@/lib/task-calculator";
import { ProjectFormToggle } from "@/components/project-form-toggle";
import { ThemeSelector } from "@/components/theme-selector";
import { useTheme } from "@/lib/theme-context";
import { supabase } from "@/lib/supabase";
import type { Project, Task } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { DialogTitle } from "@/components/ui/dialog";

function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .order("due_date", { ascending: true });

        if (error) throw error;
        if (!data) return;

        const formattedProjects: Project[] = data.map((project) => ({
          id: project.id,
          name: project.name,
          dueDate: new Date(project.due_date),
          totalHours: Number(project.total_hours),
          remainingHours: Number(project.remaining_hours),
          createdAt: new Date(project.created_at),
        }));

        // Filter out inactive projects
        const today = new Date();
        const activeProjects = formattedProjects.filter(
          (project) => !isBefore(project.dueDate, today) || isToday(project.dueDate)
        );

        setProjects(activeProjects);
      } catch (error) {
        console.error("Failed to load projects:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProjects();
  }, []);

  const addProject = async (newProject: Project) => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .insert({
          id: newProject.id,
          name: newProject.name,
          due_date: newProject.dueDate.toISOString(),
          total_hours: newProject.totalHours,
          remaining_hours: newProject.remainingHours,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      const formattedProject: Project = {
        id: data.id,
        name: data.name,
        dueDate: new Date(data.due_date),
        totalHours: Number(data.total_hours),
        remainingHours: Number(data.remaining_hours),
        createdAt: new Date(data.created_at),
      };

      setProjects((prev) => [...prev, formattedProject]);
    } catch (error) {
      console.error("Failed to add project:", error);
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);
      if (error) throw error;
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  const updateProjectHours = async (projectId: string, remainingHours: number) => {
    try {
      const { error } = await supabase
        .from("projects")
        .update({
          remaining_hours: remainingHours,
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);

      if (error) throw error;
    } catch (error) {
      console.error("Failed to update project:", error);
    }
  };

  return { projects, setProjects, isLoading, addProject, deleteProject, updateProjectHours };
}

function useTasks(projects: Project[], isLoading: boolean) {
  const [todaysTasks, setTodaysTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (isLoading) return;

    const tasks = calculateDailyTasks(projects);
    setTodaysTasks(tasks.filter((task) => isToday(task.date)));
  }, [projects, isLoading]);

  const completeTask = (task: Task, hoursWorked: number) => {
    if (hoursWorked >= task.hours) {
      setCompletedTasks((prev) => {
        if (prev.some((t) => t.id === task.id)) return prev;
        return [...prev, task];
      });
    }
  };

  return { todaysTasks, completedTasks, completeTask };
}

export default function Home() {
  const { projects, setProjects, isLoading, addProject, deleteProject, updateProjectHours } = useProjects();
  const { todaysTasks, completedTasks, completeTask } = useTasks(projects, isLoading);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCompletionOpen, setIsCompletionOpen] = useState(false);
  const { getContainerBgColor, isLoading: isThemeLoading } = useTheme();

  const handleCompleteTask = async (taskId: string, hoursWorked: number) => {
    const task = todaysTasks.find((t) => t.id === taskId);
    if (!task) return;

    try {
      const updatedProjects = projects.map((project) => {
        if (project.id === task.projectId) {
          const newRemainingHours = Math.max(0, project.remainingHours - hoursWorked);
          return { ...project, remainingHours: newRemainingHours };
        }
        return project;
      });

      const updatedProject = updatedProjects.find((p) => p.id === task.projectId);
      if (!updatedProject) return;

      await updateProjectHours(updatedProject.id, updatedProject.remainingHours);
      completeTask(task, hoursWorked);
      setProjects(updatedProjects);
      setIsCompletionOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Failed to complete task:", error);
    }
  };

  const isWeekendToday = isWeekend(new Date());
  const showLoading = isLoading || isThemeLoading;

  if (showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 font-mono">Loading...</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen transition-colors duration-300 font-mono">
      <div className="container mx-auto p-4 w-full h-screen flex flex-col justify-between">
        <div className="flex w-full justify-between items-center mb-6">
          <p className="font-mono">{format(new Date(), "EEEE, MMMM d")}</p>
          <Sheet>
            <SheetTrigger asChild>
              <Button className="font-mono text-base" variant={"link"}>
                Projects
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="space-y-6 pt-12">
                <DialogTitle asChild>.</DialogTitle>
                <ProjectsList
                  projects={projects}
                  onDeleteProject={deleteProject}
                />
                <ProjectFormToggle onAddProject={addProject} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div
          className="transition-colors duration-300 w-[380px] min-h-[326px] px-[60px] py-20 mx-auto"
          style={getContainerBgColor()}
        >
          {isWeekendToday ? (
            <div className="py-8 text-center">
              <p className="text-xl font-medium font-mono">
                Weekend! No tasks scheduled.
              </p>
              <p className="text-muted-foreground mt-2 font-mono">
                Enjoy your time off!
              </p>
            </div>
          ) : todaysTasks.length > 0 ? (
            <ul className="space-y-3">
              {(() => {
                const mergedTasks = [
                  ...todaysTasks,
                  ...completedTasks.filter(
                    (ct) => !todaysTasks.some((t) => t.id === ct.id)
                  ),
                ];
                return mergedTasks.map((task) => {
                  const isCompleted = completedTasks.some((t) => t.id === task.id);
                  return (
                    <li key={task.id} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-3 h-5 w-5 cursor-pointer"
                        checked={isCompleted}
                        disabled={isCompleted}
                        onChange={() => {
                          if (!isCompleted) {
                            setSelectedTask(task);
                            setIsCompletionOpen(true);
                          }
                        }}
                      />
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => {
                          if (!isCompleted) {
                            setSelectedTask(task);
                            setIsCompletionOpen(true);
                          }
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <p
                            className={`font-mono ${
                              isCompleted ? "line-through text-muted-foreground" : ""
                            }`}
                          >
                            {task.projectName}
                          </p>
                          <p
                            className={`text-right font-mono opacity-50 ${
                              isCompleted ? "line-through opacity-50" : ""
                            }`}
                          >
                            {task.hours}h
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                });
              })()}
            </ul>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground font-mono">
                No tasks scheduled for today.
              </p>
            </div>
          )}
        </div>

        <ThemeSelector />

        {selectedTask && (
          <TaskCompletion
            task={selectedTask}
            isOpen={isCompletionOpen}
            onClose={() => {
              setIsCompletionOpen(false);
              setSelectedTask(null);
            }}
            onComplete={handleCompleteTask}
          />
        )}
      </div>
    </main>
  );
}
