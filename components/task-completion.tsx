"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import type { Task } from "@/lib/types"

interface TaskCompletionProps {
  task: Task
  isOpen: boolean
  onClose: () => void
  onComplete: (taskId: string, hoursWorked: number) => void
}

export function TaskCompletion({ task, isOpen, onClose, onComplete }: TaskCompletionProps) {
  const [hoursWorked, setHoursWorked] = useState<number>(task.hours)
  const [error, setError] = useState<string | null>(null)

  const handleComplete = () => {
    if (hoursWorked <= 0) {
      setError("Hours must be greater than 0")
      return
    }

    if (hoursWorked > task.hours) {
      setError(`Maximum hours for this task is ${task.hours}`)
      return
    }

    onComplete(task.id, hoursWorked)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-mono">Complete Task</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-4">
            <h3 className="font-medium text-lg font-mono">{task.projectName}</h3>
            <p className="text-sm text-muted-foreground font-mono">Scheduled: {task.hours} hours</p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive p-2 rounded text-sm mb-4 font-mono">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="hours-worked" className="font-mono">
              Hours worked
            </Label>
            <Input
              id="hours-worked"
              type="number"
              min={0}
              max={task.hours}
              step={0.5}
              value={hoursWorked}
              onChange={(e) => {
                setHoursWorked(Number.parseFloat(e.target.value) || 0)
                setError(null)
              }}
              className="font-mono"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="font-mono">
            Cancel
          </Button>
          <Button onClick={handleComplete} className="font-mono">
            Complete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
