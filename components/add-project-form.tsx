"use client";

import type React from "react";

import { useState } from "react";
import { addDays, isWeekend } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Clock, FolderPen } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Project } from "@/lib/types";
import { FormDescription } from "./ui/form";

interface AddProjectFormProps {
  onAddProject: (project: Project) => void;
}

export function AddProjectForm({ onAddProject }: AddProjectFormProps) {
  const [name, setName] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [hours, setHours] = useState<number>(2);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to get the next available weekday
  const getNextWeekday = (date: Date): Date => {
    let nextDay = new Date(date);
    while (isWeekend(nextDay)) {
      nextDay = addDays(nextDay, 1);
    }
    return nextDay;
  };

  // Function to disable weekends in the date picker
  const disableWeekends = (date: Date) => {
    return isWeekend(date);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!name.trim()) {
        setError("Project name is required");
        return;
      }

      if (!dueDate) {
        setError("Due date is required");
        return;
      }

      if (hours < 2) {
        setError("Minimum hours is 2");
        return;
      }

      const newProject: Project = {
        id: uuidv4(),
        name: name.trim(),
        dueDate,
        totalHours: hours,
        remainingHours: hours,
        createdAt: new Date(),
      };

      await onAddProject(newProject);

      // Reset form
      setName("");
      setDueDate(undefined);
      setHours(2);
      setError(null);
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("Failed to add project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {error && (
        <div className="bg-destructive/10 text-destructive p-2 rounded text-sm font-mono">
          {error}
        </div>
      )}

      <div className="relative">
        <Input
          id="project-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="font-mono pl-12"
          disabled={isSubmitting}
        />
        <FolderPen className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      <div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="due-date"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal font-mono",
                !dueDate && "text-muted-foreground"
              )}
              disabled={isSubmitting}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, "PPP") : <span>Due date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={(date) => {
                setDueDate(date);
              }}
              disabled={(date) => isWeekend(date) || isSubmitting}
              initialFocus
              className="font-mono"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="relative">
        <Input
          id="hours"
          type="number"
          min={2}
          value={hours}
          onChange={(e) => setHours(Number.parseInt(e.target.value) || 2)}
          className="font-mono pl-12"
          disabled={isSubmitting}
        />
        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      <Button
        type="submit"
        className="w-full font-mono"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Adding..." : "Add Project"}
      </Button>
    </form>
  );
}
