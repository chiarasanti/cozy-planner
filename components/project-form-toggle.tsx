"use client"

import { useState } from "react"
import { PlusCircle, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddProjectForm } from "@/components/add-project-form"
import type { Project } from "@/lib/types"

interface ProjectFormToggleProps {
  onAddProject: (project: Project) => void
}

export function ProjectFormToggle({ onAddProject }: ProjectFormToggleProps) {
  const [showForm, setShowForm] = useState(false)

  const handleAddProject = (project: Project) => {
    onAddProject(project)
    setShowForm(false) // Hide the form after successful submission
  }

  return (
    <div className="pt-4 border-t">
      {showForm ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-mono">Add New Project</p>
            <Button variant="link" onClick={() => setShowForm(false)} className="h-8 w-8 p-0">
              <ChevronUp className="h-4 w-4" />
              <span className="sr-only">Close form</span>
            </Button>
          </div>
          <AddProjectForm onAddProject={handleAddProject} />
        </div>
      ) : (
        <Button
          variant="secondary"
          className="w-full text-primary hover:text-primary hover:bg-primary/10 mt-2 font-mono justify-center"
          onClick={() => setShowForm(true)}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Project
        </Button>
      )}
    </div>
  )
}
